import '../global.css';
import 'expo-dev-client';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { consultPlayerStatus } from '~/services/api';
import {
  useAttributesStore,
  useCoinsAndStreakStore,
  useHealthAndManaStore,
  useLevelsAndExpStore,
  usePenaltyZoneStore,
  usePlayerDataStore,
} from '~/stores/mainStore';

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
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import Text from '~/components/Text';
import HimariScreen from '~/components/Onboarding/HimariIntroduction';
import AuthScreen from './authscreen';
import { SnackBarProvider } from '~/contexts/SnackBarContext';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme } = useColorScheme();
  const [haveToken, setHaveToken] = useState<boolean>(true);
  const [showHimari, setShowHimari] = useState(false);

  const initializePlayerData = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');

      if (userToken) {
        setHaveToken(true);
        const storedPlayerData = await consultPlayerStatus();

        if (storedPlayerData) {
          const {
            _id,
            onboarded,
            generatedToday,
            weight,
            height,
            username,
            selectedClass,
            coins,
            streak,
            gems,
            level,
            currentXP,
            xpForNextLevel,
            pointsToDistribute,
            totalExp,
            inPenaltyZone,
            attributes,
            health,
            maxHealth,
            mana,
            maxMana,
          } = storedPlayerData;

          // Atualizar stores diretamente
          const playerStore = usePlayerDataStore.getState();
          playerStore.setId(_id);
          playerStore.setGeneratedToday(generatedToday);
          playerStore.setSelectedClass(selectedClass);
          playerStore.setUsername(username);
          playerStore.setWeight(weight);
          playerStore.setHeight(height);
          playerStore.setOnboarded(onboarded)

          const coinsAndStreakStore = useCoinsAndStreakStore.getState();
          coinsAndStreakStore.setCoins(coins);
          coinsAndStreakStore.setStreak(streak);
          coinsAndStreakStore.setGems(gems);

          const levelsAndExpStore = useLevelsAndExpStore.getState();
          levelsAndExpStore.setLevel(level);
          levelsAndExpStore.setCurrentXP(currentXP);
          levelsAndExpStore.setXpForNextLevel(xpForNextLevel);
          levelsAndExpStore.setPointsToDistribute(pointsToDistribute);
          levelsAndExpStore.setTotalExp(totalExp);

          const penaltyZoneStore = usePenaltyZoneStore.getState();
          penaltyZoneStore.setInPenaltyZone(inPenaltyZone);

          const attributesStore = useAttributesStore.getState();
          attributesStore.setVitality(attributes.vitality);
          attributesStore.setFocus(attributes.focus);
          attributesStore.setAura(attributes.aura);

          const healthAndManaStore = useHealthAndManaStore.getState();
          healthAndManaStore.setHealth(health);
          healthAndManaStore.setMaxHealth(maxHealth);
          healthAndManaStore.setMana(mana);
          healthAndManaStore.setMaxMana(maxMana);
        }
      } else {
        setHaveToken(false);
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
      const playerStore = usePlayerDataStore.getState();
      playerStore.setUsername('');
    } else {
      initializePlayerData();
    }
  };

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      const playerStore = usePlayerDataStore.getState();
      playerStore.setOnboarded(true);
      setShowHimari(true);
    } catch (error) {
      console.error('Erro ao finalizar o onboarding:', error);
    }
  };

  const handleHimariNext = () => {
    setShowHimari(false);
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

  if (!haveToken) {
    return <AuthScreen onComplete={() => initializePlayerData()} />;
  }

  const playerStore = usePlayerDataStore.getState();
  if (!playerStore.onboarded) {
    return <OnboardingScreens onComplete={handleOnboardingComplete} />;
  }

  return (
    <SnackBarProvider>
      <StatusBar style="light" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ActionSheetProvider>
            <NavThemeProvider value={NAV_THEME[colorScheme]}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="create_task"
                  options={{ presentation: 'transparentModal', animation: 'fade_from_bottom' }}
                />
                <Stack.Screen
                  name="shop_item"
                  options={{ presentation: 'transparentModal', animation: 'fade' }}
                />
                <Stack.Screen
                  name="profile_item"
                  options={{ presentation: 'transparentModal', animation: 'fade' }}
                />
              </Stack>
              {showHimari && <HimariScreen onNext={handleHimariNext} />}
            </NavThemeProvider>
          </ActionSheetProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SnackBarProvider>
  );
}
