import React, { useContext, useState, useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, SafeAreaView } from 'react-native';
import Text from '~/components/Text';
import { Container } from '~/components/Container';
import { GeneralLevel } from '~/components/GeneralLevel';
import { Calendar } from '~/components/Calendar';
import { TaskWrapper } from '~/components/DailyTasks/TaskWrapper';
import { AppUserContext } from '~/contexts/AppUserContext';
import { consultPlayerStatus } from '~/services/api';
import { useRouter } from 'expo-router';
import {
  useAttributesStore,
  useCoinsAndStreakStore,
  useHealthAndManaStore,
  useLevelsAndExpStore,
  usePenaltyZoneStore,
  usePlayerDataStore,
} from '~/stores/mainStore';
import { useShallow } from 'zustand/shallow';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Index: React.FC = () => {
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { id, generatedToday } = usePlayerDataStore(
    useShallow((state) => ({ id: state.id, generatedToday: state.generatedToday }))
  );

  const { inPenaltyZone } = usePenaltyZoneStore(
    useShallow((state) => ({ inPenaltyZone: state.inPenaltyZone }))
  );

  const router = useRouter();

  const handleRefresh = useCallback(async () => {
    setRefreshSignal(refreshSignal + 1);
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
      playerStore.setOnboarded(onboarded);

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
  }, []);

  const renderTaskWrappers = useMemo(() => {
    if (!id) {
      return null;
    }

    return (
      <>
        <TaskWrapper refreshSignal={refreshSignal} taskType="daily" />
        {!inPenaltyZone && (
          <>
            <TaskWrapper refreshSignal={refreshSignal} taskType="class" />
            <TaskWrapper refreshSignal={refreshSignal} taskType="user" />
          </>
        )}
      </>
    );
  }, [refreshSignal, inPenaltyZone, id]);

  const insets = useSafeAreaInsets(); // Obtem os espaçamentos seguros

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-[--background]">
        <View className="mt-20 flex w-full flex-col items-center">
          <Text className="mb-5 text-white" bold>
            Loading..
          </Text>
          <LottieView
            source={require('../../assets/loading4.json')} // Substitua pelo arquivo JSON da animação
            autoPlay
            loop
            style={{ width: 100, height: 100 }}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[--background]">
      {/* Conteúdo principal */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
        <View className="h-full">
          <Container>
            <Calendar />
            <GeneralLevel />
            {renderTaskWrappers}
          </Container>
        </View>
      </ScrollView>

      {/* Botão de criar tarefa */}
      {!inPenaltyZone && (
        <TouchableOpacity
          className="absolute right-6 h-14 w-14 items-center justify-center rounded-full bg-[--accent] shadow-lg"
          style={{ bottom: insets.bottom + 86 }} // Adiciona margem inferior com base no SafeArea
          onPress={() =>
            router.push({
              pathname: '/create_task',
              params: { userId: id },
            })
          }>
          <Text className="text-2xl font-bold text-white">+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Index;
