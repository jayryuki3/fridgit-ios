import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/theme';
import { UserPlus, Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Toast.show({ type: 'error', text1: 'All fields required' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      // Navigation handled by AppNavigator — will go to HouseholdScreen since no household yet
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.response?.data?.error || 'Could not create account',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        {/* Logo area */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>{'\u{1F9CA}'}</Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: colors.accent }}>Join Fridgit</Text>
          <Text style={{ fontSize: 14, color: colors.textDim, marginTop: 4 }}>Create your account</Text>
        </View>

        {/* Name */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6, fontWeight: '500' }}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.textDim}
            autoCapitalize="words"
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 14,
              color: colors.text,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
        </View>

        {/* Email */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6, fontWeight: '500' }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textDim}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 14,
              color: colors.text,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
        </View>

        {/* Password */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6, fontWeight: '500' }}>Password</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Min 6 characters"
              placeholderTextColor={colors.textDim}
              secureTextEntry={!showPassword}
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 14,
                paddingRight: 48,
                color: colors.text,
                fontSize: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 14, top: 14 }}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.textDim} />
              ) : (
                <Eye size={20} color={colors.textDim} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6, fontWeight: '500' }}>Confirm Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            placeholderTextColor={colors.textDim}
            secureTextEntry={!showPassword}
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 14,
              color: colors.text,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
        </View>

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor: colors.accent,
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <>
              <UserPlus size={20} color={colors.bg} />
              <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600', marginLeft: 8 }}>Create Account</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: 20, alignItems: 'center', paddingBottom: 40 }}
        >
          <Text style={{ color: colors.textDim, fontSize: 14 }}>
            Already have an account?{' '}
            <Text style={{ color: colors.accent, fontWeight: '600' }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
