import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/theme';
import { Home, UserPlus, ArrowRight } from 'lucide-react-native';
import api from '../services/api';
import Toast from 'react-native-toast-message';

export default function HouseholdScreen() {
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState('choose'); // 'choose', 'create', 'join'
  const [houseName, setHouseName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!houseName.trim()) {
      Toast.show({ type: 'error', text1: 'Give your house a name' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/households', { name: houseName.trim() });
      await refreshUser();
      Toast.show({ type: 'success', text1: 'House created!' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Could not create house',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Toast.show({ type: 'error', text1: 'Enter an invite code' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/households/join', { invite_code: inviteCode.trim() });
      await refreshUser();
      Toast.show({ type: 'success', text1: 'Joined household!' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: error.response?.data?.error || 'Could not join household',
      });
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'choose') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>{'\u{1F3E0}'}</Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>Set Up Your House</Text>
          <Text style={{ fontSize: 14, color: colors.textDim, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
            Create a house for your family or roommates, or join one with an invite code.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setMode('create')}
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ backgroundColor: colors.accent + '20', borderRadius: 12, padding: 12, marginRight: 16 }}>
            <Home size={24} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600' }}>Create a House</Text>
            <Text style={{ color: colors.textDim, fontSize: 13, marginTop: 2 }}>Start a new household and invite others</Text>
          </View>
          <ArrowRight size={20} color={colors.textDim} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode('join')}
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ backgroundColor: colors.accent + '20', borderRadius: 12, padding: 12, marginRight: 16 }}>
            <UserPlus size={24} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600' }}>Join a House</Text>
            <Text style={{ color: colors.textDim, fontSize: 13, marginTop: 2 }}>Enter an invite code to join</Text>
          </View>
          <ArrowRight size={20} color={colors.textDim} />
        </TouchableOpacity>
      </View>
    );
  }

  if (mode === 'create') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: colors.bg }}
      >
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          <TouchableOpacity onPress={() => setMode('choose')} style={{ marginBottom: 24 }}>
            <Text style={{ color: colors.accent, fontSize: 15 }}>{'\u{2190}'} Back</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>{'\u{1F3E0}'}</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 }}>Name Your House</Text>
          <Text style={{ fontSize: 14, color: colors.textDim, textAlign: 'center', marginBottom: 32 }}>
            This is what your household members will see
          </Text>

          <TextInput
            value={houseName}
            onChangeText={setHouseName}
            placeholder="e.g. The Smith House"
            placeholderTextColor={colors.textDim}
            autoFocus
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              color: colors.text,
              fontSize: 18,
              borderWidth: 1,
              borderColor: colors.border,
              textAlign: 'center',
              marginBottom: 24,
            }}
          />

          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600' }}>Create House</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Join mode
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <TouchableOpacity onPress={() => setMode('choose')} style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.accent, fontSize: 15 }}>{'\u{2190}'} Back</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>{'\u{1F511}'}</Text>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 }}>Enter Invite Code</Text>
        <Text style={{ fontSize: 14, color: colors.textDim, textAlign: 'center', marginBottom: 32 }}>
          Ask a household member for their invite code
        </Text>

        <TextInput
          value={inviteCode}
          onChangeText={(t) => setInviteCode(t.toUpperCase())}
          placeholder="e.g. A1B2C3D4E5"
          placeholderTextColor={colors.textDim}
          autoFocus
          autoCapitalize="characters"
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            color: colors.text,
            fontSize: 20,
            fontWeight: '600',
            letterSpacing: 2,
            borderWidth: 1,
            borderColor: colors.border,
            textAlign: 'center',
            marginBottom: 24,
          }}
        />

        <TouchableOpacity
          onPress={handleJoin}
          disabled={loading}
          style={{
            backgroundColor: colors.accent,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600' }}>Join House</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
