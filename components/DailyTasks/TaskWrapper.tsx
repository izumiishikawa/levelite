import React, { useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import Text from '../Text';
import { TaskCard } from '../TaskCard';
import { AppUserContext } from '~/contexts/AppUserContext';
import { consultPendingTasks, consultPenaltyTasks, generateAiTasks } from '~/services/api';
import Swipable from './Swipable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AllTasksCompleted from '../AllTasksCompleted';

export const TaskWrapper: React.FC = () => {
  const { playerData, setPlayerData } = useContext(AppUserContext);
  const [currentTasks, setCurrentTasks] = useState<any[]>([]);
  const [inPenaltyZone, setInPenaltyZone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [allTasksDone, setAllTasksDone] = useState(false);

  const calculateTimeLeft = () => {
    const now = new Date();
    const resetTime = new Date();
    resetTime.setHours(23, 55, 0, 0); // Define o horário de reset (23:00)

    const diff = resetTime.getTime() - now.getTime(); // Calcula a diferença em milissegundos
    if (diff <= 0) return '00:00:00'; // Se já passou das 23h, retorna zero.

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer); // Limpa o intervalo quando o componente desmontar
  }, []);

  const fetchTasks = async () => {
    if (!playerData) return;

    setIsLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const lastGeneratedDate = await AsyncStorage.getItem('lastGeneratedDate');

      // Define se estamos na zona de penalidade
      const isPenaltyZone = playerData.inPenaltyZone;
      setInPenaltyZone(isPenaltyZone);

      // Verifica se as tarefas já foram geradas hoje
      if (lastGeneratedDate === today) {
        // Recupera as tarefas pendentes existentes
        const pendingTasks = await consultPendingTasks(playerData._id);
        setCurrentTasks(pendingTasks);
      } else {
        // Gera novas tarefas
        if (isPenaltyZone) {
          const penaltyTasks = await consultPenaltyTasks(playerData._id);
          setCurrentTasks(penaltyTasks);
        } else {
          const generatedTasks = await generateAiTasks(playerData._id);
          setCurrentTasks(generatedTasks);
        }

        // Atualiza o AsyncStorage com a nova data
        await AsyncStorage.setItem('lastGeneratedDate', today);
      }
    } catch (error) {
      console.error('Erro ao buscar ou gerar tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [playerData]);

  const handleTaskCompletion = (taskId: string) => {
    setCurrentTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    fetchTasks();
  };

  // Organiza as tarefas para exibir as 'pending' antes das 'completed'
  const sortedTasks = currentTasks.sort((a, b) => {
    if (a.status === 'pending' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status === 'pending') return 1;
    return 0;
  });

  return (
    <View className="mb-20 mt-10">
      <View className="relative w-full flex-col items-center justify-center">
        <View className="absolute top-0 z-[-2] h-full w-[510%] rotate-[12deg] bg-[--secondary]" />
        <View className="absolute top-0 z-[-1] h-full w-[205%] rotate-[7deg] bg-[--foreground]" />

        <View className="z-10 flex w-full flex-col items-center py-6 text-white">
          <View className="flex w-full flex-col items-center gap-2 py-6 text-center">
            <Image
              className="absolute right-5 -top-12"
              source={require('../../assets/dailytitle.png')}
              style={{
                width: 270,
                height: 100,
              }}
            />
            {/* <View className="flex flex-row items-center justify-center gap-2">
              <Icon name="alert-circle-outline" size={30} color="#fff" />

              <Text black className="text-2xl text-white">
                {inPenaltyZone ? 'ZONA DE PENALIDADE' : 'DAILY QUESTS'}
              </Text>
            </View>

            <Text className="text-[#B8B8B8]">
              {inPenaltyZone
                ? 'Complete suas penalidades para sair da zona de penalidade'
                : 'Complete as missões para ganhar EXP'}
            </Text> */}

            <View className="mt-12 flex w-[95%] flex-col gap-4">
              {sortedTasks.filter((task) => task.type === 'dailyQuests').length > 0 ? (
                sortedTasks
                  .filter((task) => task.type === 'dailyQuests')
                  .map((taskInfo: any, index: number) => (
                    <Swipable
                      key={taskInfo._id}
                      taskId={taskInfo._id}
                      userId={taskInfo.userId}
                      expPoints={taskInfo.xpReward}
                      backgroundColor="#1E1E25"
                      onSwipeComplete={() => handleTaskCompletion(taskInfo._id)}
                      currentStatus={taskInfo.status}
                      onAllTasksCompleted={() =>
                        setPlayerData((prevPlayerData) => ({
                          ...prevPlayerData,
                          allTasksDone: true,
                        }))
                      }>
                      <TaskCard
                        title={taskInfo.title}
                        xpReward={taskInfo.xpReward}
                        attribute={taskInfo.attribute}
                        intensityLevel={taskInfo.intensityLevel}
                        status={taskInfo.status}
                        isDefault={!inPenaltyZone}
                      />
                    </Swipable>
                  ))
              ) : (
                <Text className="mx-auto my-10 text-[#B8B8B8]">...</Text>
              )}
            </View>
          </View>
        </View>
        {!inPenaltyZone && sortedTasks.filter((task) => task.type === 'dailyQuests').length > 0 && (
          <View className="mb-20 flex w-full flex-col items-center gap-6">
            <Text className=" w-[85%] text-center text-white">
              AVISO: O não cumprimento das missões diárias resultará em sua devida{' '}
              <Text className="font-extrabold text-[#ED6466]">Penalidade</Text>
            </Text>

            <View className="mb-4 flex flex-row items-center gap-2">
              <Icon name="timer-sand" size={40} color="#fff" />
              <Text bold className="text-4xl text-white">
                {timeLeft}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
