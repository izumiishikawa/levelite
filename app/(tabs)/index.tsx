import React, { useContext, useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import Text from '~/components/Text';
import { useNavigation } from 'expo-router';
import { Container } from '~/components/Container';
import { GeneralLevel } from '~/components/GeneralLevel';
import { AttributeArc } from '~/components/AttributeArc';
import { AppUserContext } from '~/contexts/AppUserContext';
import { TaskWrapper } from '~/components/DailyTasks/TaskWrapper';
import { consultPlayerStatus } from '~/services/api';
import CreateTask from '~/components/CreateTask';
import LevelUpAlert from '~/components/LevelUpAlert';
import AllTasksCompleted from '~/components/AllTasksCompleted';
import { Calendar } from '~/components/Calendar';
import 'react-native-reanimated';

// Definição dos tipos de atributos
type Attributes = {
  focus: number;
  vitality: number;
  aura: number;
};

const Index: React.FC = () => {
  const { playerData, setPlayerData } = useContext(AppUserContext);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigation = useNavigation();
  const attributeIcons: { [key in keyof Attributes]: string } = {
    focus: '🧠',
    vitality: '💪',
    aura: '🤝',
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updatedPlayerData = await consultPlayerStatus();
      setPlayerData(updatedPlayerData);
      setRefreshSignal((prev) => prev + 1);
    } catch (error) {
      console.error('Erro ao atualizar dados do jogador:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [setPlayerData]);

  if (!playerData) {
    return (
      <View className="flex-1 items-center justify-center bg-[--background]">
        <Text className="text-lg text-white">Carregando...</Text>
      </View>
    );
  }

  return (
    <>
      {isCreateOpen && (
        <CreateTask userId={playerData._id} onClose={() => setIsCreateOpen(false)} />
      )}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
        <View className="h-full bg-[--background]">
          <Container>
            <Calendar />
            <GeneralLevel />
            <TaskWrapper refreshSignal={refreshSignal} taskType="daily" />

            {playerData.inPenaltyZone === false && (
              <>
                <TaskWrapper refreshSignal={refreshSignal} taskType="class" />
                <TaskWrapper refreshSignal={refreshSignal} taskType="user" />
              </>
            )}
          </Container>
        </View>
      </ScrollView>

      {playerData.inPenaltyZone === false && (
        <TouchableOpacity
          className="absolute bottom-28 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[--accent] shadow-lg"
          onPress={() => setIsCreateOpen(!isCreateOpen)}>
          <Text className="text-2xl font-bold text-white">+</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default Index;
