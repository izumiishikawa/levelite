import { router } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SkillBook } from '~/components/SkillBook';
import { AppUserContext } from '~/contexts/AppUserContext';
import { createSkillBook, getUserSkillBooks } from '~/services/api';

const SkillBooks: React.FC = () => {
  const { playerData } = useContext(AppUserContext);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'low' | 'medium' | 'high'>('low');
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly'>('daily');
  const [skillBooks, setSkillBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSkillBooks = async () => {
    try {
      setIsLoading(true);
      const skillBooks = await getUserSkillBooks(playerData._id);
      setSkillBooks(skillBooks);
    } catch (error) {
      setSkillBooks([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillBooks();
  }, []);

  const handleOpenSkillBook = (skillBookId: string, title: string) => {
    router.push({
      pathname: '/skillbooks_tasks',
      params: { skillBookId, title },
    });
  };

  const handleCreateSkillBook = async () => {
    if (!title || !description || !selectedDifficulty || !selectedFrequency) {
      alert('Por favor, preencha todos os campos!');
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

      await createSkillBook(playerData._id, newSkillBook);

      alert('SkillBook criado com sucesso!');
      setIsCreating(false);
      setTitle('');
      setDescription('');
      setSelectedDifficulty('low');
      setSelectedFrequency('daily');
      fetchSkillBooks(); // Atualiza a lista após criar um novo SkillBook
    } catch (error) {
      alert('Erro ao criar o SkillBook. Tente novamente.');
      console.error(error);
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
      text: 'Dificil',
    },
  };

  if (isCreating) {
    return (
      <View className="flex-1 items-center bg-[--background] p-6">
        <Text className="text-2xl font-extrabold text-white">Livro de Habilidade</Text>
        <View className="my-4 h-[1px] w-[70%] bg-white" />
        <Text className="mb-6 mt-2 text-center text-[#B8B8B8]">
          Crie um livro de habilidade para treinar uma única skill em especial
        </Text>
        <TextInput
          placeholder="Qual será o nome do livro?"
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
        <TextInput
          placeholder="Qual é o seu foco com esse livro?"
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
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
                  selectedDifficulty === difficulty ? intensityLevels[difficulty].color : '#4B5563', // Cor cinza equivalente a bg-gray-700
                borderRadius: 999, // Para bordas arredondadas como `rounded-full`
                paddingHorizontal: 24, // Equivalente a `px-6`
                paddingVertical: 8, // Equivalente a `py-2`
              }}>
              <Text className="font-bold text-white">
                {intensityLevels[difficulty as 'low' | 'medium' | 'high'].text.toUpperCase()}
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
              style={{ flex: 1 }} // Adiciona flex para dividir igualmente o espaço
            >
              <Text className="text-center font-bold text-white">
                {frequency === 'daily' ? 'Diariamente' : 'Semanalmente'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="absolute bottom-28 w-full">
          <TouchableOpacity
            onPress={handleCreateSkillBook}
            className="mt-4 w-full items-center justify-center rounded-lg bg-[--accent] py-3">
            <Text className="font-bold text-white">Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsCreating(false)}
            className="mt-4 w-full items-center justify-center rounded-lg bg-gray-600 py-3">
            <Text className="font-bold text-white">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchSkillBooks} />}>
      <View className="h-full w-full bg-[--background] p-7">
        <View className="flex flex-row flex-wrap gap-10 ">
          {isLoading ? (
            <ActivityIndicator size="large" color="#FFF" />
          ) : (
            skillBooks.map((skillBook: any) => (
              <SkillBook
                key={skillBook._id}
                level={skillBook.parameters.difficulty}
                title={skillBook.title}
                icon={require('../../assets/pfp.jpg')} // Ajuste para exibir um ícone ou imagem real
                description={skillBook.focus}
                onOpen={() => handleOpenSkillBook(skillBook._id, skillBook.title)}
              />
            ))
          )}
        </View>
      </View>

      <TouchableOpacity
        className="absolute bottom-28 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[--accent] shadow-lg"
        onPress={() => setIsCreating(true)}>
        <Text className="text-2xl font-bold text-white">+</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: '#17171C',
    width: '80%',
    marginVertical: 20,
  },
});

export default SkillBooks;
