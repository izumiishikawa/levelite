import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Image, GestureResponderEvent } from 'react-native';
import Popover from 'react-native-popover-view';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Text from './Text';

interface SkillBookProps {
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
  title,
  level,
  icon,
  description,
  onOpen,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const touchableRef = useRef<TouchableOpacity>(null);

  return (
    <>
      <Popover
        isVisible={showPopover}
        popoverStyle={{ backgroundColor: '#2A2A35', borderRadius: 20 }}
        onRequestClose={() => setShowPopover(false)}
        from={touchableRef}>
        <View className="flex flex-row items-center gap-2" style={{ padding: 10 }}>
          <View style={{ alignItems: 'center' }}>
            <Image
              className="rounded-full"
              source={typeof icon === 'string' ? { uri: icon } : icon}
              style={{ width: 50, height: 50 }}
            />
          </View>
          <Text className="text-left text-xs text-white">{description}</Text>
        </View>
      </Popover>

      <TouchableOpacity
        ref={touchableRef}
        onPress={onOpen} // Clique curto chama o onOpen
        onLongPress={() => setShowPopover(true)} // Clique longo abre o Popover
      >
        <TouchableOpacity className="absolute left-2 top-2 z-50 flex flex-row items-center gap-0 rounded-full bg-[--background] px-2 py-0.5">
          <Icon name="pen" className="mr-2" size={10} color="#fff" />
          <Text className="text-xs text-white" black>
            Edit
          </Text>
        </TouchableOpacity>
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
