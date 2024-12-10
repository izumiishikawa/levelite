import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Text from '../Text';

interface PhysicInfoScreenProps {
  onNext: (data: { height: string; weight: string; exerciseFrequency: string; exerciseIntensity: string }) => void;
  onPrevious: () => void;
}

export const PhysicInfoScreen: React.FC<PhysicInfoScreenProps> = ({ onNext, onPrevious }) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [exerciseFrequency, setExerciseFrequency] = useState('');
  const [exerciseIntensity, setExerciseIntensity] = useState('');
  const [showExerciseIntensity, setShowExerciseIntensity] = useState(false);

  const frequencies = [
    { label: "Sedentário", value: "sedentary" },
    { label: "1-2 vezes por semana", value: "1-2" },
    { label: "3-5 vezes por semana", value: "3-5" },
    { label: "Diariamente", value: "daily" },
  ];

  const intensities = [
    { label: "Leve", value: "low" },
    { label: "Moderada", value: "medium" },
    { label: "Intensa", value: "hard" },
  ];

  const handleNext = () => {
    if (height && weight && exerciseFrequency && (exerciseFrequency === "sedentary" || exerciseIntensity)) {
      onNext({ height, weight, exerciseFrequency, exerciseIntensity });
    }
  };

  const allFieldsFilled = height && weight && exerciseFrequency && (exerciseFrequency === "sedentary" || exerciseIntensity);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }} className="w-[90%] p-6">
      <Text className="text-white text-2xl font-bold text-center mb-4 mt-24">Informações Físicas</Text>

      {/* Input de Altura */}
      <Text className="text-[#B8B8B8] mb-2">Altura (em cm)</Text>
      <TextInput
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        placeholder="Ex: 175"
        placeholderTextColor="#7D7D7D"
        className="bg-[--foreground] text-white p-4 w-full mb-4 rounded-md"
      />

      {/* Input de Peso */}
      <Text className="text-[#B8B8B8] mb-2">Peso (em kg)</Text>
      <TextInput
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        placeholder="Ex: 70"
        placeholderTextColor="#7D7D7D"
        className="bg-[--foreground] text-white p-4 w-full mb-4 rounded-md"
      />

      {/* Frequência de Exercícios */}
      <Text className="text-[#B8B8B8] mb-2">Frequência de Exercícios</Text>
      {frequencies.map((freq) => (
        <TouchableOpacity
          key={freq.value}
          onPress={() => {
            setExerciseFrequency(freq.value);
            setShowExerciseIntensity(freq.value !== "sedentary");
            if (freq.value === "sedentary") {
              setExerciseIntensity(""); // Limpa a intensidade se for sedentário
            }
          }}
          className={`w-full py-4 my-1 rounded-md ${exerciseFrequency === freq.value ? 'bg-[--accent]' : 'bg-[--foreground]'}`}
        >
          <Text className="text-white font-semibold text-center">{freq.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Intensidade do Exercício (Apenas se não for Sedentário) */}
      {showExerciseIntensity && (
        <>
          <Text className="text-[#B8B8B8] mb-2 mt-4">Intensidade do Exercício</Text>
          {intensities.map((intensity) => (
            <TouchableOpacity
              key={intensity.value}
              onPress={() => setExerciseIntensity(intensity.value)}
              className={`w-full py-4 my-1 rounded-md ${exerciseIntensity === intensity.value ? 'bg-[--accent]' : 'bg-[--foreground]'}`}
            >
              <Text className="text-white font-semibold text-center">{intensity.label}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Botões de Navegação */}
      <View className="flex flex-col justify-between w-full mt-6 mb-12 gap-2">
      <TouchableOpacity
          onPress={handleNext}
          className={`w-full p-4 rounded-md items-center ${allFieldsFilled ? 'bg-[--accent]' : 'bg-gray-500 opacity-50'}`}
          disabled={!allFieldsFilled}
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

export default PhysicInfoScreen;
