import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import Text from '../Text';
import { classes } from '~/utils/classes';
import Title from '../Title';
import TypeWriter from 'react-native-typewriter'

interface ClassSelectionScreenProps {
  onNext: (selectedClass: 'shadow' | 'guardian' | 'visionary' | 'titan' | 'mindbreaker') => void;
  onPrevious: () => void;
}

export const ClassSelectionScreen: React.FC<ClassSelectionScreenProps> = ({
  onNext,
  onPrevious,
}) => {
  const [selectedClass, setSelectedClass] = useState<
    'shadow' | 'guardian' | 'visionary' | 'titan' | 'mindbreaker' | null
  >(null);
  const [expandedClass, setExpandedClass] = useState<
    'shadow' | 'guardian' | 'visionary' | 'titan' | 'mindbreaker' | null
  >(null);
  const animationValue = useState(new Animated.Value(0))[0];

  const handleSelectClass = (
    classId: 'shadow' | 'guardian' | 'visionary' | 'titan' | 'mindbreaker'
  ) => {
    if (classId === expandedClass) {
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.ease,
      }).start(() => setExpandedClass(null));
    } else {
      setSelectedClass(classId);
      setExpandedClass(classId);
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.ease,
      }).start();
    }
  };

  const handleNext = () => {
    if (selectedClass) {
      onNext(selectedClass);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
      className="w-full">
      <View className="w-[80%] mt-32 mb-10">
        <Title text="Forge Your Destiny" />
      </View>

      {classes.map((cls) => {
        const isExpanded = expandedClass === cls.id;

        return (
          <TouchableOpacity
            key={cls.id}
            onPress={() =>
              handleSelectClass(
                cls.id as 'shadow' | 'guardian' | 'visionary' | 'titan' | 'mindbreaker'
              )
            }
            style={{
              backgroundColor: isExpanded ? '#2A2A35' : 'transparent',
              width: "100%",
              paddingVertical: 16,
              marginBottom: 8,
              position: "relative"
            }}>
            <View className="flex w-[80%] justify-center mx-auto items-center">
              <Image source={cls.icon} style={{ width: 60, height: 60 }} resizeMode="contain" />
              <Text className="mt-2 text-center text-lg font-bold text-white">{cls.name}</Text>
            </View>
            {isExpanded && (
              <Animated.View style={{ opacity: animationValue, width: "80%", marginTop: 16, marginHorizontal: "auto" }}>
                <Text className="px-4 text-center text-[#B8B8B8]"><TypeWriter maxDelay={2} minDelay={1} typing={1} fixed>{cls.description}</TypeWriter></Text>
                <Text className="mt-2 px-4 text-center text-[#FAAF00]"><TypeWriter maxDelay={2} initialDelay={2000} minDelay={1} typing={1} fixed>Special Ability: {cls.specialAbility}</TypeWriter></Text>
                <Text className="mt-1 px-4 text-center text-[#B8B8B8]"><TypeWriter maxDelay={2} initialDelay={2500} minDelay={1} typing={1} fixed>Effect: {cls.abilityEffect}</TypeWriter></Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        );
      })}

      <View className="mb-12 mt-6 flex flex-col justify-between w-[80%] gap-2">
        <TouchableOpacity
          onPress={handleNext}
          className={`w-full items-center rounded-md p-4 ${selectedClass ? 'bg-[#996DFF]' : 'bg-gray-500 opacity-50'}`}
          disabled={!selectedClass}>
          <Text className="font-bold text-white">Next</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPrevious}
          className="w-full items-center rounded-md bg-[--foreground] p-4">
          <Text className="font-bold text-white">Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ClassSelectionScreen;
