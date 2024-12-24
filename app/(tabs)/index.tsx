import React, { useContext, useState, useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, SafeAreaView } from 'react-native';
import Text from '~/components/Text';
import { Container } from '~/components/Container';
import { GeneralLevel } from '~/components/GeneralLevel';
import { Calendar } from '~/components/Calendar';
import { TaskWrapper } from '~/components/DailyTasks/TaskWrapper';
import { AppUserContext } from '~/contexts/AppUserContext';
import { consultPlayerStatus, setGeneratedToday } from '~/services/api';
import Icon from "react-native-vector-icons/FontAwesome6"
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
  const [taskView, setTaskView] = useState<'s-system' | 'custom'>('s-system');
  const { id, generatedToday, setGeneratedToday, classGeneratedWeek } = usePlayerDataStore(
    useShallow((state) => ({
      id: state.id,
      generatedToday: state.generatedToday,
      setGeneratedToday: state.setGeneratedToday,
      classGeneratedWeek: state.classGeneratedWeek,
    }))
  );

  const { inPenaltyZone, setInPenaltyZone } = usePenaltyZoneStore(
    useShallow((state) => ({ inPenaltyZone: state.inPenaltyZone, setInPenaltyZone: state.setInPenaltyZone }))
  );

  const router = useRouter();

  const handleRefresh = useCallback(async () => {
    const storedPlayerData = await consultPlayerStatus();
    setGeneratedToday(true)
    setInPenaltyZone(false);

    if (storedPlayerData) {
      const {
        _id,
        onboarded,
        generatedToday,
        classGeneratedWeek,
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

      const playerStore = usePlayerDataStore.getState();
      playerStore.setId(_id);
      playerStore.setGeneratedToday(generatedToday);
      playerStore.setClassGeneratedWeek(classGeneratedWeek);
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

      setRefreshSignal(Math.random());
    }
  }, [taskView]);

  const renderTaskWrappers = useMemo(() => {
    if (!id) {
      return null;
    }

    if (taskView === 's-system') {
      return (
        <>
          <TaskWrapper refreshSignal={refreshSignal} taskType="daily" />
          {!inPenaltyZone && <TaskWrapper refreshSignal={refreshSignal} taskType="class" />}
        </>
      );
    } else if (taskView === 'custom') {
      return <TaskWrapper refreshSignal={refreshSignal} taskType="user" />;
    }
  }, [refreshSignal, inPenaltyZone, id, taskView]);

  const insets = useSafeAreaInsets();
  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-[--background]">
        <View className="mt-20 flex w-full flex-col items-center">
          <Text className="mb-5 text-white" bold>
            Loading..
          </Text>
          <LottieView
            source={require('../../assets/loading4.json')}
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
        <View className="h-full">
          <Container>
            <Calendar />
            <View>
            <GeneralLevel />

            <View
          className="mx-auto absolute right-8 bottom-8 border-2 rounded-full border-[--foreground] z-50"
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
          <TouchableOpacity
            className="rounded-l-full px-2 py-0.5"
            style={{ backgroundColor: taskView === 's-system' ? '#996DFF' : '#17171C' }}
            onPress={() => setTaskView('s-system')}>
            <Text
              style={{ color: taskView === 's-system' ? '#fff' : '#B8B8B8', fontSize: 10 }}
              bold>
              S-System
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-r-full px-2 py-0.5"
            style={{ backgroundColor: taskView === 'custom' ? '#996DFF' : '#17171C' }}
            onPress={() => setTaskView('custom')}>
            <Text
              style={{ color: taskView === 'custom' ? '#fff' : '#B8B8B8', fontSize: 10 }}
              bold>
              Custom
            </Text>
          </TouchableOpacity>
        </View>

            </View>

            {renderTaskWrappers}
          </Container>
        </View>
      </ScrollView>

      {!inPenaltyZone && taskView === "s-system" && (
        <TouchableOpacity
          className="absolute right-6 h-14 w-14 items-center justify-center rounded-full bg-[--accent] shadow-lg"
          style={{ bottom: insets.bottom + 86 }}
          onPress={() =>
            router.push({
              pathname: '/roadmap',
              params: { userId: id },
            })
          }>
          <Text className="text-2xl font-bold text-white"><Icon name='dungeon' size={30} /></Text>
        </TouchableOpacity>
      )}

      {!inPenaltyZone && taskView === "custom" && (
        <TouchableOpacity
          className="absolute right-6 h-14 w-14 items-center justify-center rounded-full bg-[--accent] shadow-lg"
          style={{ bottom: insets.bottom + 86 }}
          onPress={() =>
            router.push({
              pathname: '/create_task',
              params: { userId: id },
            })
          }>
          <Text className="text-2xl font-bold text-white"><Icon name='square-plus' size={30} /></Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Index;
