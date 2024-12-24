import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ProgressIndicator } from './nativewindui/ProgressIndicator';
import Text from './Text';
import AnimatedRollingNumbers from './AnimatedRolling';
import Icon from 'react-native-vector-icons/Ionicons';
import { useLevelsAndExpStore, usePenaltyZoneStore } from '~/stores/mainStore';
import { useShallow } from 'zustand/shallow';


export const GeneralLevel: React.FC = () => {
  const { level, currentXP, xpForNextLevel } = useLevelsAndExpStore(
    useShallow((state) => ({
      level: state.level,
      currentXP: state.currentXP,
      xpForNextLevel: state.xpForNextLevel,
    }))
  );

  const { inPenaltyZone } = usePenaltyZoneStore(
    useShallow((state) => ({ inPenaltyZone: state.inPenaltyZone }))
  );

  const barColor = inPenaltyZone ? '#cb3d55' : '#996DFF';

  return (
    <View className="relative mb-10 px-6">
      <Text className="absolute right-[50px] top-[-12px] z-10 text-lg text-white">
        <Text className="text-3xl" extraBold>
          LEVEL {level.toString().padStart(2, '0')}
        </Text>
      </Text>
      <View className="flex w-full justify-center bg-[--foreground] p-4 py-6">
        <View className="text-md absolute -bottom-2 left-10 z-20 flex h-fit flex-row items-center text-center">
          <Icon name="sparkles" style={{ marginRight: 4 }} size={17} color={barColor} />
          <Text style={{ color: barColor }} black>
            EXP{' '}
          </Text>
          <Text style={{ color: barColor }} black>
            [
            <AnimatedRollingNumbers
              className="pt-[3px]"
              fontSize={14}
              textColor={barColor}
              value={currentXP || 0}
            />{' '}
            /{' '}
            <AnimatedRollingNumbers
              className="pt-[3px]"
              fontSize={14}
              textColor={barColor}
              value={xpForNextLevel || 0}
            />{' '}
            ]
          </Text>
        </View>

        <View className="absolute bottom-[-10px] left-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
        <View className="m-auto flex w-[75%] flex-col">
          <ProgressIndicator
            barColor={barColor}
            value={currentXP || 0}
            max={xpForNextLevel || 1} // Garantia de evitar divisões por zero
          />
        </View>
        <View className="absolute bottom-[-12px] right-[-40px] h-56 w-12 rotate-[15deg] bg-[--background]" />
      </View>
    </View>
  );
};
