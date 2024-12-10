import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import Text from '../Text';

interface CognitivePreferencesScreenProps {
  onNext: (data: { cognitiveChallengePreference: string; studyFrequency: string; selfDisciplineLevel: string }) => void;
  onPrevious: () => void;
}

export const CognitivePreferencesScreen: React.FC<CognitivePreferencesScreenProps> = ({ onNext, onPrevious }) => {
  const [cognitiveChallengePreference, setCognitiveChallengePreference] = useState('');
  const [studyFrequency, setStudyFrequency] = useState('');
  const [selfDisciplineLevel, setSelfDisciplineLevel] = useState('');

  const cognitiveLevels = [
    { label: "Leve", value: "low" },
    { label: "Moderado", value: "medium" },
    { label: "Intenso", value: "hard" },
  ];

  const studyFrequencies = [
    { label: "Diariamente", value: "daily" },
    { label: "3-4 vezes por semana", value: "3-4" },
    { label: "1-2 vezes por semana", value: "1-2" },
    { label: "Raramente", value: "rarely" },
  ];

  const disciplineLevels = [
    { label: "Alta", value: "high" },
    { label: "Moderada", value: "medium" },
    { label: "Baixa", value: "low" },
  ];

  const handleNext = () => {
    if (cognitiveChallengePreference && studyFrequency && selfDisciplineLevel) {
      onNext({ cognitiveChallengePreference, studyFrequency, selfDisciplineLevel });
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }} className="w-[90%] p-6">
      <Text className="text-white text-2xl font-bold text-center mb-4 mt-24">Preferências Cognitivas</Text>

      {/* Preferência por Desafios Mentais */}
      <Text className="text-[#B8B8B8] mb-2">Preferência por Desafios Mentais</Text>
      {cognitiveLevels.map((level) => (
        <TouchableOpacity
          key={level.value}
          onPress={() => setCognitiveChallengePreference(level.value)}
          className={`w-full py-4 my-1 rounded-md ${cognitiveChallengePreference === level.value ? 'bg-[--accent]' : 'bg-[--foreground]'}`}
        >
          <Text className="text-white font-semibold text-center">{level.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Frequência de Estudo/Desenvolvimento Intelectual */}
      <Text className="text-[#B8B8B8] mb-2 mt-4">Frequência de Estudo/Desenvolvimento Intelectual</Text>
      {studyFrequencies.map((frequency) => (
        <TouchableOpacity
          key={frequency.value}
          onPress={() => setStudyFrequency(frequency.value)}
          className={`w-full py-4 my-1 rounded-md ${studyFrequency === frequency.value ? 'bg-[--accent]' : 'bg-[--foreground]'}`}
        >
          <Text className="text-white font-semibold text-center">{frequency.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Nível de Autodisciplina */}
      <Text className="text-[#B8B8B8] mb-2 mt-4">Nível de Autodisciplina</Text>
      {disciplineLevels.map((level) => (
        <TouchableOpacity
          key={level.value}
          onPress={() => setSelfDisciplineLevel(level.value)}
          className={`w-full py-4 my-1 rounded-md ${selfDisciplineLevel === level.value ? 'bg-[--accent]' : 'bg-[--foreground]'}`}
        >
          <Text className="text-white font-semibold text-center">{level.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Botões de Navegação */}
      <View className="flex flex-col justify-between w-full mt-6 mb-12 gap-2">
      <TouchableOpacity 
          onPress={handleNext} 
          className={`w-full p-4 rounded-md items-center ${cognitiveChallengePreference && studyFrequency && selfDisciplineLevel ? 'bg-[--accent]' : 'bg-gray-500 opacity-50'}`}
          disabled={!cognitiveChallengePreference || !studyFrequency || !selfDisciplineLevel}
        >
          <Text className="text-white font-bold">Próximo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPrevious} className="w-full bg-[--foreground] p-4 rounded-md items-center">
          <Text className="text-white font-bold">Voltar</Text>
        </TouchableOpacity>
     
      </View>
    </ScrollView>
  );
};

export default CognitivePreferencesScreen;
