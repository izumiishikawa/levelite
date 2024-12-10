import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Text from '../Text';

interface WelcomeScreenProps {
  onNext: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  return (
    <View className="flex-1 justify-center items-center w-full">
      <View className="flex flex-col items-center w-[80%] mb-20">
        <Text className="text-white">Seja muito bem-vindo à</Text>
        <Text className="text-6xl font-extrabold my-4 text-[--accent]">LEVELITE</Text>
        <Text className="text-[#B8B8B8] text-center">
          Use nosso sistema para se tornar um jogador de elite.
        </Text>
        <Text className="text-[#B8B8B8] text-center">
          Prepare-se para evoluir física e mentalmente, desenvolvendo força, mente e disciplina.
        </Text>
        <Text className="text-[#B8B8B8] text-center">
          Aqui, cada tarefa completada é um passo rumo ao próximo level.
        </Text>
      </View>

      <TouchableOpacity onPress={onNext} className="absolute bottom-10 w-[80%] bg-[--accent] p-3 rounded-lg flex items-center">
        <Text className="text-white font-bold text-lg">Próximo</Text>
      </TouchableOpacity>
    </View>
  );
};
