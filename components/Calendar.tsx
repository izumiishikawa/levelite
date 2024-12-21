import React from 'react';
import { View, Image } from 'react-native';
import Text from './Text';
import { AttributeArc } from './AttributeArc';
import AnimatedRollingNumbers from './AnimatedRolling';
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { useAttributesStore, useHealthAndManaStore, usePenaltyZoneStore } from '~/stores/mainStore';
import { useShallow } from 'zustand/shallow';
import { ProgressIndicator } from './nativewindui/ProgressIndicator';

export const Calendar: React.FC = () => {
  // Acessa os dados das stores
  const { health, maxHealth, mana, maxMana } = useHealthAndManaStore(
    useShallow((state) => ({
      health: state.health,
      maxHealth: state.maxHealth,
      mana: state.mana,
      maxMana: state.maxMana,
    }))
  );
  
  const { inPenaltyZone } = usePenaltyZoneStore(
    useShallow((state) => ({ inPenaltyZone: state.inPenaltyZone }))
  );
  
  const { focus, vitality, aura } = useAttributesStore(
    useShallow((state) => ({
      focus: state.focus,
      vitality: state.vitality,
      aura: state.aura,
    }))
  );
  

  // Obtém a data atual
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const weekDay = currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(); // Ex.: SUN, WED
  const currentHour = currentDate.getHours();

  // Determina o período do dia
  const getPeriod = () => {
    if (currentHour < 12) return 'Morning';
    if (currentHour < 18) return 'Afternoon';
    return 'Evening';
  };

  const period = getPeriod();

  // Mapeamento de siglas para imagens
  const dayImages: Record<string, any> = {
    SUN: require('../assets/sun.png'),
    MON: require('../assets/mon.png'),
    TUE: require('../assets/tue.png'),
    WED: require('../assets/wed.png'),
    THU: require('../assets/thu.png'),
    FRI: require('../assets/fri.png'),
    SAT: require('../assets/sat.png'),
  };

  // Seleciona a imagem correspondente ao dia atual
  const dayImage = dayImages[weekDay] || require('../assets/sun.png'); // fallback para uma imagem padrão

  const attributeIcons = {
    focus: '🧠',
    vitality: '💪',
    aura: '🤝',
  };

  return (
    <View className="relative mb-10 flex max-w-fit flex-row items-center justify-between px-6">
      <View>
        <View className="flex max-w-fit flex-row items-center gap-4">
          <Animated.Text entering={SlideInLeft.duration(500)}>
            <Text className="text-5xl text-white" extraBold>{`${day}/${month}`}</Text>
          </Animated.Text>

          <Animated.View entering={FadeIn.duration(600)}>
            <Image resizeMethod="resize" source={dayImage} style={{ width: 70, height: 40 }} />
          </Animated.View>
        </View>
        <Text
          bold
          className="self-start text-2xl"
          style={{ color: inPenaltyZone ? '#cb3d55' : '#996DFF' }}>
          {period}
        </Text>
        <View className="mt-2 flex flex-row justify-center gap-2">
          {Object.entries({ focus, vitality, aura }).map(([attribute, value]) => (
            <AttributeArc
              key={attribute}
              icon={attributeIcons[attribute as keyof typeof attributeIcons]} // Pega o ícone correspondente
              percentage={value} // Define o valor do atributo como percentage
            />
          ))}
        </View>
      </View>
      <View className="relative">
        <Image
          resizeMethod="resize"
          source={require('../assets/playerprof.png')}
          style={{ width: 150, height: 150, marginBottom: 30 }}
        />
        <View className="absolute rounded-full px-2 left-0 bottom-10 top-[75px] flex flex-row items-center gap-0.5 text-lg text-white">
          <AnimatedRollingNumbers fontSize={25} textColor="#cb3d55" value={health} />
          <AnimatedRollingNumbers fontSize={11} textColor="#cb3d55" value={maxHealth} />
        </View>

        <View className="absolute rounded-full px-2 right-3 bottom-16 flex flex-row items-center gap-0.5 text-lg text-white">
          <AnimatedRollingNumbers fontSize={25} textColor="#faaf00" value={mana} />
          <AnimatedRollingNumbers fontSize={11} textColor="#faaf00" value={maxMana} />
        </View>

        <View className="absolute flex w-[75%] bottom-14 left-4 -rotate-3">
          <ProgressIndicator
            barColor="#cb3d55"
            barHeight={6}
            useLottie={false}
            value={health || 0}
            max={maxHealth || 1} // Garantia de evitar divisões por zero
          />
        </View>

        <View className="absolute flex w-[75%] bottom-11 left-6 -rotate-3">
          <ProgressIndicator
            barColor="#faaf00"
            barHeight={6}
            useLottie={false}
            value={mana || 0}
            max={maxMana || 1} // Garantia de evitar divisões por zero
          />
        </View>
      </View>
    </View>
  );
};
