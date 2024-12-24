import React, { useContext, useRef, useState } from 'react';
import { Modal, StyleSheet, Vibration, View } from 'react-native';
import AttributeCard from './AttributeCard';
import { IntensityLevelTag } from './IntensityLevelTag';
import Text from './Text';
import { TaskConcluded } from './TaskConcluded';
import { Swipeable, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconMat from 'react-native-vector-icons/MaterialCommunityIcons';
import Title from './Title';
import { useShallow } from 'zustand/shallow';
import { usePenaltyZoneStore } from '~/stores/mainStore';

interface TaskInterface {
  title: string;
  description: string;
  intensityLevel: 'low' | 'medium' | 'high';
  xpReward: number;
  specificDays?: number[];
  skillBook: boolean,
  recurrence: string;
  attribute?: string; // Torna o atributo opcional
  isDefault: boolean; // Indica se é uma task padrão ou de skillbook
  status: 'completed' | 'pending';
  onComplete: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

type Attributes = {
  aura: number;
  vitality: number;
  focus: number;
};

const attributeIcons: { [key in keyof Attributes]: string } = {
  aura: '🤝',
  vitality: '💪',
  focus: '🧠',
};

export const TaskCard = ({
  title,
  description,
  intensityLevel,
  xpReward,
  skillBook,
  attribute,
  specificDays,
  isDefault,
  status,
  recurrence,
  onComplete,
  onRestore,
  onDelete,
}: TaskInterface) => {
  const isCompleted = status === 'completed';
  const { inPenaltyZone } = usePenaltyZoneStore(
    useShallow((state) => ({ inPenaltyZone: state.inPenaltyZone }))
  );
  const swipeableRef = useRef<Swipeable>(null);

  const [isLeftOpen, setIsLeftOpen] = useState(false); // Estado para rastrear se o lado esquerdo está aberto
  const [isRightOpen, setIsRightOpen] = useState(false); // Estado para rastrear se o lado esquerdo está aberto
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const playSound = async () => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(require('../assets/exp_effect.mp3'));
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (err) {
      console.error('Erro ao tocar som:', err);
    }
  };

  const playDeleteSound = async () => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(require('../assets/delete.mp3'));
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (err) {
      console.error('Erro ao tocar som:', err);
    }
  };

  const handleDeleteWithAnimation = () => {
    setIsDeleting(true); // Ativa a animação
    playDeleteSound();

    // Aguardar a conclusão da animação antes de fechar e deletar
    setTimeout(() => {
      onDelete();
      setIsDeleting(false); // Desativa o estado de animação
      if (swipeableRef.current) {
        swipeableRef.current.close(); // Fecha o Swipeable manualmente
      }
    }, 1500); // Ajuste o tempo para a duração da animação
  };

  function rightActions() {
    return (
      <View className="relative flex flex-1 flex-row items-center justify-center gap-10 bg-[--background] text-white">
        {isRightOpen && !isDeleting && (
          <>
            {/* Botão de abrir o modal */}
            <TouchableWithoutFeedback
              style={{ display: 'flex', alignItems: 'center' }}
              onPress={() => {
                setIsModalVisible(true); // Mostra o modal
                if (swipeableRef.current) swipeableRef.current.close(); // Fecha o Swipeable
              }}
              className="flex items-center">
              <IconMat name="details" size={30} color="#996DFF" />
              <Text black className="mb-2 text-lg text-[--accent]">
                DETAILS
              </Text>
            </TouchableWithoutFeedback>
            {/* Botão de deletar */}
            <TouchableWithoutFeedback
              style={{ display: 'flex', alignItems: 'center' }}
              onPress={handleDeleteWithAnimation}
              className="flex items-center">
              <Icon name="delete" size={30} color="#cb3d55" />
              <Text black className="mb-2 text-lg text-[#cb3d55] ">
                DELETE
              </Text>
            </TouchableWithoutFeedback>
          </>
        )}

        {/* Animação de deletar */}
        {isDeleting && (
          <View className="absolute inset-0 flex items-center justify-center">
            <LottieView
              loop={false}
              autoPlay
              renderMode={'SOFTWARE'}
              source={require('../assets/deleteParticles.json')}
              style={{ width: 300, height: 300 }}
            />
            <Text className="extraBold absolute text-2xl text-white">
              <Text className="text-[#cb3d55]">- {xpReward} EXP</Text> REMOVED
            </Text>
          </View>
        )}
      </View>
    );
  }

  function leftActions() {
    return (
      <View className="relative flex flex-1 items-center justify-center bg-[--background] text-white">
        {isLeftOpen && (
          <>
            <View className="absolute flex items-center justify-center">
              <LottieView
                loop={false}
                autoPlay
                renderMode={'SOFTWARE'}
                source={require('../assets/exp.json')}
                style={{ width: 500, height: 300, zIndex: 1000 }}
              />
            </View>
            {status === 'pending' ? (
              <Text className="text-2xl text-white" extraBold>
                <Text className="text-[--accent]">+ {xpReward} EXP</Text> RECEIVED
              </Text>
            ) : (
              <Text className="text-2xl text-white" extraBold>
                <Text className="text-[--accent]">- {xpReward} EXP</Text> REMOVED
              </Text>
            )}
          </>
        )}
      </View>
    );
  }

  const handleSwipeLeft = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }

    if (status === 'completed') {
      Vibration.vibrate();

      onRestore();
    } else if (status === 'pending') {
      Vibration.vibrate();

      onComplete();
    }
  };

  return (
    <>
      <Modal
        visible={isModalVisible}
        transparent={true} // Deve ser true para permitir o fundo transparente/esmaecido
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View className="h-auto w-full bg-[--background]">
            <View className="relative z-20 mx-auto flex h-full w-[80%] flex-col justify-center">
              <Title text={'Details'} />

              <View className="my-4 mt-10">
                <Text bold className="text-gray-400">
                  Task Title
                </Text>
                <Text className="text-white">{title || 'No title provided.'}</Text>
              </View>

              <View className="my-4">
                <Text bold className="text-gray-400">
                  Objective
                </Text>
                <Text className="text-white">{description || 'No description provided.'}</Text>
              </View>

              <View className="flex flex-row flex-wrap justify-between">
                <View>
                  <Text bold className="text-gray-400">
                    Attribute
                  </Text>
                  <View className="mt-1 w-24 flex-row justify-between gap-4">
                    <View className="rounded-full border border-[--accent] bg-transparent py-[2px] pl-1 pr-3">
                      <View className="flex flex-row items-center gap-2 text-center text-white">
                        <View className="flex h-5 w-5 flex-row items-center justify-center rounded-full bg-[--accent]">
                          <Text className="text-xs">{attributeIcons[attribute]}</Text>
                        </View>
                        <Text bold className="text-xs uppercase text-white">
                          {skillBook ? "Skill Book" : attribute}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View>
                  <Text bold className="mb-1 text-gray-400">
                    Difficulty
                  </Text>
                  <IntensityLevelTag level={intensityLevel} />
                </View>

                <View>
                  <Text bold className="mb-1 text-gray-400">
                    Status
                  </Text>
                  <TaskConcluded status={status} />
                </View>
              </View>

              <View className="my-2 mt-8">
                <Text bold className="text-gray-400">
                  Recurrence
                </Text>
                <Text className="capitalize text-white">{recurrence}</Text>
              </View>

              {specificDays && specificDays?.length > 0 ? (
                <View className="">
                  <Text bold className="text-gray-400">
                    Repeats On
                  </Text>
                  <View className="mt-2 flex flex-row flex-wrap gap-2">
                    {specificDays.map((day) => (
                      <View
                        key={day}
                        className="rounded-full bg-[--accent] px-4 py-1 text-center text-xs">
                        <Text className="text-white">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View className="my-4">
                  <Text bold className="text-gray-400">
                    Repeats On
                  </Text>
                  <Text className="text-white">No repeat days provided.</Text>
                </View>
              )}

              <View className="my-4">
                <Text bold className="text-gray-400">
                  Reward
                </Text>
                <Text black className="text-2xl text-[--accent]">
                  {xpReward || 0} EXP POINTS
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Swipeable
        ref={swipeableRef}
        onSwipeableWillOpen={(direction) => {
          if (direction === 'left') {
            setIsLeftOpen(true);
            playSound();
          }
          if (direction === 'right') {
            setIsRightOpen(true);
          }
        }}
        onSwipeableOpen={(direction) => {
          if (direction === 'left') handleSwipeLeft();
        }}
        onSwipeableClose={() => {
          if (!isDeleting) {
            setIsLeftOpen(false);
            setIsRightOpen(false);
          }
        }}
        containerStyle={{ overflow: 'visible' }}
        renderRightActions={rightActions}
        renderLeftActions={leftActions}>
        <View className="absolute left-5 top-0 z-20 rotate-[16deg]">
          {isDefault && attribute && (
            <AttributeCard
              isCompleted={isCompleted}
              icon={attributeIcons[attribute as keyof Attributes]}
            />
          )}
        </View>
        <View
          className={`relative max-h-32 w-full bg-[--secondary] py-4 text-white ${
            isCompleted
              ? 'border-b-gray-400'
              : inPenaltyZone
                ? 'border-b-[#cb3d55]'
                : 'border-b-[--accent]'
          } border-b-4`}>
          <View className="absolute right-[-25px] top-[-10px] h-32 w-12 -rotate-6 bg-[--foreground]"></View>

          <View className="relative ml-12 flex flex-row items-start justify-between">
            <View
              style={{ marginLeft: isDefault && attribute ? 20 : 0 }}
              className="flex w-full flex-col">
              <Text
                bold
                numberOfLines={2}
                className={`max-w-[85%] break-before-all text-sm uppercase ${
                  isCompleted ? 'text-gray-400 line-through' : 'text-white'
                }`}>
                {title}
              </Text>
              <View className="flex flex-row items-center gap-2">
                <Text
                  extraBold
                  className={`text-lg ${
                    isCompleted
                      ? 'text-gray-400'
                      : inPenaltyZone
                        ? 'text-[#cb3d55]'
                        : 'text-[--accent]'
                  }`}>
                  {xpReward} EXP
                </Text>
                <Text bold className={`text-xs ${isCompleted ? 'text-gray-400' : 'text-white'}`}>
                  POINTS
                </Text>
              </View>
            </View>
            <View className="absolute -bottom-1 right-0 mr-8 flex flex-row gap-2">
              <View className="flex items-center justify-center rounded-full bg-[--foreground] px-4">
                <Text className="text-xs capitalize text-white">{recurrence}</Text>
              </View>
              {isCompleted ? (
                <TaskConcluded status={status} />
              ) : (
                <IntensityLevelTag level={intensityLevel} />
              )}
            </View>
          </View>

          <View className="absolute left-[-27px] top-[-10px] h-32 w-12 -rotate-6 bg-[--foreground]"></View>
        </View>
      </Swipeable>
    </>
  );
};

const styles = StyleSheet.create({
  leftSwipe: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Fundo preto com opacidade
    justifyContent: 'center', // Centraliza o conteúdo verticalmente
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center', // Centraliza texto/botões dentro do modal
    width: '150%',
    transform: [{ rotate: '12deg' }],
    height: 'auto',
    flex: 1,
  },
  modalText: {
    color: '#000000',
    fontSize: 18,
    textAlign: 'center',
  },
});
