import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import Text from '~/components/Text';
import { useLocalSearchParams } from 'expo-router';
import { getSkillBookTasks, generateSkillBookTasks } from '~/services/api';
import { TaskCard } from '../components/TaskCard';
import { GeneralLevel } from '~/components/GeneralLevel';
import { Container } from '~/components/Container';
import { TaskWrapper } from '~/components/DailyTasks/TaskWrapper';

const SkillBookTasks: React.FC = () => {
  const { skillBookId, title } = useLocalSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ScrollView className="h-full w-full bg-[--background] pt-20" contentContainerStyle={{ flexGrow: 1 }}>
      <Container>
        <GeneralLevel />
        <TaskWrapper skillBookId={skillBookId as string} taskType="skillbook" />
      </Container>
    </ScrollView>
  );
};

export default SkillBookTasks;
