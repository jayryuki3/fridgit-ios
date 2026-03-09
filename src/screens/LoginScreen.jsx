import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../constants/theme';
import { LogIn, Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Toast.show({ type: 'error', text1: 'All fields required' });
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      // Navigation handled by AppNavigator based on auth state
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.response?.data?.error || 'Invalid credentials',
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
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        {/* Logo area */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>{'\u{1F9CA}'}</Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: colors.accent }}>Fridgit</Text>
          <Text style={{ fontSize: 14, color: colors.textDim, marginTop: 4 }}>Your smart fridge manager</Text>
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
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6, fontWeight: '500' }}>Password</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
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

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
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
              <LogIn size={20} color={colors.bg} />
              <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600', marginLeft: 8 }}>Sign In</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Register link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={{ marginTop: 20, alignItems: 'center' }}
        >
          <Text style={{ color: colors.textDim, fontSize: 14 }}>
            Don't have an account?{' '}
            <Text style={{ color: colors.accent, fontWeight: '600' }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
