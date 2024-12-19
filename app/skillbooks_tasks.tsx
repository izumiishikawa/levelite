import React from 'react';
import { View, ScrollView } from 'react-native';
import { GeneralLevel } from '~/components/GeneralLevel';
import { Container } from '~/components/Container';
import { TaskWrapper } from '~/components/DailyTasks/TaskWrapper';
import Title from '~/components/Title';
import useParams from '~/hooks/useParams';
import { useLocalSearchParams } from 'expo-router';

const SkillBookTasks: React.FC = () => {
  const { title, skillBookId } = useLocalSearchParams();
  const { generatedToday } = useParams<'SkillBookTasks'>();

  return (
    <ScrollView
      className="h-full w-full bg-[--background] pt-20"
      contentContainerStyle={{ flexGrow: 1 }}>
      <Container>
        <View className="mx-auto mb-20 w-[80%]">
          <Title text={title as string} />
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
