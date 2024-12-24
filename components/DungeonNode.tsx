import React, { useState, useRef } from 'react';
import {
  TouchableHighlight,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
  Text as RNText,
  Image,
} from 'react-native';
import Text from './Text';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { enterRoadmapNode } from '~/services/api';
import { usePlayerDataStore } from '~/stores/mainStore';
import { useShallow } from 'zustand/shallow';
import { useSnackBar } from '~/contexts/SnackBarContext';

interface RoadmapNode {
  isCompleted: boolean;
  roadmapId: string;
  element: {
    id: string;
    name: string;
    requirements: [
      {
        type: string;
        value: number;
        description: string;
      },
    ];
  };
}

const DungeonNode: React.FC<RoadmapNode> = ({ element, roadmapId, isCompleted }) => {
  const [showPopover, setShowPopover] = useState<boolean>(false);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const buttonRef = useRef<View>(null); // Ref para o botão
  const { showSnackBar } = useSnackBar();
  const { setRoadmapProgress } = usePlayerDataStore(
    useShallow((state) => ({
      setRoadmapProgress: state.setRoadmapProgress,
    }))
  );

  const handleCompleteNode = async () => {
    try {
      const progress = await enterRoadmapNode(roadmapId, element.id);

      if (progress) {
        setRoadmapProgress(progress);

        showSnackBar(<Text className="text-white">Hurray! You invaded {element.name}</Text>);
      }

      
    } catch (err) {
      showSnackBar(<Text className="text-white">Not possible to invade</Text>);
    }

    setShowPopover(false);
  };

  const handleOpenPopover = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setPopoverPosition({
          top: pageY - 100, // Ajuste para aparecer acima do botão
          left: pageX + width / 2 - 90, // Centraliza horizontalmente
        });
        setShowPopover(true);
      });
    }
  };

  return (
    <View className="relative flex items-center justify-center">
      {/* Modal para o popover */}
      <Modal
        transparent={true}
        visible={showPopover}
        animationType="fade"
        onRequestClose={() => setShowPopover(false)}>
        <TouchableWithoutFeedback onPress={() => setShowPopover(false)}>
          <View className="flex-1">
            <View
              style={{
                position: 'absolute',
                top: popoverPosition.top,
                left: popoverPosition.left,
              }}
              className="z-10 w-48 rounded-lg bg-[--foreground] p-2 shadow-lg">
              <Text className="text-center text-white">{element.name}</Text>
              <View className="max-h-24 w-full overflow-auto">
                {element.requirements.map((req, index) => (
                  <Text className="text-center text-gray-300" key={index}>
                    {req.description}
                  </Text>
                ))}
                {!isCompleted && (
                  <TouchableOpacity
                    onPress={() => handleCompleteNode()}
                    className="my-2 w-full rounded-lg bg-[--accent] py-1">
                    <Text className="text-center text-white">Invade</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <TouchableHighlight
        ref={buttonRef} 
        onPress={handleOpenPopover}
        className="relative flex h-24 w-24 items-center justify-center rounded-full">
        {isCompleted ? (
          <Image style={{width: 24, height: 24}} source={require("../assets/dungeon.png")} />
        ) : (
            <Image style={{width: 104, height: 104}}  source={require("../assets/dungeon.png")} />
        )}
      </TouchableHighlight>
    </View>
  );
};

export default DungeonNode;
