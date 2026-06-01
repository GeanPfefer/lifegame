import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/constants/theme';

/**
 * Tela inicial vazia — o root _layout.tsx redireciona para a rota correta
 * assim que o estado de auth é resolvido.
 */
export default function IndexScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}
