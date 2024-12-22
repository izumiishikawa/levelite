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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SkillBooks: React.FC = () => {
  const { id, updateSkillBookSignal } = usePlayerDataStore(
    useShallow((state) => ({
      id: state.id,
      updateSkillBookSignal: state.updateSkillBookSignal,
    }))
  );

  const [skillBooks, setSkillBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();

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

  const handleOpenSkillBook = (
    skillBookId: string,
    title: string,
    difficulty: string,
    level: string,
    generatedToday: boolean
  ) => {
    router.push({
      pathname: '/skillbooks_tasks',
      params: { skillBookId, title, difficulty, level, generatedToday: generatedToday.toString() },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[--background]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchSkillBooks} />}>
        <View className="p-7">
          <View className="flex flex-row flex-wrap gap-10">
            {isLoading ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : skillBooks.length > 0 ? (
              skillBooks.map((skillBook: any) => (
                <SkillBook
                  id={skillBook._id}
                  key={skillBook._id}
                  level={skillBook.parameters.difficulty}
                  title={skillBook.title}
                  icon={require('../../assets/pfp.jpg')} // Ajuste para exibir um ícone ou imagem real
                  description={skillBook.focus}
                  onOpen={() =>
                    handleOpenSkillBook(
                      skillBook._id,
                      skillBook.title,
                      skillBook.parameters.difficulty,
                      skillBook.parameters.level,
                      skillBook.generatedToday
                    )
                  }
                />
              ))
            ) : (
              // Mensagem épica quando não há Skill Books
              <View className="flex flex-1 items-center justify-center p-4">
                <Text className="text-center text-lg text-white">
                  "Every great hero begins their journey with a single step. Forge your
                  destiny—create a Skill Book and master the art of greatness!"
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Botão de adicionar fixo */}
      <TouchableOpacity
        className="absolute right-6 h-14 w-14 items-center justify-center rounded-full bg-[--accent] shadow-lg"
        style={{ bottom: insets.bottom + 86 }}
        onPress={() =>
          router.push({
            pathname: '/create_skillbook',
          })
        }>
        <Text className="text-2xl font-bold text-white">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SkillBooks;
