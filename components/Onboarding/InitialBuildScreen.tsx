import React, { useState } from 'react';
import Text from '../Text';
import { View, TouchableOpacity } from 'react-native';

interface InitialBuildScreenProps {
  onNext: (attributes: {
    aura: number;
    vitality: number;
    focus: number;
  }) => void;
  onPrevious: () => void;
}

export const InitialBuildScreen: React.FC<InitialBuildScreenProps> = ({ onNext, onPrevious }) => {
  const [availablePoints, setAvailablePoints] = useState(12);
  const [attributes, setAttributes] = useState<{
    aura: number;
    vitality: number;
    focus: number;
  }>({
    aura: 0,
    vitality: 0,
    focus: 0,
  });

  // Define emojis para cada atributo
  const attributeInfo = [
    { name: 'Aura', emoji: '🤝', key: 'aura', description: 'Habilidades mentais' },
    {
      name: 'Vitalidade',
      emoji: '💪',
      key: 'vitality',
      description: 'Força física e energia para exercícios',
    },
    {
      name: 'Foco',
      emoji: '🎯',
      key: 'focus',
      description: 'Foco e consistência nas atividades',
    },
  ] as const;
  // Função para adicionar pontos
  const handleAddPoint = (attribute: keyof typeof attributes) => {
    if (availablePoints > 0) {
      setAttributes((prev) => ({ ...prev, [attribute]: prev[attribute] + 1 }));
      setAvailablePoints((prev) => prev - 1);
    }
  };

  // Função para remover pontos
  const handleRemovePoint = (attribute: keyof typeof attributes) => {
    if (attributes[attribute] > 0) {
      setAttributes((prev) => ({ ...prev, [attribute]: prev[attribute] - 1 }));
      setAvailablePoints((prev) => prev + 1);
    }
  };

  return (
    <View className="flex h-full w-[90%] items-center justify-center p-6">
      <Text className="mb-4 text-center text-2xl font-bold text-white">BUILD INICIAL</Text>
      <Text className="mb-6 text-center text-[#B8B8B8]">
        Defina sua build inicial: os atributos em que você investir mais pontos irão orientar o
        sistema, que passará a gerar tarefas personalizadas focadas nesses aspectos.
      </Text>
      <Text className="mb-6 text-center text-[#B8B8B8]">Pontos Restantes: {availablePoints}</Text>

      {attributeInfo.map((attr) => (
        <View key={attr.key} className="mb-4 flex w-full flex-row items-center justify-between">
          <View>
            <Text className="text-lg text-white">
              {attr.emoji} {attr.name}
            </Text>
            <Text className="text-[#B8B8B8] text-xs">{attr.description}</Text>
          </View>

          <View className="flex flex-row items-center justify-end ">
            <TouchableOpacity
              onPress={() => handleRemovePoint(attr.key)}
              disabled={attributes[attr.key] === 0}
              className="mx-2 flex h-8 w-8 items-center justify-center rounded-md bg-[--foreground]">
              <Text className="text-white">-</Text>
            </TouchableOpacity>
            <Text className="text-lg text-white">{attributes[attr.key]}</Text>
            <TouchableOpacity
              onPress={() => handleAddPoint(attr.key)}
              disabled={availablePoints === 0}
              className="mx-2 flex h-8 w-8 items-center justify-center rounded-md bg-[--foreground]">
              <Text className="text-white">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Botões de Navegação */}
      <View className="absolute bottom-10 mb-12 mt-6 flex w-full flex-col justify-between gap-2">
        <TouchableOpacity
          onPress={() => onNext(attributes)}
          disabled={availablePoints !== 0}
          className={`w-full ${availablePoints === 0 ? 'bg-[--accent]' : 'bg-gray-600'} items-center rounded-md p-4`}>
          <Text className="font-bold text-white">Próximo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPrevious}
          className="w-full items-center rounded-md bg-[--foreground] p-4">
          <Text className="font-bold text-white">Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InitialBuildScreen;
