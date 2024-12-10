import React, { useContext, useEffect } from 'react';
import { View } from 'react-native';
import { ProgressIndicator } from './nativewindui/ProgressIndicator';
import { AppUserContext } from '~/contexts/AppUserContext';
import Text from './Text';

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
          <Text bold className="absolute -bottom-2 left-10 text-md text-[--accent] z-20">
            EXP{' '}
            <Text extraBold>
              [{' '}{playerData.currentXP} / {playerData.xpForNextLevel}{' '}]
            </Text>
          </Text>
            <View className="absolute bottom-[-10px] left-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
            <View className="m-auto flex w-[75%] flex-col ">
              <ProgressIndicator
                barColor="#996DFF"
                value={playerData.currentXP}
                max={playerData.xpForNextLevel}
              />
              {/* <View className="mt-2 flex flex-row gap-2">
                <View className="w-[50%]">
                  <Text bold className="text-[#cb3d55]">
                    HP{' '}
                    <Text bold className="text-md">
                      {playerData.health || 0} / {playerData.maxHealth}
                    </Text>
                  </Text>
                  <ProgressIndicator barColor="#cb3d55" value={playerData.health} max={playerData.maxHealth} />
                </View>
                <View className="w-[50%]">
                  <Text bold className="text-[#FAAF00]">
                    SP{' '}
                    <Text bold className="text-md">
                      {playerData.mana || 0} / {playerData.maxMana}
                    </Text>
                  </Text>
                  <ProgressIndicator barColor="#FAAF00" value={playerData.mana} max={playerData.maxMana} />
                </View>
              </View> */}
            </View>
            <View className="absolute bottom-[-12px] right-[-40px] h-56 w-12 rotate-[15deg] bg-[--background]" />
          </View>
          {/* <Text className="text-md absolute bottom-[-7px] right-[45px] z-10 font-bold text-white ">
            {playerData.currentXP} / {playerData.xpForNextLevel} EXP
          </Text> */}
        </>
      )}
    </View>
  );
};
