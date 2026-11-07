import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display/600SemiBold';
import { PlayfairDisplay_600SemiBold_Italic } from '@expo-google-fonts/playfair-display/600SemiBold_Italic';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display/700Bold';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SharedImageOverlay } from './src/components/SharedImageOverlay';
import { RootNavigator } from './src/navigation/RootNavigator';
import { DapurProvider, useDapur } from './src/providers/DapurProvider';
import { SharedImageProvider } from './src/providers/SharedImageProvider';
import { colors } from './src/theme';

// Splash ditahan sampai font dan data lokal siap, supaya layar pertama tidak
// berkedip dengan font sistem atau checklist yang belum terhidrasi.
SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ duration: 420, fade: true });

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold_Italic,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <DapurProvider>
          <SharedImageProvider>
            <AppContent />
          </SharedImageProvider>
        </DapurProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const { isReady } = useDapur();

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isReady]);

  if (!isReady) {
    return <View style={styles.loading} />;
  }

  return (
    <View style={styles.root}>
      <RootNavigator />
      <SharedImageOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
