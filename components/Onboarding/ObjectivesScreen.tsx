import React, { useState } from 'react';
import Text from '../Text';
import { View, TouchableOpacity } from 'react-native';

interface ObjectivesScreenProps {
  onNext: (selectedOption: string) => void;
  onPrevious: () => void;
}

export const ObjectivesScreen: React.FC<ObjectivesScreenProps> = ({ onNext, onPrevious }) => {
  const objectives = [
    { text: 'Desenvolver Força', option: 'develop_strength' },
    { text: 'Aumentar a Resistência', option: 'increase_endurance' },
    { text: 'Melhorar o Foco Mental', option: 'improve_focus' },
    { text: 'Ganhar Disciplina', option: 'gain_discipline' },
    { text: 'Evoluir em Todos os Aspectos', option: 'evolve_all' },
  ];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <View className="flex h-full w-[90%] flex-col items-center justify-center p-6">
      <Text className="text-center text-2xl font-bold text-white">Qual é o seu objetivo?</Text>
      <Text className="mb-6 text-center text-[#B8B8B8]">
        Vamos construir seu perfil de jogador, portanto nos diga, o que você almeja?
      </Text>
      {objectives.map((objective) => (
        <TouchableOpacity
          key={objective.option}
          className={`w-full py-4 my-1 rounded-md ${
            selectedOption === objective.option ? 'bg-[--accent]' : 'bg-[--foreground]'
          } flex items-center justify-center`}
          onPress={() => setSelectedOption(objective.option)}>
          <Text className="text-md font-semibold text-white">{objective.text}</Text>
        </TouchableOpacity>
      ))}

      <View className="mt-12 flex absolute bottom-10 w-full flex-col justify-between gap-2">
        <TouchableOpacity
          className={`w-full rounded-md py-4 ${
            selectedOption ? 'bg-[--accent]' : 'bg-gray-500 opacity-50'
          } flex items-center justify-center`}
          onPress={() => selectedOption && onNext(selectedOption)}
          disabled={!selectedOption}>
          <Text className="font-semibold text-white">Próximo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex w-full items-center justify-center rounded-md bg-[--foreground] py-4"
          onPress={onPrevious}>
          <Text className="font-semibold text-white">Anterior</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ObjectivesScreen;
