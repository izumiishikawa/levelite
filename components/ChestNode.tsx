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
import LottieView from 'lottie-react-native';

interface RoadmapNode {
  isCompleted: boolean;
  roadmapId: string;
  element: {
    id: string;
    rewards: {
      xp: number;
      items: string[];
    };
  };
}

const ChestNode: React.FC<RoadmapNode> = ({ element, roadmapId, isCompleted }) => {
  const [showPopover, setShowPopover] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [exp, setExp] = useState();
  const [items, setItems] = useState();
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
      const data = await enterRoadmapNode(roadmapId, element.id);

      if (data) {
        setItems(data.rewards.items);
        setExp(data.rewards.xp);
        setRoadmapProgress(data.progress);
        showSnackBar(<Text className="text-white">Hurray! You opened the chest!</Text>);
      }
    } catch (err) {
      showSnackBar(<Text className="text-white">Not possible to open it yet</Text>);
    }

    setShowPopover(false)
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
        visible={showModal}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity
          onPress={() => setShowModal(false)}
          className="z-10 flex h-full w-full flex-1 items-center  justify-center bg-black/40">
          <View className="z-50 flex w-[90%] flex-col items-center justify-center rounded-lg bg-[--foreground] py-10">
            <LottieView
              source={require('../assets/treasure.json')}
              style={{ width: '100%', height: 200 }}
            />
            <Text className="text-2xl uppercase text-[#faaf00]" black>
              {isCompleted ? 'YOU RECEIVED' : 'YOU HAVE FOUND A TREASURE'}
            </Text>
            {isCompleted ? (
              <View className="mt-4 flex w-full flex-col items-center justify-center">
                <Text className="text-lg uppercase text-[--accent]" black>
                  {exp || 0} exp points
                </Text>
                <View className="flex w-full flex-row items-center justify-center gap-10">
                  {(items || []).map((item, index) => (
                    <View className='flex flex-col items-center justify-center gap-4 mt-10' key={index}>
                      <Image
                        key={index}
                        resizeMethod="resize"
                        source={{
                          uri: `https://delicate-prawn-verbally.ngrok-free.app/files/${item.icon}`,
                        }}
                        style={{ width: 70, height: 70 }}
                      />
                      <Text className='text-white' bold>{item.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleCompleteNode()}
                className="mt-4 w-[80%] rounded-lg bg-[--accent] p-4">
                <Text className="text-center text-lg text-white" black>
                  Open It
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

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
              <Text className="text-center text-white">Treasure Chest</Text>
              <View className="max-h-24 w-full overflow-auto">
                {!isCompleted && (
                  <TouchableOpacity
                    onPress={() => setShowModal(!showModal)}
                    className="my-2 w-full rounded-lg bg-[--accent] py-1">
                    <Text className="text-center text-white">Open</Text>
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
          <Image style={{ width: 114, height: 104 }} source={require('../assets/opened_chest.png')} />
        ) : (
          <Image style={{ width: 104, height: 104 }} source={require('../assets/chest.png')} />
        )}
      </TouchableHighlight>
    </View>
  );
};

export default ChestNode;
