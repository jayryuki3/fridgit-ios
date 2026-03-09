import { View, Text } from 'react-native';
import { colors } from '../constants/theme';
import { ChefHat } from 'lucide-react-native';

export default function RecipesScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <ChefHat size={64} color={colors.textDim} />
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 20 }}>Recipes</Text>
      <Text style={{ fontSize: 14, color: colors.textDim, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
        Recipe suggestions based on your fridge contents are coming soon.
      </Text>
    </View>
  );
}
