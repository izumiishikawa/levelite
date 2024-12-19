import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import Text from '~/components/Text';
import Title from '~/components/Title';
import { useSnackBar } from '~/contexts/SnackBarContext';
import { createSkillBook } from '~/services/api';
import { usePlayerDataStore } from '~/stores/mainStore';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useShallow } from 'zustand/shallow';

// import { Container } from './styles';

const CreateSkillBook: React.FC = () => {
  const { id, updateSkillBookSignal, setUpdateSkillBookSignal } = usePlayerDataStore(
    useShallow((state) => ({
      id: state.id,
      updateSkillBookSignal: state.updateSkillBookSignal,
      setUpdateSkillBookSignal: state.setUpdateSkillBookSignal,
    }))
  );
  const { showSnackBar } = useSnackBar();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'low' | 'medium' | 'high'>('low');
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly'>('daily');

  const router = useRouter();

  const handleCreateSkillBook = async () => {
    if (!title || !description || !selectedDifficulty || !selectedFrequency) {
      showSnackBar(
        <View className="flex flex-row items-center gap-2">
          <Text className="text-white" black>
            All fields required
          </Text>
        </View>
      );
      return;
    }

    try {
      const newSkillBook = {
        title,
        focus: description,
        parameters: {
          difficulty: selectedDifficulty,
          frequency: selectedFrequency,
        },
      };

      await createSkillBook(id, newSkillBook);

      showSnackBar(
        <View className="flex flex-row items-center gap-2">
          <Text className="text-white" black>
            {title} - Skillbook Created.
          </Text>
        </View>
      );

      setTitle('');
      setDescription('');
      setSelectedDifficulty('low');
      setSelectedFrequency('daily');

      setUpdateSkillBookSignal(Math.random())
      router.back();
    } catch (error) {
      showSnackBar(
        <View className="flex flex-row items-center gap-2">
          <Text className="text-white" black>
            An error ocurred
          </Text>
        </View>
      );
    }
  };

  const intensityLevels = {
    low: {
      color: '#996DFF',
      text: 'Easy',
    },
    medium: {
      color: '#FAAF00',
      text: 'Medium',
    },
    high: {
      color: '#ED6466',
      text: 'Hard',
    },
  };

  return (
    <View className="flex-1 items-center bg-[--background] p-6">
      <View className="mb-5 mt-20 w-[80%]">
        <Title text="Create SkillBook" />
      </View>
      <Text className="mb-6 mt-2 text-center text-[#B8B8B8]">
        Craft a mystical tome, designed to master one skill, unlocking boundless potential.
      </Text>
      <View className="relative w-full">
        <TextInput
          placeholder="What shall be the name of the book?"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
          style={{
            backgroundColor: '#2A2A35',
            color: 'white',
            width: '100%',
            padding: 12,
            paddingLeft: 45,
            borderRadius: 8,
            marginBottom: 12,
          }}
        />
        <View className="absolute bottom-[-6px] right-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
        <View className="absolute bottom-[-6px] left-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
      </View>

      <View className="relative mt-6 w-full">
        <TextInput
          placeholder="What is the purpose of this book?"
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

        <View className="absolute bottom-[-6px] right-[-40px] h-44 w-14 rotate-[10deg] bg-[--background]" />
        <View className="absolute bottom-[-6px] left-[-40px] h-44 w-14 rotate-[10deg] bg-[--background]" />
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

      <View className="mt-4 w-full flex-row justify-between gap-4">
        {['daily', 'weekly'].map((frequency) => (
          <TouchableOpacity
            key={frequency}
            onPress={() => setSelectedFrequency(frequency as 'daily' | 'weekly')}
            className={`rounded-full px-4 py-3 ${
              selectedFrequency === frequency ? 'bg-[--accent]' : 'bg-gray-700'
            }`}
            style={{ flex: 1 }} // Adiciona flex para dividir igualmente o espaço
          >
            <Text className="text-center text-white" black>
              {frequency === 'daily' ? 'Daily' : 'Weekly'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="absolute bottom-28 w-full">
        <TouchableOpacity
          onPress={handleCreateSkillBook}
          className="mt-4 w-full items-center justify-center rounded-lg bg-[--accent] py-3">
          <Text className="font-bold text-white">Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 w-full items-center justify-center rounded-lg bg-gray-600 py-3">
          <Text className="font-bold text-white">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateSkillBook;
