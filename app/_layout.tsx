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

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme } = useColorScheme();
  const [playerData, setPlayerData] = useState<any>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [allTasksDone, setAllTasksDone] = useState(false);

  const [isLevelUp, setIsLevelUp] = useState(false); // Estado para o alerta
  const [newLevel, setNewLevel] = useState(playerData?.level || 0); // Inicializa com o nível atual ou 0

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        setIsFirstLaunch(false);
      }
    };
    checkFirstLaunch();
  }, []);


  useEffect(() => {
    if (playerData?.allTasksDone === true) {
      setAllTasksDone(true);
    }
  }, [playerData?.allTasksDone]);

  const prepareApp = async () => {
    try {
      const storedPlayerData = await consultPlayerStatus('673666aaec06d31576b6f4eb');
      console.log(storedPlayerData)

      // Verifica se o jogador subiu de nível
      if (storedPlayerData.level > playerData?.level) {
        setNewLevel(storedPlayerData.level);
        setIsLevelUp(true); // Mostra o alerta
      }

      if (storedPlayerData) {
        setPlayerData(storedPlayerData);
      }
    } catch (err) {
      console.error('Erro ao preparar o app:', err);
    } finally {
      await setTimeout(() => SplashScreen.hideAsync(), 1000);
    }
  };

  useEffect(() => {
    if (isFirstLaunch === false) {
      prepareApp();
    }
  }, [isFirstLaunch]);

  useEffect(() => {
    if (playerData?.level && playerData.level > newLevel) {
      setNewLevel(playerData.level);
      setIsLevelUp(true); // Mostra o alerta
    }
  }, [playerData?.level]); // Executa sempre que o nível do jogador mudar

  const [loaded, error] = useFonts({
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
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }


  if (isFirstLaunch === true) {
    return <OnboardingScreens onComplete={() => setIsFirstLaunch(false)} />;
  }

  return (
    <AppUserContext.Provider value={{ playerData, setPlayerData }}>
      <StatusBar key={`root-status-bar-dark`} style={'light'} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ActionSheetProvider>
            <NavThemeProvider value={NAV_THEME[colorScheme]}>
              {allTasksDone && (
                <AllTasksCompleted onComplete={() => setAllTasksDone(false)} />
              )}
              <LevelUpAlert
                visible={isLevelUp}
                level={newLevel}
                onClose={() => {
                  setIsLevelUp(false);
                }}
              />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </NavThemeProvider>
          </ActionSheetProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </AppUserContext.Provider>
  );
}
