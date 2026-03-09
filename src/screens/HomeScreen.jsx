import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Modal, TextInput, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { colors, categoryEmojis, locationOptions } from '../constants/theme';
import { AlertTriangle, Package, Clock, X, Save, Loader2, Trash2, ChevronRight } from 'lucide-react-native';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { format, differenceInDays, parseISO } from 'date-fns';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [itemsRes, expiringRes] = await Promise.all([
        api.get('/items'),
        api.get('/items/expiring?days=7'),
      ]);
      setItems(itemsRes.data);
      setExpiringItems(expiringRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const openDetail = (item) => {
    setSelected(item);
    setEditForm({
      location: item.location || 'fridge',
      expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
    });
  };

  const saveDetail = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/items/${selected.id}`, editForm);
      Toast.show({ type: 'success', text1: 'Item updated' });
      setSelected(null);
      fetchData();
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
      fetchData();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete' });
    }
  };

  const consumeItem = async (id) => {
    try {
      await api.post(`/items/${id}/consume`, { quantity: 1 });
      Toast.show({ type: 'success', text1: 'Item consumed' });
      setSelected(null);
      fetchData();
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
    if (days === null) return 'No expiry';
    if (days < 0) return `Expired ${Math.abs(days)}d ago`;
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `${days} days left`;
  };

  const totalItems = items.length;
  const expiringSoon = expiringItems.length;
  const expired = expiringItems.filter((i) => getDaysUntilExpiry(i.expiry_date) < 0).length;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={expiringItems}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.accent} />}
        ListHeaderComponent={() => (
          <View style={{ padding: 20 }}>
            {/* Greeting */}
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
              Hey, {user?.name || 'there'}
            </Text>
            {user?.household_display_name && (
              <Text style={{ fontSize: 14, color: colors.textDim, marginBottom: 20 }}>
                {user.household_display_name}
              </Text>
            )}

            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                <Package size={20} color={colors.accent} />
                <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 8 }}>{totalItems}</Text>
                <Text style={{ fontSize: 12, color: colors.textDim }}>Total Items</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: expiringSoon > 0 ? colors.warnBg : colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: expiringSoon > 0 ? colors.warn + '30' : colors.border }}>
                <AlertTriangle size={20} color={expiringSoon > 0 ? colors.warn : colors.textDim} />
                <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 8 }}>{expiringSoon}</Text>
                <Text style={{ fontSize: 12, color: colors.textDim }}>Expiring Soon</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: expired > 0 ? colors.dangerBg : colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: expired > 0 ? colors.danger + '30' : colors.border }}>
                <Clock size={20} color={expired > 0 ? colors.danger : colors.textDim} />
                <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 8 }}>{expired}</Text>
                <Text style={{ fontSize: 12, color: colors.textDim }}>Expired</Text>
              </View>
            </View>

            {/* Section header */}
            {expiringItems.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text }}>Expiring Soon</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Fridge')}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: colors.accent, fontSize: 14 }}>View All</Text>
                    <ChevronRight size={16} color={colors.accent} />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        renderItem={({ item }) => {
          const days = getDaysUntilExpiry(item.expiry_date);
          const expiryColor = getExpiryColor(days);
          return (
            <TouchableOpacity
              onPress={() => openDetail(item)}
              style={{
                backgroundColor: colors.card,
                marginHorizontal: 20,
                marginBottom: 10,
                borderRadius: 14,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 28, marginRight: 12 }}>{item.emoji || categoryEmojis[item.category] || categoryEmojis.other}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '500' }}>{item.name}</Text>
                <Text style={{ color: expiryColor, fontSize: 12, marginTop: 2 }}>{getExpiryLabel(days)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.textDim, fontSize: 12 }}>x{item.quantity}</Text>
                <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 2 }}>{item.location}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>{'\u{1F389}'}</Text>
            <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 4 }}>All Clear!</Text>
            <Text style={{ fontSize: 14, color: colors.textDim, textAlign: 'center' }}>No items expiring in the next 7 days</Text>
          </View>
        )}
      />

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 32, marginRight: 12 }}>{selected?.emoji || categoryEmojis.other}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{selected?.name}</Text>
                    <Text style={{ fontSize: 13, color: colors.textDim }}>Qty: {selected?.quantity} {selected?.unit}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelected(null)} style={{ padding: 4 }}>
                  <X size={24} color={colors.textDim} />
                </TouchableOpacity>
              </View>

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
