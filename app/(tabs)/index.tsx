import React, { useContext, useState, useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import Text from '~/components/Text';
import { Container } from '~/components/Container';
import { GeneralLevel } from '~/components/GeneralLevel';
import { Calendar } from '~/components/Calendar';
import { TaskWrapper } from '~/components/DailyTasks/TaskWrapper';
import { AppUserContext } from '~/contexts/AppUserContext';
import { consultPlayerStatus } from '~/services/api';
import { useRouter } from 'expo-router';
import { usePenaltyZoneStore, usePlayerDataStore } from '~/stores/mainStore';
import { useShallow } from 'zustand/shallow';

const Index: React.FC = () => {
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { id } = usePlayerDataStore(
    useShallow((state) => ({ id: state.id }))
  );
  
  const { inPenaltyZone } = usePenaltyZoneStore(
    useShallow((state) => ({ inPenaltyZone: state.inPenaltyZone }))
  );
  
  const router = useRouter();

  const handleRefresh = useCallback(async () => {
  
  }, []);

  const renderTaskWrappers = useMemo(() => {
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
  }, [refreshSignal, inPenaltyZone]);

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-[--background]">
        <Text className="text-lg text-white">Carregando...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Conteúdo principal */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <View className="h-full bg-[--background]">
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
          className="absolute bottom-28 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[--accent] shadow-lg"
          onPress={() =>
            router.push({
              pathname: '/create_task',
              params: { userId: id },
            })
          }
        >
          <Text className="text-2xl font-bold text-white">+</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default Index;
