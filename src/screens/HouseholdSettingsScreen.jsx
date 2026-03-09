import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/theme';
import { Copy, RefreshCw, UserMinus, LogOut, Crown, Users } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import Toast from 'react-native-toast-message';

export default function HouseholdSettingsScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const [households, setHouseholds] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const activeHousehold = households.find((h) => h.id === user?.active_household_id);
  const isOwner = activeHousehold?.owner_id === user?.id;

  const fetchData = async () => {
    try {
      const [hRes, mRes] = await Promise.all([
        api.get('/households/mine'),
        user?.active_household_id ? api.get(`/households/${user.active_household_id}/members`) : Promise.resolve({ data: [] }),
      ]);
      setHouseholds(hRes.data);
      setMembers(mRes.data);
    } catch (error) {
      console.error('Fetch household data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user?.active_household_id])
  );

  const copyInviteCode = async () => {
    if (activeHousehold?.invite_code) {
      await Clipboard.setStringAsync(activeHousehold.invite_code);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: 'success', text1: 'Invite code copied!' });
    }
  };

  const refreshInviteCode = async () => {
    if (!activeHousehold) return;
    try {
      const res = await api.post(`/households/${activeHousehold.id}/invite`);
      setHouseholds((prev) =>
        prev.map((h) => (h.id === activeHousehold.id ? { ...h, invite_code: res.data.invite_code } : h))
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: 'success', text1: 'Invite code refreshed' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.error || 'Failed' });
    }
  };

  const removeMember = (member) => {
    Alert.alert(
      'Remove Member',
      `Remove ${member.name} from the household?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/households/${activeHousehold.id}/members/${member.id}`);
              setMembers((prev) => prev.filter((m) => m.id !== member.id));
              Toast.show({ type: 'success', text1: `${member.name} removed` });
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.error || 'Failed' });
            }
          },
        },
      ]
    );
  };

  const leaveHousehold = () => {
    Alert.alert(
      'Leave Household',
      `Leave ${activeHousehold?.name}? You can rejoin with the invite code.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/households/${activeHousehold.id}/leave`);
              await refreshUser();
              Toast.show({ type: 'success', text1: 'Left household' });
              navigation.goBack();
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.error || 'Failed' });
            }
          },
        },
      ]
    );
  };

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
        data={members}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.accent} />}
        ListHeaderComponent={() => (
          <View style={{ padding: 20 }}>
            {/* House name */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>{'\u{1F3E0}'}</Text>
              <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{activeHousehold?.name || 'No Household'}</Text>
            </View>

            {/* Invite code */}
            {activeHousehold && (
              <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Invite Code</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.accent, fontSize: 24, fontWeight: '700', letterSpacing: 3 }}>
                    {activeHousehold.invite_code}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={copyInviteCode} style={{ padding: 8 }}>
                      <Copy size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                    {isOwner && (
                      <TouchableOpacity onPress={refreshInviteCode} style={{ padding: 8 }}>
                        <RefreshCw size={20} color={colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 8 }}>Share this code to invite people</Text>
              </View>
            )}

            {/* Members header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Users size={18} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: '600', marginLeft: 8 }}>
                Members ({members.length})
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: colors.card,
              marginHorizontal: 20,
              marginBottom: 8,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.accent + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 16 }}>
                {item.name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '500' }}>
                {item.name} {item.id === user?.id ? '(you)' : ''}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                {item.role === 'owner' && <Crown size={12} color={colors.warn} style={{ marginRight: 4 }} />}
                <Text style={{ color: colors.textDim, fontSize: 12 }}>{item.role}</Text>
              </View>
            </View>
            {isOwner && item.id !== user?.id && (
              <TouchableOpacity onPress={() => removeMember(item)} style={{ padding: 8 }}>
                <UserMinus size={18} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        )}
        ListFooterComponent={() => (
          <View style={{ padding: 20, paddingTop: 24 }}>
            {!isOwner && activeHousehold && (
              <TouchableOpacity
                onPress={leaveHousehold}
                style={{
                  backgroundColor: colors.dangerBg,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogOut size={18} color={colors.danger} />
                <Text style={{ color: colors.danger, fontSize: 15, fontWeight: '600', marginLeft: 8 }}>Leave Household</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}
