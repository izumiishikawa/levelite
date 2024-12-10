import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import Text from '~/components/Text';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigation } from 'expo-router'; // Navegação
import { Container } from '../../components/Container';
import { GeneralLevel } from '../../components/GeneralLevel';
import { AttributeArc } from '~/components/AttributeArc';
import { AppUserContext } from '~/contexts/AppUserContext';
import { TaskWrapper } from '~/components/DailyTasks/TaskWrapper';
import { consultPlayerStatus } from '~/services/api';
import CreateTask from '~/components/CreateTask';
import { UserTaskWrapper } from '~/components/UserTaskWrapper';
import LevelUpAlert from '~/components/LevelUpAlert';
import AllTasksCompleted from '~/components/AllTasksCompleted';
import { Calendar } from '~/components/Calendar';

// Definição dos tipos de atributos
type Attributes = {
  focus: number;
  vitality: number;
  aura: number;
};

// Tipo de playerData com os atributos definidos
type PlayerData = {
  attributes: Attributes;
};

export default function Index() {
  const { playerData, setPlayerData } = useContext(AppUserContext);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const navigation = useNavigation();
  const attributeIcons: { [key in keyof Attributes]: string } = {
    focus: '🧠',
    vitality: '💪',
    aura: '🤝',
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Atualiza os dados do jogador e verifica nível
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updatedPlayerData = await consultPlayerStatus('673666aaec06d31576b6f4eb');

      setPlayerData(updatedPlayerData);
    } catch (error) {
      console.error('Failed to refresh player data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!playerData) {
    // Exibe um indicador de carregamento enquanto os dados do jogador não estão disponíveis
    return (
      <View className="flex-1 items-center justify-center bg-[--background]">
        <Text className="text-lg text-white">Carregando...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Create Task Modal */}
      {isCreateOpen && (
        <CreateTask userId={playerData._id} onClose={() => setIsCreateOpen(false)} />
      )}

      {/* Conteúdo Principal */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
        <View className="h-full bg-[--background]">
          <Container>
            <Calendar />
            <GeneralLevel />
            <TaskWrapper />
            <UserTaskWrapper />
          </Container>
        </View>
      </ScrollView>

      {/* Botão para criar tarefas */}
      <TouchableOpacity
        className="absolute bottom-28 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[--accent] shadow-lg"
        onPress={() => setIsCreateOpen(!isCreateOpen)}>
        <Text className="text-2xl font-bold text-white">+</Text>
      </TouchableOpacity>
    </>
  );
}
