import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Modal, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { colors, categoryEmojis, locationOptions } from '../constants/theme';
import { Search, X, Save, Trash2, Filter } from 'lucide-react-native';
import SharePicker from '../components/SharePicker';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { differenceInDays, parseISO } from 'date-fns';

const LOCATIONS = ['all', 'fridge', 'freezer', 'pantry', 'counter'];

export default function FridgeScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await api.get('/items');
      setItems(res.data);
    } catch (error) {
      console.error('Fetch items error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const openDetail = (item) => {
    setSelected(item);
    setEditForm({
      location: item.location || 'fridge',
      expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
      shared: item.shared || false,
      shared_with: item.shared_with || [],
    });
  };

  const saveDetail = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/items/${selected.id}`, editForm);
      Toast.show({ type: 'success', text1: 'Item updated' });
      setSelected(null);
      fetchItems();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not save' });
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/items/${id}`);
      Toast.show({ type: 'success', text1: 'Item deleted' });
      setSelected(null);
      fetchItems();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete' });
    }
  };

  const consumeItem = async (id) => {
    try {
      await api.post(`/items/${id}/consume`, { quantity: 1 });
      Toast.show({ type: 'success', text1: 'Item consumed' });
      setSelected(null);
      fetchItems();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not consume' });
    }
  };

  const getDaysUntilExpiry = (date) => {
    if (!date) return null;
    return differenceInDays(parseISO(date), new Date());
  };

  const getExpiryColor = (days) => {
    if (days === null) return colors.textDim;
    if (days < 0) return colors.danger;
    if (days <= 2) return colors.danger;
    if (days <= 5) return colors.warn;
    return colors.textMuted;
  };

  const getExpiryLabel = (days) => {
    if (days === null) return '';
    if (days < 0) return `Expired ${Math.abs(days)}d ago`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days}d left`;
  };

  // Filter items
  const filtered = items.filter((item) => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Search bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border }}>
          <Search size={18} color={colors.textDim} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search items..."
            placeholderTextColor={colors.textDim}
            style={{ flex: 1, padding: 12, color: colors.text, fontSize: 15 }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={18} color={colors.textDim} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Location tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}>
        {LOCATIONS.map((loc) => (
          <TouchableOpacity
            key={loc}
            onPress={() => setLocationFilter(loc)}
            style={{
              backgroundColor: locationFilter === loc ? colors.accent : colors.card,
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: locationFilter === loc ? colors.accent : colors.border,
            }}
          >
            <Text style={{
              color: locationFilter === loc ? colors.bg : colors.textDim,
              fontSize: 13,
              fontWeight: '500',
              textTransform: 'capitalize',
            }}>
              {loc === 'all' ? `All (${items.length})` : loc}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Item list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchItems(); }} tintColor={colors.accent} />}
        renderItem={({ item }) => {
          const days = getDaysUntilExpiry(item.expiry_date);
          const expiryColor = getExpiryColor(days);
          return (
            <TouchableOpacity
              onPress={() => openDetail(item)}
              style={{
                backgroundColor: colors.card,
                marginHorizontal: 16,
                marginBottom: 8,
                borderRadius: 14,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 28, marginRight: 12 }}>{item.emoji || categoryEmojis[item.category] || categoryEmojis.other}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '500' }}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                  <Text style={{ color: colors.textDim, fontSize: 12 }}>{item.category}</Text>
                  {days !== null && (
                    <>
                      <Text style={{ color: colors.textDim, fontSize: 12 }}> {'\u2022'} </Text>
                      <Text style={{ color: expiryColor, fontSize: 12 }}>{getExpiryLabel(days)}</Text>
                    </>
                  )}
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.textDim, fontSize: 13 }}>x{item.quantity}</Text>
                <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 2, textTransform: 'capitalize' }}>{item.location}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{'\U0001f9ca'}</Text>
            <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text }}>
              {search ? 'No items match your search' : 'Your fridge is empty'}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textDim, marginTop: 4 }}>
              {search ? 'Try a different search' : 'Tap + to add your first item'}
            </Text>
          </View>
        )}
      />

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 32, marginRight: 12 }}>{selected?.emoji || categoryEmojis.other}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{selected?.name}</Text>
                    <Text style={{ fontSize: 13, color: colors.textDim }}>Qty: {selected?.quantity} {selected?.unit} {'\u2022'} {selected?.category}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelected(null)} style={{ padding: 4 }}>
                  <X size={24} color={colors.textDim} />
                </TouchableOpacity>
              </View>

              {/* Image */}
              {selected?.image_url && (
                <View style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.bg, height: 160, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: colors.textDim, fontSize: 13 }}>Image available on web</Text>
                </View>
              )}

              {/* Nutrition */}
              {selected?.calories && (
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                  {[
                    { label: 'Cal', value: selected.calories },
                    { label: 'Protein', value: selected.protein },
                    { label: 'Carbs', value: selected.carbs },
                    { label: 'Fat', value: selected.fat },
                  ].filter(n => n.value).map((n) => (
                    <View key={n.label} style={{ flex: 1, backgroundColor: colors.bg, borderRadius: 10, padding: 10, alignItems: 'center' }}>
                      <Text style={{ color: colors.textDim, fontSize: 11 }}>{n.label}</Text>
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 2 }}>{n.value}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Location picker */}
              <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Location</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                {locationOptions.map((loc) => (
                  <TouchableOpacity
                    key={loc.value}
                    onPress={() => setEditForm({ ...editForm, location: loc.value })}
                    style={{
                      flex: 1,
                      backgroundColor: editForm.location === loc.value ? colors.accent + '20' : colors.bg,
                      borderRadius: 10,
                      padding: 10,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: editForm.location === loc.value ? colors.accent : colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{loc.emoji}</Text>
                    <Text style={{ color: editForm.location === loc.value ? colors.accent : colors.textDim, fontSize: 11, marginTop: 4 }}>{loc.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Expiry date */}
              <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Expiry Date</Text>
              <TextInput
                value={editForm.expiry_date}
                onChangeText={(t) => setEditForm({ ...editForm, expiry_date: t })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textDim}
                style={{
                  backgroundColor: colors.bg,
                  borderRadius: 10,
                  padding: 14,
                  color: colors.text,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 20,
                }}
              />

              {/* Share picker */}
              <SharePicker
                selectedIds={editForm.shared_with || []}
                onChange={(ids) => setEditForm({ ...editForm, shared_with: ids, shared: ids.length > 0 })}
              />

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => consumeItem(selected?.id)}
                  style={{ flex: 1, backgroundColor: colors.accent + '20', borderRadius: 12, padding: 14, alignItems: 'center' }}
                >
                  <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 14 }}>Use</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteItem(selected?.id)}
                  style={{ flex: 1, backgroundColor: colors.dangerBg, borderRadius: 12, padding: 14, alignItems: 'center' }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Trash2 size={16} color={colors.danger} />
                    <Text style={{ color: colors.danger, fontWeight: '600', fontSize: 14, marginLeft: 6 }}>Delete</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Save button */}
              <TouchableOpacity
                onPress={saveDetail}
                disabled={saving}
                style={{
                  backgroundColor: colors.accent,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: saving ? 0.7 : 1,
                  marginBottom: 20,
                }}
              >
                {saving ? (
                  <ActivityIndicator color={colors.bg} />
                ) : (
                  <>
                    <Save size={18} color={colors.bg} />
                    <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600', marginLeft: 8 }}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
