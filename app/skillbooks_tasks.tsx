import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import Text from '~/components/Text';
import { useLocalSearchParams } from 'expo-router';
import { getSkillBookTasks, generateSkillBookTasks } from '~/services/api';
import { TaskCard } from '../components/TaskCard';
import Swipable from '../components/DailyTasks/Swipable';
import { GeneralLevel } from '~/components/GeneralLevel';
import { Container } from '~/components/Container';

const SkillBookTasks: React.FC = () => {
  const { skillBookId, title } = useLocalSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const fetchedTasks = await getSkillBookTasks(skillBookId as string);
      setTasks(fetchedTasks);
    } catch (error) {
      try {
        const generatedTasks = await generateSkillBookTasks(skillBookId as string);
        setTasks(generatedTasks);
        
        await fetchTasks();
      } catch (generationError) {
        setTasks([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCompletion = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
  };

  useEffect(() => {
    fetchTasks();
  }, [skillBookId]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="h-full pt-20 bg-[--background]">
        <Container>
          <GeneralLevel />
          <View className="mb-80 mt-20">
            <View className="relative w-full flex-col items-center justify-center">
              <View className="absolute top-0 z-[-2] h-full w-[210%] rotate-[12deg] bg-[--secondary]" />
              <View className="absolute top-0 z-[-1] h-full w-[205%] rotate-[7deg] bg-[--foreground]" />

              <View className="z-10 flex w-full flex-col items-center py-6 text-white">
                <View className="flex w-full flex-col items-center py-6 text-center">
                  <Text className="text-2xl font-black italic text-white">{title}</Text>
                  <Text className="text-[#B8B8B8]">
                    Complete as tasks para melhorar suas habilidades!
                  </Text>
                  <View className="my-4 h-[1px] w-[70%] bg-white" />

                  <View className="flex w-[95%] flex-col gap-4">
                    {isLoading ? (
                      <View className="flex items-center justify-center py-8">
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text className="mt-4 text-white">Carregando tarefas...</Text>
                      </View>
                    ) : tasks.length > 0 ? (
                      tasks.map((taskInfo: any) => (
                        <Swipable
                          key={taskInfo._id}
                          taskId={taskInfo._id}
                          userId={taskInfo.userId}
                          expPoints={taskInfo.xpReward}
                          backgroundColor="#1E1E25"
                          currentStatus={taskInfo.status}
                          onSwipeComplete={() => handleTaskCompletion(taskInfo._id)}
                        >
                          <TaskCard
                            title={taskInfo.title}
                            xpReward={taskInfo.xpReward}
                            attribute={taskInfo.attribute}
                            intensityLevel={taskInfo.intensityLevel}
                            status={taskInfo.status}
                            isDefault={false}
                          />
                        </Swipable>
                      ))
                    ) : (
                      <Text className="m-0 mx-auto text-[#B8B8B8]">
                        Nenhuma task encontrada. Tente novamente mais tarde.
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Container>
      </View>
    </ScrollView>
  );
};

export default SkillBookTasks;
