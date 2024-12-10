import React from 'react';
import { View } from 'react-native';
import AttributeCard from './AttributeCard';
import { IntensityLevelTag } from './IntensityLevelTag';
import Text from './Text';
import { TaskConcluded } from './TaskConcluded';

interface TaskInterface {
  title: string;
  intensityLevel: 'low' | 'medium' | 'high';
  xpReward: number;
  attribute?: string; // Torna o atributo opcional
  isDefault: boolean; // Indica se é uma task padrão ou de skillbook
  status: 'completed' | 'pending';
}

type Attributes = {
  aura: number;
  vitality: number;
  focus: number;
};

const attributeIcons: { [key in keyof Attributes]: string } = {
  aura: '🤝',
  vitality: '💪',
  focus: '🧠',
};

export const TaskCard = ({
  title,
  intensityLevel,
  xpReward,
  attribute,
  isDefault,
  status,
}: TaskInterface) => {
  const isCompleted = status === 'completed';

  return (
    <View
      className={`relative max-h-32 w-full bg-[--secondary] py-4 text-white ${
        isCompleted ? 'border-b-gray-400' : 'border-b-[--accent]'
      } border-b-4`}>
      <View className="absolute left-5 top-0 z-20 rotate-[16deg]">
        {isDefault && attribute && (
          <AttributeCard
            isCompleted={isCompleted}
            icon={attributeIcons[attribute as keyof Attributes]}
          />
        )}
      </View>
      <View className="absolute right-[-25px] top-[-10px] h-32 w-12 -rotate-6 bg-[--foreground]"></View>

      <View className="relative ml-12 flex flex-row items-start justify-between">
        <View
          style={{ marginLeft: isDefault && attribute ? 20 : 0 }}
          className="flex w-full flex-col">
          <Text
            bold
            numberOfLines={2}
            className={`max-w-[85%] break-before-all text-sm uppercase ${
              isCompleted ? 'text-gray-400 line-through' : 'text-white'
            }`}>
            {title}
          </Text>
          <View className="flex flex-row items-center gap-2">
            <Text
              extraBold
              className={`text-lg ${isCompleted ? 'text-gray-400' : 'text-[--accent]'}`}>
              {xpReward} EXP
            </Text>
            <Text bold className={`text-xs ${isCompleted ? 'text-gray-400' : 'text-white'}`}>
              POINTS
            </Text>
          </View>
        </View>
        <View className="absolute -bottom-1 right-0 mr-8">
          {isCompleted ? <TaskConcluded /> : <IntensityLevelTag level={intensityLevel} />}
        </View>
      </View>

      <View className="absolute left-[-27px] top-[-10px] h-32 w-12 -rotate-6 bg-[--foreground]"></View>
    </View>
  );
};
