import React, { useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator, Image, Animated } from 'react-native';
import Text from '../Text';
import { TaskCard } from '../TaskCard';
import { AppUserContext } from '~/contexts/AppUserContext';
import {
  consultPendingTasks,
  consultPenaltyTasks,
  consultClassTasks,
  generateAiTasks,
  setGeneratedToday,
  completeTask,
  restoreTask,
  deleteTask,
  getSkillBookTasks,
  generateSkillBookTasks,
} from '~/services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AnimatedRollingNumbers from '../AnimatedRolling';
import AllTasksCompleted from '../AllTasksCompleted';
import LevelUpAlert from '../LevelUpAlert';
import LottieView from 'lottie-react-native';

interface TaskWrapperProps {
  taskType: 'daily' | 'user' | 'class' | 'skillbook'; // Define os tipos de tarefa
  skillBookId?: string;
  refreshSignal?: number;
}

export const TaskWrapper: React.FC<TaskWrapperProps> = ({
  taskType,
  refreshSignal,
  skillBookId,
}) => {
  const { playerData, setPlayerData } = useContext(AppUserContext);
  const [currentTasks, setCurrentTasks] = useState<any[]>([]);
  const [inPenaltyZone, setInPenaltyZone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [animations, setAnimations] = useState<Animated.Value[]>([]);
  const [allTasksCompleted, setAllTasksCompleted] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);

  const calculateTimeLeft = () => {
    const now = new Date();
    const resetTime = new Date();
    resetTime.setHours(23, 55, 0, 0);

    const diff = resetTime.getTime() - now.getTime();
    if (diff <= 0) return '00:00:00';

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

    return () => clearInterval(timer);
  }, []);

  const fetchTasks = async () => {
    if (!playerData) return;

    try {
      let tasks = [];

      if (taskType === 'daily') {
        if (playerData.inPenaltyZone) {
          tasks = await consultPenaltyTasks(playerData._id);
          tasks = tasks.filter((task: any) => task.type === 'penaltyTask');
        } else {
          if (!playerData.generatedToday) {
            setIsLoading(true);
            await generateAiTasks(playerData._id);
            setIsLoading(false);
          }

          tasks = await consultPendingTasks(playerData._id);
          tasks = tasks.filter((task: any) => task.type === 'dailyQuests');
        }
      } else if (taskType === 'user') {
        tasks = await consultPendingTasks(playerData._id);
        tasks = tasks.filter((task: any) => task.type === 'userTask');
      } else if (taskType === 'class') {
        tasks = await consultClassTasks(playerData._id);
        tasks = tasks.filter((task: any) => task.type === 'classQuests');
      } else if (taskType === 'skillbook' && skillBookId) {
        const skillBookTasks = await getSkillBookTasks(skillBookId);

        if (!skillBookTasks || skillBookTasks.length === 0) {
          setIsLoading(true);
          await generateSkillBookTasks(skillBookId);
          tasks = await getSkillBookTasks(skillBookId);
          setIsLoading(false);
        } else {
          tasks = skillBookTasks;
        }
      }

      setCurrentTasks(tasks);

      const initialAnimations = tasks.map(() => new Animated.Value(-500));
      setAnimations(initialAnimations);

      initialAnimations.forEach((animation: Animated.Value | Animated.ValueXY, index: number) => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 500,
          delay: index * 150,
          useNativeDriver: true,
        }).start();
      });
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [taskType]);

  const completeCurrentTask = async (taskId: string) => {
    try {
      const data = await completeTask(taskId, playerData._id);
  
      if (data.allTasksCompleted) {
        setAllTasksCompleted(true);
      }
  
      if (data.leveledUp === true) {
        setLeveledUp(true);
      }
  
      setPlayerData((prevPlayerData) => ({
        ...prevPlayerData, 
        ...data.user, 
      }));
    } catch (err) {
      console.error('Erro ao completar tarefa:', err);
    }
  };
  
  const restoreCurrentTask = async (taskId: string) => {
    try {
      const data = await restoreTask(taskId);

      setPlayerData((prevPlayerData) => ({
        ...prevPlayerData,
        ...data.user
      }));
    } catch (err) {
      console.error('Erro ao restaurar tarefa:', err);
    }
  };

  const handleTaskCompletion = (taskId: string) => {
    setCurrentTasks((prevTasks) =>
      prevTasks.map((task) => (task._id === taskId ? { ...task, status: 'completed' } : task))
    );

    setTimeout(() => {
      completeCurrentTask(taskId);
    }, 500);
  };

  const handleTaskRestoring = (taskId: string) => {
    setCurrentTasks((prevTasks) =>
      prevTasks.map((task) => (task._id === taskId ? { ...task, status: 'pending' } : task))
    );

    setTimeout(() => {
      restoreCurrentTask(taskId);
    }, 500);
  };

  const handleTaskRemoval = async (taskId: string) => {
    setCurrentTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));

    await deleteTask(taskId);
  };

  const getTaskImageSource = () => {
    if (playerData.inPenaltyZone) {
      return require('../../assets/penalty.png');
    }
    switch (taskType) {
      case 'daily':
        return require('../../assets/dailytitle.png');
      case 'class':
        return require('../../assets/classtasks.png');
      default:
        return require('../../assets/customtasks.png');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshSignal]); 

  return (
    <>
      {allTasksCompleted && <AllTasksCompleted onComplete={() => setAllTasksCompleted(false)} />}
      <LevelUpAlert
        visible={leveledUp}
        level={playerData?.level}
        onClose={() => setLeveledUp(false)}
      />
      <View className="mb-20 mt-10">
        <View className="relative w-full flex-col items-center justify-center">
          <View className="absolute top-0 z-[-2] h-full w-[510%] rotate-[12deg] bg-[--secondary]" />
          <View className="absolute top-0 z-[-1] h-full w-[205%] rotate-[7deg] bg-[--foreground]" />

          <View className="z-10 flex w-full flex-col items-center py-6 text-white">
            <View className="flex w-full flex-col items-center gap-2 py-6 text-center">
              <Image
                className="absolute -top-12 right-5"
                source={getTaskImageSource()}
                style={{
                  width: 270,
                  height: 100,
                }}
              />

              {isLoading && (
                <View className="mt-20 flex w-full flex-col items-center">
                  <Text className="mb-5 text-white" bold>
                    Gerando Tarefas Diárias..
                  </Text>
                  <LottieView
                    source={require('../../assets/loading4.json')} // Substitua pelo arquivo JSON da animação
                    autoPlay
                    loop
                    style={{ width: 100, height: 100 }}
                  />
                </View>
              )}

              <View className="mb-10 mt-20 flex w-[95%] flex-col gap-4">
                {(currentTasks || []).length > 0
                  ? (currentTasks || []).map((taskInfo: any, index: number) => (
                      <Animated.View
                        key={taskInfo._id}
                        style={{ transform: [{ translateX: animations[index] || 0 }] }}>
                        <TaskCard
                          title={taskInfo.title}
                          description={taskInfo.description}
                          xpReward={taskInfo.xpReward}
                          attribute={taskInfo.attribute}
                          intensityLevel={taskInfo.intensityLevel}
                          status={taskInfo.status}
                          onComplete={() => handleTaskCompletion(taskInfo._id)}
                          onRestore={() => handleTaskRestoring(taskInfo._id)}
                          onDelete={() => handleTaskRemoval(taskInfo._id)}
                          isDefault={!inPenaltyZone}
                        />
                      </Animated.View>
                    ))
                  : !isLoading && <Text className="mx-auto text-[#B8B8B8]">No tasks found.</Text>}
              </View>
              {!inPenaltyZone && taskType === 'daily' && (currentTasks || []).length > 0 && (
                <View className="mb-14 flex w-full flex-col items-center gap-6">
                  <Text className=" w-[85%] text-center text-white">
                    WARNING: Failure to complete daily missions will result in severe{' '}
                    <Text className="font-extrabold text-[#ED6466]">Penalities</Text>
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
        </View>
      </View>
    </>
  );
};
