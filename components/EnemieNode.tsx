import React, { useState, useRef } from 'react';
import {
  TouchableHighlight,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
  Text as RNText,
} from 'react-native';
import Text from './Text';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { enterRoadmapNode, startDungeonBattle } from '~/services/api';
import { usePlayerDataStore } from '~/stores/mainStore';
import { useShallow } from 'zustand/shallow';
import { useSnackBar } from '~/contexts/SnackBarContext';

interface RoadmapNode {
  isDefeated: boolean;
  roadmapId: string;
  element: {
    id: string;
    name: string;
    health: number;
  };
}

const EnemieNode: React.FC<RoadmapNode> = ({ element, roadmapId, isDefeated }) => {
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
      const enemy = await startDungeonBattle(element.id);
      console.log(enemy);

    } catch (err) {
      showSnackBar(<Text className="text-white">Cannot conquer it yet</Text>);
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
                {!isDefeated && (
                  <TouchableOpacity
                    onPress={() => handleCompleteNode()}
                    className="my-2 w-full rounded-lg bg-[--accent] py-1">
                    <Text className="text-center text-white">Battle</Text>
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
        style={{ backgroundColor: isDefeated ? '#996DFF' : '#2A2A35' }}
        className="relative flex h-24 w-24 items-center justify-center rounded-full">
        {isDefeated ? (
          <Icon name="circle-check" color="#fff" size={30} />
        ) : (
          <Icon name="lock" color="#000" size={30} />
        )}
      </TouchableHighlight>
    </View>
  );
};

export default EnemieNode;
