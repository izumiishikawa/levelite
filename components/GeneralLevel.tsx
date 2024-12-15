import React, { useContext, useEffect } from 'react';
import { View } from 'react-native';
import { ProgressIndicator } from './nativewindui/ProgressIndicator';
import { AppUserContext } from '~/contexts/AppUserContext';
import Text from './Text';
import AnimatedRollingNumbers from './AnimatedRolling';

export const GeneralLevel: React.FC = () => {
  const { playerData } = useContext(AppUserContext);

  return (
    <View className="relative mb-10 px-6">
      {playerData && (
        <>
          <Text className="absolute right-[50px] top-[-12px] z-10 text-lg text-white ">
            <Text className="text-3xl" extraBold>
              LEVEL 0{playerData.level}
            </Text>
          </Text>
          <View className="flex w-full justify-center bg-[--foreground] p-4 py-6">
            <Text
              bold
              className="text-md absolute flex flex-row items-center h-fit text-center -bottom-2 left-10 z-20"
              style={{ color: playerData.inPenaltyZone ? '#cb3d55' : '#996DFF' }}>
              EXP{' '}
                [ <AnimatedRollingNumbers className='pt-[3px]' fontSize={14} textColor={playerData.inPenaltyZone ? "#cb3d55" : '#996DFF'} value={playerData.currentXP} /> /{' '}
                  <AnimatedRollingNumbers className='pt-[3px]' fontSize={14} textColor={playerData.inPenaltyZone ? "#cb3d55" : '#996DFF'} value={playerData.xpForNextLevel} /> ]
            </Text>
            <View className="absolute bottom-[-10px] left-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
            <View className="m-auto flex w-[75%] flex-col ">
              <ProgressIndicator
                barColor={playerData.inPenaltyZone ? '#cb3d55' : '#996DFF'}
                value={playerData.currentXP}
                max={playerData.xpForNextLevel}
              />
            </View>
            <View className="absolute bottom-[-12px] right-[-40px] h-56 w-12 rotate-[15deg] bg-[--background]" />
          </View>
        </>
      )}
    </View>
  );
};
