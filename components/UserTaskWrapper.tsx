import React, { useContext, useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import Text from './Text';
import { TaskCard } from './TaskCard';
import { AppUserContext } from '~/contexts/AppUserContext';
import { consultPendingTasks } from '~/services/api'; // Função de API para buscar tarefas do tipo "userTask"
import Swipable from './DailyTasks/Swipable';

export const UserTaskWrapper: React.FC = () => {
  const { playerData } = useContext(AppUserContext);
  const [userTasks, setUserTasks] = useState<any[]>([]);

  const fetchTasks = async () => {
    if (playerData) {
      try {
        // Busca todas as tarefas pendentes
        const tasks = await consultPendingTasks(playerData._id);

        // Filtra apenas as tarefas do tipo "userTask"
        const userTasks = tasks.filter((task: any) => task.type === 'userTask');

        setUserTasks(userTasks);
      } catch (error) {
        console.error('Erro ao buscar tarefas do usuário:', error);
      }
    }
  };

  useEffect(() => {
    const fetchUserTasks = async () => {
      if (playerData) {
        try {
          // Busca todas as tarefas pendentes
          const tasks = await consultPendingTasks(playerData._id);

          // Filtra apenas as tarefas do tipo "userTask"
          const userTasks = tasks.filter((task: any) => task.type === 'userTask');

          setUserTasks(userTasks);
        } catch (error) {
          console.error('Erro ao buscar tarefas do usuário:', error);
        }
      }
    };

    fetchUserTasks();
  }, [playerData]);

  const handleTaskCompletion = (taskId: string) => {
    setUserTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    fetchTasks()
  };

  // Organiza as tarefas para exibir as 'pending' antes das 'completed'
  const sortedTasks = userTasks.sort((a, b) => {
    if (a.status === 'pending' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status === 'pending') return 1;
    return 0;
  });

  return (
    <View className="mb-80 mt-10">
      <View className="relative w-full flex-col items-center justify-center">
        <View className="absolute top-0 z-[-2] h-full w-[210%] rotate-[12deg] bg-[--secondary]" />
        <View className="absolute top-0 z-[-1] h-full w-[205%] rotate-[7deg] bg-[--foreground]" />

        <View className="z-10 flex w-full flex-col items-center py-6 text-white">
          <View className="flex w-full flex-col items-center py-6 text-center">
          <Image
              className="absolute right-5 -top-12"
              source={require('../assets/customtasks.png')}
              style={{
                width: 270,
                height: 100,
              }}
            />

            <View className="my-10 flex w-[95%] flex-col gap-4">
              {sortedTasks.length > 0 ? (
                sortedTasks.map((taskInfo: any, index: number) => (
                  <Swipable
                    key={taskInfo._id}
                    taskId={taskInfo._id}
                    userId={taskInfo.userId}
                    expPoints={taskInfo.xpReward}
                    currentStatus={taskInfo.status}
                    backgroundColor="#1E1E25"
                    onSwipeComplete={() => handleTaskCompletion(taskInfo._id)}>
                    <TaskCard
                      title={taskInfo.title}
                      xpReward={taskInfo.xpReward}
                      attribute={taskInfo.attribute}
                      intensityLevel={taskInfo.intensityLevel}
                      status={taskInfo.status}
                      isDefault={true} // Sempre "true" para tarefas do usuário
                    />
                  </Swipable>
                ))
              ) : (
                <Text className="m-0 mx-auto text-[#B8B8B8]">...</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
