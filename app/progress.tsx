import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Text from '~/components/Text';
import Title from '~/components/Title';
import { getProgressCalendar } from '~/services/api';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from 'react-native-chart-kit';

type CalendarData = {
  day: number;
  status: 'penalty' | 'completed' | 'escaped' | null;
};

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const Progress: React.FC = () => {
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [xpEarned, setTotalExpEarned] = useState<number>(0);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  const fetchCalendarData = async (year: number, month: number) => {
    setLoading(true);
    const data = await getProgressCalendar(year, month);
    setTotalExpEarned(data.totalXpGained);
    setTotalTasks(data.totalCompletedTasks);
    if (data) {
      setCalendarData(data.progress);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCalendarData(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth() + 1;

    if (currentYear < thisYear || (currentYear === thisYear && currentMonth < thisMonth)) {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Calculating user progress
  const completedDays = calendarData.filter((day) => day.status === 'completed').length;
  const progressMessage = (() => {
    if (completedDays > 20) {
      return `Astonishing! You've dominated this month with ${completedDays} days of triumph. Your legacy grows stronger with each passing day.`;
    } else if (completedDays > daysInMonth / 2) {
      return `Well done! With ${completedDays} days of success, you've proven your resilience. Keep pushing forward—greatness is within your grasp.`;
    } else if (completedDays > 0) {
      return `Not bad, but you can do better! ${completedDays} victories are a start, but remember, every day counts on the path to mastery.`;
    } else {
      return `No progress this month. Rise from the ashes like a phoenix and reclaim your honor! Your journey starts now.`;
    }
  })();

  // Preparar dados para o gráfico
  const chartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayData = calendarData.find((d) => d.day === day);

    if (dayData) {
      switch (dayData.status) {
        case 'completed':
          return 100; // Pontos altos
        case 'penalty':
          return 0; // Pontos baixos
        default:
          return 50; // Faixa intermediária
      }
    }
    return 50; // Dias sem atividade
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="mb-20">
      <View className="flex h-full w-full flex-col items-center bg-[--background] pt-20">
        <View className="w-[80%]">
          <Title text="Progress Calendar" />
        </View>
        <View className="mx-auto mt-10 flex w-[90%] flex-col items-center">
          <View className="mb-5 flex flex-col gap-2 self-start">
            <View className="flex flex-row items-center gap-2">
              <View className="h-6 w-6 rounded-md bg-[#cb3d55]"></View>
              <Text className="text-sm text-white">
                You entered the penalty zone and lost progress.
              </Text>
            </View>
            <View className="flex flex-row items-center gap-2">
              <View className="h-6 w-6 rounded-md bg-[--accent]"></View>
              <Text className="text-sm text-white">All tasks completed successfully!</Text>
            </View>
          </View>

          <View className="my-4 h-[1px] w-full bg-white" />

          <Text black style={styles.currentMonthText} className="mb-1 text-2xl">
            {`${monthNames[currentMonth - 1]} ${currentYear} `}
          </Text>

          {/* Dynamic Progress Message */}
          <Text className="mb-4 text-center text-sm text-[#B8B8B8]">{progressMessage}</Text>

          <View className="mx-auto flex flex-row flex-wrap">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayData = calendarData.find((d) => d.day === day);
              let backgroundColor = styles.noActivity.backgroundColor;

              if (dayData) {
                switch (dayData.status) {
                  case 'penalty':
                    backgroundColor = styles.penalty.backgroundColor;
                    break;
                  case 'completed':
                    backgroundColor = styles.completed.backgroundColor;
                    break;
                  case 'escaped':
                    backgroundColor = styles.incomplete.backgroundColor;
                    break;
                  default:
                    backgroundColor = styles.noActivity.backgroundColor;
                }
              }

              return (
                <View key={day} style={[styles.day, { backgroundColor }]}>
                  <Text style={styles.dayText}>{day}</Text>
                </View>
              );
            })}
          </View>

          <View className="mt-4 flex flex-row gap-4 self-start">
            <TouchableOpacity
              onPress={handlePreviousMonth}
              className="rounded-full bg-[--accent] px-4 py-1">
              <Text className="text-sm text-white">Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`rounded-full px-4 py-1 ${
                currentYear === new Date().getFullYear() &&
                currentMonth === new Date().getMonth() + 1
                  ? 'bg-gray-500'
                  : 'bg-[--accent]'
              }`}
              onPress={handleNextMonth}
              disabled={
                currentYear === new Date().getFullYear() &&
                currentMonth === new Date().getMonth() + 1
              }>
              <Text
                style={{
                  color:
                    currentYear === new Date().getFullYear() &&
                    currentMonth === new Date().getMonth() + 1
                      ? '#fff'
                      : '#fff',
                }}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
    backgroundColor: '#996DFF',
    borderRadius: 5,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  currentMonthText: {
    color: '#fff',
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  day: {
    width: 28,
    height: 28,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  dayText: {
    color: '#fff',
    fontSize: 11,
  },
  penalty: {
    backgroundColor: '#cb3d55',
  },
  completed: {
    backgroundColor: '#996DFF',
  },
  incomplete: {
    backgroundColor: '#faaf00',
  },
  noActivity: {
    backgroundColor: '#2A2A35',
  },
});

export default Progress;
