import React from 'react';
import { View, ScrollView } from 'react-native';
import { GeneralLevel } from '~/components/GeneralLevel';
import { Container } from '~/components/Container';
import { TaskWrapper } from '~/components/DailyTasks/TaskWrapper';
import Title from '~/components/Title';
import useParams from '~/hooks/useParams';
import { useLocalSearchParams } from 'expo-router';
import Text from '~/components/Text';

const SkillBookTasks: React.FC = () => {
  const { title, level, difficulty, skillBookId } = useLocalSearchParams();
  const { generatedToday } = useParams<'SkillBookTasks'>();

  const intensityLevels = {
    low: {
      color: '#996DFF',
      text: 'Easy',
    },
    medium: {
      color: '#FAAF00',
      text: 'Medium',
    },
    high: {
      color: '#ED6466',
      text: 'Hard',
    },
  };

  return (
    <ScrollView
      className="h-full w-full bg-[--background] pt-20"
      contentContainerStyle={{ flexGrow: 1 }}>
      <Container>
        <View className="mx-auto mb-20 w-[80%]">
          <Title text={title as string} />

          <View className="flex flex-row gap-2 justify-center mt-4">
            <View className='px-4 py-1 rounded-full' style={{backgroundColor: intensityLevels[difficulty].color}}>
              <Text className="text-white">{intensityLevels[difficulty].text}</Text>
            </View>

            <View className='bg-[--foreground] px-4 py-1 rounded-full'>
              <Text className="text-white capitalize">{level}</Text>
            </View>
          </View>
        </View>

        <GeneralLevel />
        <TaskWrapper
          skillBookId={skillBookId as string}
          skillBookGeneratedToday={generatedToday}
          taskType="skillbook"
        />
      </Container>
    </ScrollView>
  );
};

export default SkillBookTasks;
