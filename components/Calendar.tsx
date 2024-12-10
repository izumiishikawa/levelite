import React, { useContext } from 'react';
import { Image, View } from 'react-native';
import Text from './Text';
import { AttributeArc } from './AttributeArc';
import { AppUserContext } from '~/contexts/AppUserContext';

type Attributes = {
    focus: number;
    vitality: number;
    aura: number;
  };
  

export const Calendar: React.FC = () => {
  const { playerData } = useContext(AppUserContext);
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

  const attributeIcons: { [key in keyof Attributes]: string } = {
    focus: '🧠',
    vitality: '💪',
    aura: '🤝',
  };

  return (
    <View className="relative mb-10 flex max-w-fit flex-row items-center justify-between px-6">
      <View>
        <View className="flex max-w-fit flex-row items-center gap-4">
          <Text className="text-5xl text-white" extraBold>{`${day}/${month}`}</Text>

          <Image source={dayImage} style={{ width: 70, height: 40 }} />
        </View>
        <Text bold className="self-start text-2xl text-[--accent]">
          {period}
        </Text>
        <View className="mt-2 flex flex-row justify-center gap-2">
          {Object.entries(playerData.attributes).map(([attribute, value]) => (
            <AttributeArc
              key={attribute}
              icon={attributeIcons[attribute as keyof Attributes]} // Pega o ícone correspondente
              percentage={value as number} // Define o valor do atributo como percentage
            />
          ))}
        </View>
      </View>
      <Image source={require('../assets/profile.png')} style={{ width: 150, height: 150 }} />
    </View>
  );
};
