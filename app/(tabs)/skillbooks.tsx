import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useShallow } from 'zustand/shallow';
import { SkillBook } from '~/components/SkillBook';
import Text from '~/components/Text';
import { getUserSkillBooks } from '~/services/api';
import { usePlayerDataStore } from '~/stores/mainStore';

const SkillBooks: React.FC = () => {
  const { id, updateSkillBookSignal } = usePlayerDataStore(
    useShallow((state) => ({
      id: state.id,
      updateSkillBookSignal: state.updateSkillBookSignal,
    }))
  );

  const [skillBooks, setSkillBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSkillBooks = async () => {
    try {
      setIsLoading(true);
      const skillBooks = await getUserSkillBooks(id);
      setSkillBooks(skillBooks);
    } catch (error) {
      setSkillBooks([]);
      console.error('Erro ao buscar livros de habilidades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillBooks();
  }, [updateSkillBookSignal]);

  const handleOpenSkillBook = (skillBookId: string, title: string, generatedToday: boolean) => {
    router.push({
      pathname: '/skillbooks_tasks',
      params: { skillBookId, title, generatedToday: generatedToday.toString() },
    });
  };

  return (
    <View className="flex-1 bg-[--background]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchSkillBooks} />}
      >
        <View className="p-7">
          <View className="flex flex-row flex-wrap gap-10">
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
                  onOpen={() =>
                    handleOpenSkillBook(skillBook._id, skillBook.title, skillBook.generatedToday)
                  }
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Botão de adicionar fixo */}
      <TouchableOpacity
        className="absolute bottom-28 right-6 h-14 w-14 items-center justify-center rounded-full bg-[--accent] shadow-lg"
        onPress={() =>
          router.push({
            pathname: '/create_skillbook',
          })
        }
      >
        <Text className="text-2xl font-bold text-white">+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SkillBooks;
