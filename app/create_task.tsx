// pages/create-task.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Text from '~/components/Text';
import Title from '~/components/Title';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { createUserTask } from '~/services/api';

const CreateTask: React.FC = () => {
  const { userId } = useLocalSearchParams(); // Recebe o userId como parâmetro da rota
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'low' | 'medium' | 'high'>('low');
  const [attribute, setAttribute] = useState<'aura' | 'vitality' | 'focus'>('aura');
  const [selectedFrequency, setSelectedFrequency] = useState<'one-time' | 'daily' | 'weekly'>('daily');

  const handleSaveTask = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'O título da tarefa é obrigatório!');
      return;
    }

    const xpReward = { low: 50, medium: 100, high: 150 }[selectedDifficulty];

    const newTask = {
      userId,
      title,
      description,
      attribute,
      intensityLevel: selectedDifficulty,
      recurrence: selectedFrequency,
      xpReward,
    };

    try {
      await createUserTask(newTask);
      router.back(); // Retorna à página anterior após salvar a tarefa
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      Alert.alert('Erro', 'Não foi possível criar a tarefa. Tente novamente.');
    }
  }, [title, description, attribute, selectedDifficulty, selectedFrequency, userId, router]);

  const intensityLevels = useMemo(
    () => ({
      low: { color: '#996DFF', text: 'Easy' },
      medium: { color: '#FAAF00', text: 'Medium' },
      high: { color: '#ED6466', text: 'Hard' },
    }),
    []
  );

  const attributeDetails = useMemo(
    () => ({
      aura: { icon: '🤝', name: 'Aura' },
      vitality: { icon: '💪', name: 'Vitality' },
      focus: { icon: '🧠', name: 'Focus' },
    }),
    []
  );

  return (
    <View className="z-40 flex h-full w-full flex-col items-center bg-[--background] p-6">
      <View className="w-[80%] mt-10">
        <Title text="CREATE NEW TASK" />
      </View>

      <View className="relative mt-10 w-full">
        <TextInput
          placeholder="Task name"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
          style={{
            backgroundColor: '#2A2A35',
            color: 'white',
            width: '100%',
            padding: 12,
            paddingHorizontal: 50,
            borderRadius: 8,
            marginBottom: 12,
          }}
        />
        <View className="absolute bottom-[-6px] right-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
        <View className="absolute bottom-[-6px] left-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
      </View>

      <View className="mt-4 w-full flex-row justify-between gap-4">
        {Object.entries(attributeDetails).map(([key, details]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setAttribute(key as 'aura' | 'vitality' | 'focus')}
            className={`rounded-full px-[4px] py-[3px] ${
              attribute === key ? 'bg-[--accent]' : 'bg-transparent'
            } ${attribute === key ? 'border-0' : 'border-[2px] border-[--accent]'}`}
            style={{ flex: 1 }}>
            <View className="flex flex-row items-center gap-2 text-center text-white">
              <View
                className={`flex h-6 w-6 flex-row items-center justify-center rounded-full p-1 ${
                  attribute === key ? 'bg-[--foreground]' : 'bg-[--accent]'
                }`}>
                <Text>{details.icon}</Text>
              </View>
              <Text className="text-white">{details.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

    <View className="relative mt-10 w-full">
            <TextInput
              placeholder="Task description"
              placeholderTextColor="#aaa"
              value={description}
              onChangeText={(text) => {
                if (text.length <= 200) {
                  setDescription(text);
                }
              }}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: '#2A2A35',
                color: 'white',
                width: '100%',
                padding: 12,
                paddingHorizontal: 50,
                marginBottom: 12,
                textAlignVertical: 'top', // Mantém o texto alinhado ao topo
                borderRadius: 8, // Adiciona arredondamento consistente
                height: 120,
              }}
            />
  
            <View className="absolute bottom-[-6px] right-[-45px] h-44 w-14 rotate-[10deg] bg-[--background]" />
            <View className="absolute bottom-[-6px] left-[-40px] h-44 w-14 rotate-[10deg] bg-[--background]" />
          </View>

      <View className="mt-4 w-full flex-row justify-between gap-4">
        {['one-time', 'daily', 'weekly'].map((frequency) => (
          <TouchableOpacity
            key={frequency}
            onPress={() => setSelectedFrequency(frequency as any)}
            className={`rounded-full px-4 py-3 ${
              selectedFrequency === frequency ? 'bg-[--accent]' : 'bg-gray-700'
            }`}
            style={{ flex: 1 }}>
            <Text bold className="text-center text-white">
              {frequency.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="mb-4 mt-6 w-full flex-row justify-between gap-2">
          {['low', 'medium', 'high'].map((difficulty) => (
            <View
              key={difficulty}
              style={{
                borderWidth: selectedDifficulty === difficulty ? 3 : 0,
                borderColor: selectedDifficulty === difficulty ? '#996DFF' : 'transparent',
                borderRadius: 16, // Ajuste para combinar com o botão interno
                padding: 4, // Cria o espaçamento entre a borda e o botão
              }}>
              <TouchableOpacity
                onPress={() => setSelectedDifficulty(difficulty as 'low' | 'medium' | 'high')}
                style={{
                  backgroundColor: intensityLevels[difficulty].color,
                  borderRadius: 12,
                  paddingVertical: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 110,
                }}>
                {/* Renderizar ícones dinamicamente */}
                <View className="mb-2 flex flex-row flex-wrap justify-center">
                  {Array.from(
                    { length: difficulty === 'low' ? 1 : difficulty === 'medium' ? 2 : 3 },
                    (_, index) => (
                      <Icon
                        key={`${difficulty}-icon-${index}`}
                        name="fire-flame-curved"
                        size={24}
                        style={{ marginHorizontal: 2 }}
                      />
                    )
                  )}
                </View>
                {/* Texto do nível de dificuldade */}
                <Text black className="text-white">
                  {intensityLevels[difficulty].text.toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        
      <TouchableOpacity
        onPress={handleSaveTask}
        className="mt-4 w-full items-center justify-center rounded-lg bg-[--accent] py-3">
        <Text className="font-bold text-white">Save</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-4 w-full items-center justify-center rounded-lg bg-gray-600 py-3">
        <Text className="font-bold text-white">Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateTask;
