import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/theme';
import { LogOut, Home, User, Bell, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20 }}>
      {/* Profile */}
      <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 52, height: 52, borderRadius: 26,
            backgroundColor: colors.accent + '20',
            justifyContent: 'center', alignItems: 'center', marginRight: 16,
          }}>
            <Text style={{ color: colors.accent, fontSize: 22, fontWeight: '700' }}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>{user?.name}</Text>
            <Text style={{ color: colors.textDim, fontSize: 13, marginTop: 2 }}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Household */}
      <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 8, paddingLeft: 4 }}>HOUSEHOLD</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('HouseholdSettings')}
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ backgroundColor: colors.accent + '20', borderRadius: 10, padding: 10, marginRight: 14 }}>
          <Home size={20} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '500' }}>
            {user?.household_display_name || 'No Household'}
          </Text>
          <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 2 }}>
            Manage members and invite code
          </Text>
        </View>
        <ChevronRight size={18} color={colors.textDim} />
      </TouchableOpacity>

      {/* Notifications */}
      <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 8, paddingLeft: 4 }}>PREFERENCES</Text>
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <View style={{ backgroundColor: colors.accent + '20', borderRadius: 10, padding: 10, marginRight: 14 }}>
          <Bell size={20} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '500' }}>Notifications</Text>
          <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 2 }}>Expiry alerts and reminders</Text>
        </View>
        <ChevronRight size={18} color={colors.textDim} />
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: colors.dangerBg,
          borderRadius: 14,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 12,
        }}
      >
        <LogOut size={18} color={colors.danger} />
        <Text style={{ color: colors.danger, fontSize: 15, fontWeight: '600', marginLeft: 8 }}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={{ color: colors.textDim, fontSize: 12, textAlign: 'center', marginTop: 24 }}>Fridgit v1.0.0</Text>
    </ScrollView>
  );
}
