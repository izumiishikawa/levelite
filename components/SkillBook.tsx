import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Image, GestureResponderEvent } from 'react-native';
import Popover from 'react-native-popover-view';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Text from './Text';
import { removeSkillBook } from '~/services/api';
import { usePlayerDataStore } from '~/stores/mainStore';
import { useShallow } from 'zustand/shallow';
import { router } from 'expo-router';

interface SkillBookProps {
  id: string;
  title: string;
  level: 'low' | 'medium' | 'high';
  icon: string | number; // Pode ser uma URL ou um `require`
  description: string;
  onOpen: (event: GestureResponderEvent) => void; // Função para abrir o livro
}

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

export const SkillBook: React.FC<SkillBookProps> = ({
  id,
  title,
  level,
  icon,
  description,
  onOpen,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const touchableRef = useRef<TouchableOpacity>(null);

  const { setUpdateSkillBookSignal } = usePlayerDataStore(
    useShallow((state) => ({
      setUpdateSkillBookSignal: state.setUpdateSkillBookSignal,
    }))
  );

  const deleteSkillBook = async () => {
    await removeSkillBook(id);
    setShowPopover(false);
    setUpdateSkillBookSignal(Math.random());
  };

  return (
    <>
      <Popover
        isVisible={showPopover}
        popoverStyle={{ backgroundColor: '#2A2A35', borderRadius: 12, width: 120 }}
        onRequestClose={() => setShowPopover(false)}
        from={touchableRef}>
        <View className="flex w-full flex-col items-center">
          <View className="flex w-full flex-col gap-1 p-2" style={{ alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => deleteSkillBook()}
              className="flex w-full flex-row items-center justify-start gap-1 rounded-lg bg-[--background]  px-2">
              <Icon name="trash" color="#ED6466" size={14} />
              <Text className="p-2 text-white ">Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                router.push({ pathname: '/create_skillbook', params: { skillBookId: id } });
                setShowPopover(false);
              }}
              className="flex w-full flex-row items-center justify-start gap-1 rounded-lg bg-[--background]  px-2">
              <Icon name="pen" color="#fff" size={14} />
              <Text className="p-2 text-white ">Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Popover>

      <TouchableOpacity
        ref={touchableRef}
        onPress={onOpen} // Clique curto chama o onOpen
        onLongPress={() => setShowPopover(true)} // Clique longo abre o Popover
      >
        <View className="w-30 z-20 flex h-56 max-h-56 min-w-36 max-w-36 flex-col items-center justify-center gap-2 rounded-lg bg-[--accent] px-2 py-4 shadow-lg">
          <Text className="text-md text-center text-white" black>
            {title}
          </Text>
        </View>
        <View className="absolute left-6 -z-10 mt-2 h-52 w-36 rounded-lg bg-[#6344ab]" />
        <View className="absolute left-2 -z-10 mt-4 h-48 w-36 rounded-lg bg-white drop-shadow-lg" />
      </TouchableOpacity>
    </>
  );
};
