import '../global.css';
import 'expo-dev-client';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppUserContext } from '~/contexts/AppUserContext';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { consultPlayerStatus } from '~/services/api';
import {
  useFonts,
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { OnboardingScreens } from '../components/Onboarding/OnboardingScreens';
import LevelUpAlert from '~/components/LevelUpAlert';
import AllTasksCompleted from '~/components/AllTasksCompleted';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import Text from '~/components/Text';
import HimariScreen from '~/components/Onboarding/HimariIntroduction';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme } = useColorScheme();
  const [playerData, setPlayerData] = useState<any>(null);
  const [allTasksDone, setAllTasksDone] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [showHimari, setShowHimari] = useState(false); // Exibição da Himari

  const initializePlayerData = async () => {
    try {
      const storedPlayerData = await consultPlayerStatus('673666aaec06d31576b6f4eb');
      if (storedPlayerData) {
        setPlayerData(storedPlayerData);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do jogador:', err);
    } finally {
      SplashScreen.hideAsync();
    }
  };

  const checkFirstLaunch = async () => {
    const hasLaunched = await AsyncStorage.getItem('hasLaunched');
    if (!hasLaunched) {
      await AsyncStorage.setItem('hasLaunched', 'true');
      setPlayerData((prev: any) => ({ ...prev, onboarded: false }));
    } else {
      initializePlayerData();
    }
  };

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      const updatedPlayerData = {
        ...playerData,
        onboarded: true,
      };
      setPlayerData(updatedPlayerData);
      setShowHimari(true); // Exibe Himari após o onboarding
    } catch (error) {
      console.error('Erro ao finalizar o onboarding:', error);
    }
  };

  const handleHimariNext = () => {
    setShowHimari(false); // Sai da tela Himari
  };

  const [fontsLoaded, fontsError] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Carregando...</Text>
      </View>
    );
  }

  if (!playerData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Carregando jogador...</Text>
      </View>
    );
  }

  if (!playerData.onboarded) {
    return <OnboardingScreens onComplete={handleOnboardingComplete} />;
  }

  return (
    <AppUserContext.Provider value={{ playerData, setPlayerData }}>
      <StatusBar style="light" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ActionSheetProvider>
            <NavThemeProvider value={NAV_THEME[colorScheme]}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
              </Stack>
              {showHimari && <HimariScreen onNext={handleHimariNext} />}
            </NavThemeProvider>
          </ActionSheetProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </AppUserContext.Provider>
  );
}
