import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert } from 'react-native';
import Text from './Text';
import { createUserTask } from '~/services/api'; // Importa a função de API para criar a tarefa

interface CreateTaskProps {
  onClose: () => void;
  userId: string; // O ID do usuário deve ser passado como prop
}

const CreateTask: React.FC<CreateTaskProps> = ({ onClose, userId }) => {
  const [title, setTitle] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'low' | 'medium' | 'high'>('low');
  const [attribute, setAttribute] = useState<
    'aura' | 'vitality' | 'focus'
  >('aura');
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly'>('daily');

  const handleSaveTask = async () => {
    if (!title) {
      alert('O título da tarefa é obrigatório!');
      return;
    }

    const xpReward =
      selectedDifficulty === 'low' ? 50 : selectedDifficulty === 'medium' ? 100 : 150;

    const newTask = {
      userId,
      title,
      description: `${selectedFrequency === 'daily' ? 'Tarefa diária' : 'Tarefa semanal'}`,
      attribute,
      intensityLevel: selectedDifficulty,
      recurrence: selectedFrequency,
      xpReward,
    };

    try {
      // Chama a função de API para criar a tarefa
      await createUserTask(newTask);
      onClose(); // Fecha o modal após a criação bem-sucedida
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      Alert.alert('Erro', 'Não foi possível criar a tarefa. Tente novamente.');
    }
  };

  const intensityLevels = {
    low: {
      color: '#996DFF',
      text: 'Fácil',
    },
    medium: {
      color: '#FAAF00',
      text: 'Médio',
    },
    high: {
      color: '#ED6466',
      text: 'Difícil',
    },
  };

  const attributeDetails: Record<
    'aura' | 'vitality' | 'focus',
    { icon: string; name: string }
  > = {
    aura: { icon: '🤝', name: 'Aura' },
    vitality: { icon: '💪', name: 'Vitalidade' },
    focus: { icon: '🧠', name: 'Foco' },
  };

  return (
    <View className="z-40 flex h-full w-full flex-col items-center bg-[--background] p-6">
      <Text className="text-2xl font-extrabold text-white">Criar Tarefa</Text>
      <View className="my-4 h-[1px] w-[70%] bg-white" />

      <TextInput
        placeholder="Nome da Tarefa"
        placeholderTextColor="#aaa"
        value={title}
        onChangeText={setTitle}
        style={{
          backgroundColor: '#2A2A35',
          color: 'white',
          width: '100%',
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />

      <View className="mb-4 mt-4 w-full flex-row justify-between">
        {['low', 'medium', 'high'].map((difficulty) => (
          <TouchableOpacity
            key={difficulty}
            onPress={() => setSelectedDifficulty(difficulty as 'low' | 'medium' | 'high')}
            style={{
              backgroundColor:
                selectedDifficulty === difficulty ? intensityLevels[difficulty].color : '#4B5563',
              borderRadius: 999,
              paddingHorizontal: 24,
              paddingVertical: 8,
            }}>
            <Text className="font-bold text-white">
              {intensityLevels[difficulty as 'low' | 'medium' | 'high'].text.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="mt-4 w-full flex-row flex-wrap justify-around gap-2">
        {Object.entries(attributeDetails).map(([key, details]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setAttribute(key as keyof typeof attributeDetails)}
            style={{
              backgroundColor: attribute === key ? '#444' : '#1E1E25',
              borderColor: attribute === key ? '#996DFF' : '#4B5563',
              borderWidth: 2,
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 0,
              paddingVertical: 10,
              paddingHorizontal: 6,
            }}>
            <Text style={{ fontSize: 26 }}>{details.icon}</Text>
            <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold', marginTop: 2 }}>
              {details.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="mt-4 w-full flex-row justify-between gap-4">
        {['daily', 'weekly'].map((frequency) => (
          <TouchableOpacity
            key={frequency}
            onPress={() => setSelectedFrequency(frequency as 'daily' | 'weekly')}
            className={`rounded-lg px-4 py-2 ${
              selectedFrequency === frequency ? 'bg-[--accent]' : 'bg-gray-700'
            }`}
            style={{ flex: 1 }}>
            <Text className="text-center font-bold text-white">
              {frequency === 'daily' ? 'Diariamente' : 'Semanalmente'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="absolute bottom-28 w-full">
        <TouchableOpacity
          onPress={() => handleSaveTask()}
          className="mt-4 w-full items-center justify-center rounded-lg bg-[--accent] py-3">
          <Text className="font-bold text-white">Salvar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onClose()}
          className="mt-4 w-full items-center justify-center rounded-lg bg-gray-600 py-3">
          <Text className="font-bold text-white">Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateTask;
