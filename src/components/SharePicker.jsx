import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/theme';
import { Users, Check } from 'lucide-react-native';
import api from '../services/api';

export default function SharePicker({ selectedIds = [], onChange }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.active_household_id) {
      api.get(`/households/${user.active_household_id}/members`)
        .then((res) => setMembers(res.data.filter((m) => m.id !== user.id)))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?.active_household_id]);

  const toggleMember = (memberId) => {
    const newIds = selectedIds.includes(memberId)
      ? selectedIds.filter((id) => id !== memberId)
      : [...selectedIds, memberId];
    onChange(newIds);
  };

  if (loading) {
    return <ActivityIndicator color={colors.accent} style={{ padding: 16 }} />;
  }

  if (members.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Users size={16} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500', marginLeft: 6 }}>Share With</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {members.map((member) => {
          const isSelected = selectedIds.includes(member.id);
          return (
            <TouchableOpacity
              key={member.id}
              onPress={() => toggleMember(member.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isSelected ? colors.accent + '20' : colors.bg,
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: isSelected ? colors.accent : colors.border,
              }}
            >
              <View style={{
                width: 24, height: 24, borderRadius: 12,
                backgroundColor: isSelected ? colors.accent : colors.textDim + '40',
                justifyContent: 'center', alignItems: 'center', marginRight: 8,
              }}>
                {isSelected ? (
                  <Check size={14} color={colors.bg} />
                ) : (
                  <Text style={{ color: colors.text, fontSize: 11, fontWeight: '600' }}>
                    {member.name?.charAt(0)?.toUpperCase()}
                  </Text>
                )}
              </View>
              <Text style={{ color: isSelected ? colors.accent : colors.textDim, fontSize: 13, fontWeight: '500' }}>
                {member.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
