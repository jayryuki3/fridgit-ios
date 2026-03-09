import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../hooks/useAuth';
import { colors, categoryEmojis, locationOptions } from '../constants/theme';
import { Camera, Search, X, ChevronDown, Package } from 'lucide-react-native';
import SharePicker from '../components/SharePicker';
import api from '../services/api';
import Toast from 'react-native-toast-message';

const CATEGORIES = ['dairy', 'meat', 'vegetables', 'fruits', 'beverages', 'condiments', 'seafood', 'grains', 'snacks', 'other'];

export default function NewItemScreen({ navigation }) {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState('form'); // 'form', 'scan', 'search'
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const [form, setForm] = useState({
    name: '',
    barcode: '',
    category: 'other',
    quantity: 1,
    unit: 'count',
    location: 'fridge',
    expiry_date: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    emoji: '',
    color: '',
    shared: false,
    shared_with: [],
    image_url: '',
  });

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleBarcodeScan = async ({ data }) => {
    if (scanning) return;
    setScanning(true);
    updateForm('barcode', data);
    setMode('form');
    try {
      const res = await api.get(`/items/barcode/${data}`);
      const p = res.data;
      setForm((prev) => ({
        ...prev,
        name: p.name || prev.name,
        category: p.category || prev.category,
        calories: p.calories ? String(p.calories) : prev.calories,
        protein: p.protein ? String(p.protein) : prev.protein,
        carbs: p.carbs ? String(p.carbs) : prev.carbs,
        fat: p.fat ? String(p.fat) : prev.fat,
        emoji: p.emoji || prev.emoji,
        color: p.color || prev.color,
        barcode: data,
        image_url: p.image_url || prev.image_url,
      }));
      Toast.show({ type: 'success', text1: 'Product found!', text2: p.name });
    } catch {
      Toast.show({ type: 'info', text1: 'Product not found', text2: 'Fill in details manually' });
    } finally {
      setScanning(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/items/barcode/search/${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data || []);
    } catch {
      Toast.show({ type: 'error', text1: 'Search failed' });
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (product) => {
    setForm((prev) => ({
      ...prev,
      name: product.name || prev.name,
      category: product.category || prev.category,
      calories: product.calories ? String(product.calories) : prev.calories,
      protein: product.protein ? String(product.protein) : prev.protein,
      carbs: product.carbs ? String(product.carbs) : prev.carbs,
      fat: product.fat ? String(product.fat) : prev.fat,
      emoji: product.emoji || prev.emoji,
      color: product.color || prev.color,
      barcode: product.barcode || prev.barcode,
      image_url: product.image_url || prev.image_url,
    }));
    setMode('form');
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Toast.show({ type: 'error', text1: 'Item name is required' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        quantity: parseInt(form.quantity) || 1,
        expiry_date: form.expiry_date || null,
        calories: form.calories || null,
        protein: form.protein || null,
        carbs: form.carbs || null,
        fat: form.fat || null,
      };
      await api.post('/items', payload);
      Toast.show({ type: 'success', text1: 'Item added!', text2: form.name });
      navigation.goBack();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.error || 'Could not save' });
    } finally {
      setSaving(false);
    }
  };

  // Barcode scanner view
  if (mode === 'scan') {
    if (!permission?.granted) {
      return (
        <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Camera size={48} color={colors.textDim} />
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600', marginTop: 16 }}>Camera Permission</Text>
          <Text style={{ color: colors.textDim, fontSize: 14, textAlign: 'center', marginTop: 8 }}>We need camera access to scan barcodes</Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={{ backgroundColor: colors.accent, borderRadius: 12, padding: 14, paddingHorizontal: 24, marginTop: 20 }}
          >
            <Text style={{ color: colors.bg, fontWeight: '600' }}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('form')} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.accent }}>Skip</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'] }}
          onBarcodeScanned={scanning ? undefined : handleBarcodeScan}
        >
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 20, paddingTop: 60 }}>
              <TouchableOpacity
                onPress={() => setMode('form')}
                style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 10 }}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: 'center', paddingBottom: 80 }}>
              <View style={{ width: 260, height: 140, borderWidth: 2, borderColor: colors.accent, borderRadius: 16, opacity: 0.8 }} />
              <Text style={{ color: '#fff', fontSize: 14, marginTop: 16, opacity: 0.8 }}>Point at a barcode</Text>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // Search view
  if (mode === 'search') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flexDirection: 'row', padding: 16, gap: 10 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border }}>
            <Search size={18} color={colors.textDim} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search food products..."
              placeholderTextColor={colors.textDim}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              style={{ flex: 1, padding: 12, color: colors.text, fontSize: 15 }}
            />
          </View>
          <TouchableOpacity onPress={() => { setMode('form'); setSearchResults([]); }} style={{ justifyContent: 'center' }}>
            <Text style={{ color: colors.accent, fontWeight: '500' }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {searching ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {searchResults.map((product, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => selectSearchResult(product)}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 28, marginRight: 12 }}>{product.emoji || categoryEmojis.other}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500' }}>{product.name}</Text>
                  <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 2 }}>{product.brand || product.category}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {searchResults.length === 0 && searchQuery && !searching && (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Text style={{ color: colors.textDim }}>No results. Try a different search.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    );
  }

  // Main form
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        {/* Mode buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => setMode('scan')}
            style={{
              flex: 1,
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Camera size={20} color={colors.accent} />
            <Text style={{ color: colors.accent, fontWeight: '600', marginLeft: 8, fontSize: 14 }}>Scan Barcode</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('search')}
            style={{
              flex: 1,
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Search size={20} color={colors.accent} />
            <Text style={{ color: colors.accent, fontWeight: '600', marginLeft: 8, fontSize: 14 }}>Search Food</Text>
          </TouchableOpacity>
        </View>

        {/* Item name */}
        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 6 }}>Item Name *</Text>
        <TextInput
          value={form.name}
          onChangeText={(t) => updateForm('name', t)}
          placeholder="What are you adding?"
          placeholderTextColor={colors.textDim}
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 14,
            color: colors.text,
            fontSize: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 20,
          }}
        />

        {/* Category */}
        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 6 }}>Category</Text>
        <TouchableOpacity
          onPress={() => setShowCategories(!showCategories)}
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: showCategories ? 8 : 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>{categoryEmojis[form.category]}</Text>
            <Text style={{ color: colors.text, fontSize: 15, textTransform: 'capitalize' }}>{form.category}</Text>
          </View>
          <ChevronDown size={18} color={colors.textDim} />
        </TouchableOpacity>
        {showCategories && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => { updateForm('category', cat); setShowCategories(false); }}
                style={{
                  backgroundColor: form.category === cat ? colors.accent + '20' : colors.bg,
                  borderRadius: 10,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderColor: form.category === cat ? colors.accent : colors.border,
                }}
              >
                <Text style={{ color: form.category === cat ? colors.accent : colors.textDim, fontSize: 13 }}>
                  {categoryEmojis[cat]} {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quantity + Unit row */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 6 }}>Quantity</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
              <TouchableOpacity
                onPress={() => updateForm('quantity', Math.max(1, form.quantity - 1))}
                style={{ padding: 14 }}
              >
                <Text style={{ color: colors.accent, fontSize: 20, fontWeight: '600' }}>-</Text>
              </TouchableOpacity>
              <Text style={{ flex: 1, textAlign: 'center', color: colors.text, fontSize: 18, fontWeight: '600' }}>{form.quantity}</Text>
              <TouchableOpacity
                onPress={() => updateForm('quantity', form.quantity + 1)}
                style={{ padding: 14 }}
              >
                <Text style={{ color: colors.accent, fontSize: 20, fontWeight: '600' }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 6 }}>Unit</Text>
            <TextInput
              value={form.unit}
              onChangeText={(t) => updateForm('unit', t)}
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 14,
                color: colors.text,
                fontSize: 15,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
          </View>
        </View>

        {/* Location */}
        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Location</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {locationOptions.map((loc) => (
            <TouchableOpacity
              key={loc.value}
              onPress={() => updateForm('location', loc.value)}
              style={{
                flex: 1,
                backgroundColor: form.location === loc.value ? colors.accent + '20' : colors.card,
                borderRadius: 10,
                padding: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: form.location === loc.value ? colors.accent : colors.border,
              }}
            >
              <Text style={{ fontSize: 20 }}>{loc.emoji}</Text>
              <Text style={{ color: form.location === loc.value ? colors.accent : colors.textDim, fontSize: 11, marginTop: 4 }}>{loc.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Expiry date */}
        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 6 }}>Expiry Date</Text>
        <TextInput
          value={form.expiry_date}
          onChangeText={(t) => updateForm('expiry_date', t)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textDim}
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 14,
            color: colors.text,
            fontSize: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 20,
          }}
        />

        {/* Nutrition (collapsible could be added later) */}
        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Nutrition (optional)</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {[
            { key: 'calories', label: 'Cal' },
            { key: 'protein', label: 'Prot' },
            { key: 'carbs', label: 'Carbs' },
            { key: 'fat', label: 'Fat' },
          ].map((n) => (
            <View key={n.key} style={{ flex: 1 }}>
              <TextInput
                value={form[n.key]}
                onChangeText={(t) => updateForm(n.key, t)}
                placeholder={n.label}
                placeholderTextColor={colors.textDim}
                keyboardType="numeric"
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 10,
                  padding: 12,
                  color: colors.text,
                  fontSize: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  textAlign: 'center',
                }}
              />
            </View>
          ))}
        </View>

        {/* Share picker */}
        <SharePicker
          selectedIds={form.shared_with}
          onChange={(ids) => setForm({ ...form, shared_with: ids, shared: ids.length > 0 })}
        />

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: colors.accent,
            borderRadius: 14,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: saving ? 0.7 : 1,
            marginBottom: 40,
          }}
        >
          {saving ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <>
              <Package size={20} color={colors.bg} />
              <Text style={{ color: colors.bg, fontSize: 17, fontWeight: '600', marginLeft: 8 }}>Add to Fridge</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
