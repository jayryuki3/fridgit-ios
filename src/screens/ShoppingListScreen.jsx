import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/theme';
import { Plus, Check, Trash2, ShoppingCart } from 'lucide-react-native';
import api from '../services/api';
import Toast from 'react-native-toast-message';

export default function ShoppingListScreen() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await api.get('/shopping-list');
      setItems(res.data);
    } catch (error) {
      console.error('Fetch shopping list error:', error);
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

  const addItem = async () => {
    if (!newItem.trim()) return;
    setAdding(true);
    try {
      const res = await api.post('/shopping-list', { item_name: newItem.trim() });
      setItems([res.data, ...items]);
      setNewItem('');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not add item' });
    } finally {
      setAdding(false);
    }
  };

  const togglePurchased = async (item) => {
    try {
      const res = await api.put(`/shopping-list/${item.id}`, { purchased: !item.purchased });
      setItems(items.map((i) => (i.id === item.id ? res.data : i)));
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error' });
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/shopping-list/${id}`);
      setItems(items.filter((i) => i.id !== id));
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error' });
    }
  };

  const unpurchased = items.filter((i) => !i.purchased);
  const purchased = items.filter((i) => i.purchased);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Add item input */}
      <View style={{ flexDirection: 'row', padding: 16, gap: 10 }}>
        <TextInput
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add to shopping list..."
          placeholderTextColor={colors.textDim}
          onSubmitEditing={addItem}
          returnKeyType="done"
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 14,
            color: colors.text,
            fontSize: 15,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        />
        <TouchableOpacity
          onPress={addItem}
          disabled={adding || !newItem.trim()}
          style={{
            backgroundColor: colors.accent,
            borderRadius: 12,
            width: 48,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: adding || !newItem.trim() ? 0.5 : 1,
          }}
        >
          {adding ? <ActivityIndicator color={colors.bg} size="small" /> : <Plus size={22} color={colors.bg} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...unpurchased, ...purchased]}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchItems(); }} tintColor={colors.accent} />}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.card,
              marginHorizontal: 16,
              marginBottom: 8,
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: item.purchased ? 0.5 : 1,
            }}
          >
            <TouchableOpacity
              onPress={() => togglePurchased(item)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: item.purchased ? colors.accent : colors.border,
                backgroundColor: item.purchased ? colors.accent : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              {item.purchased && <Check size={16} color={colors.bg} />}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: colors.text,
                fontSize: 15,
                textDecorationLine: item.purchased ? 'line-through' : 'none',
              }}>
                {item.item_name}
              </Text>
              {item.quantity > 1 && (
                <Text style={{ color: colors.textDim, fontSize: 12 }}>x{item.quantity}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => deleteItem(item.id)} style={{ padding: 6 }}>
              <Trash2 size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <ShoppingCart size={48} color={colors.textDim} />
            <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, marginTop: 16 }}>Shopping list is empty</Text>
            <Text style={{ fontSize: 14, color: colors.textDim, marginTop: 4 }}>Add items above to get started</Text>
          </View>
        )}
      />
    </View>
  );
}
