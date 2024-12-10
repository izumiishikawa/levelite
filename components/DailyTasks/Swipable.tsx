import { View, useWindowDimensions, StyleSheet } from 'react-native';
import Text from '../Text';
import React, { useState, ReactNode, useContext } from 'react';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { completeTask, deleteTask, restoreTask } from '~/services/api';
import { AppUserContext } from '~/contexts/AppUserContext';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface SwipableProps {
  children: ReactNode;
  expPoints: number;
  taskId: string;
  userId: string;
  backgroundColor?: string;
  currentStatus: string;
  onSwipeComplete?: () => void; // Função a ser executada ao final das animações
  onDeleteComplete?: () => void; // Função a ser executada ao finalizar a exclusão
  onAllTasksCompleted?: () => void;
}

const Swipable: React.FC<SwipableProps> = (props) => {
  const { playerData, setPlayerData } = useContext(AppUserContext);
  const screenWidth = useWindowDimensions().width;
  const translateX = useSharedValue(0);
  const scaleX = useSharedValue(0);
  const [loaded, setLoaded] = useState(false);
  const [showExpText, setShowExpText] = useState(false);
  const [showDeleteText, setShowDeleteText] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Valores compartilhados para animar opacidade e escala do texto
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(1);

  const playSound = async () => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(require('../../assets/exp_effect.mp3'));
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (err) {
      console.error('Erro ao tocar som:', err);
    }
  };

  const playLevelUpSound = async () => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(require('../../assets/level_up.mp3'));
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (err) {
      console.error('Erro ao tocar som:', err);
    }
  };

  const playDeleteSound = async () => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(require('../../assets/delete.mp3'));
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (err) {
      console.error('Erro ao tocar som:', err);
    }
  };

  const completeCurrentTask = async () => {
    try {
      const data = await completeTask(props.taskId, props.userId);

      setPlayerData((prevPlayerData) => {
        const levelUp = data.user.level > prevPlayerData.level;

        if (levelUp) {
          playLevelUpSound();
        }

        return {
          ...prevPlayerData,
          currentXP: data.user.currentXP,
          level: data.user.level,
          pointsToDistribute: data.user.pointsToDistribute,
          xpForNextLevel: data.user.xpForNextLevel,
          attributes: {
            ...prevPlayerData.attributes,
            ...data.user.attributes,
          },
        };
      });

      if (props.onSwipeComplete) {
        runOnJS(props.onSwipeComplete)();
      }

      // Verificar se todas as tarefas foram concluídas
      if (data.allTasksCompleted && props.onAllTasksCompleted) {
        runOnJS(props.onAllTasksCompleted)(); // Chama a prop quando todas as tarefas são concluídas
      }
    } catch (err) {
      runOnJS(() => {
        translateX.value = withSpring(0);
        setShowExpText(false);
      })();
    }
  };

  const deleteCurrentTask = async () => {
    try {
      await deleteTask(props.taskId);
      if (props.onDeleteComplete) {
        runOnJS(props.onDeleteComplete)();
      }
    } catch (err) {
      console.error('Erro ao deletar tarefa:', err);
    }
  };

  const restoreCurrentTask = async () => {
    try {
      // Chama a API para restaurar a tarefa e recebe os novos dados do usuário
      const data = await restoreTask(props.taskId);
  
      // Atualiza o estado do jogador com os novos dados recebidos
      setPlayerData((prevPlayerData) => {
        return {
          ...prevPlayerData,
          currentXP: data.user.currentXP,
          level: data.user.level,
          pointsToDistribute: data.user.pointsToDistribute,
          xpForNextLevel: data.user.xpForNextLevel,
        };
      });
  
      // Chama a função de callback quando o swipe for concluído
      if (props.onSwipeComplete) {
        runOnJS(props.onSwipeComplete)();
      }
    } catch (err) {
      console.error('Erro ao restaurar tarefa:', err);
    }
  };
  
  const closeHeightAfterDelay = (action: 'complete' | 'delete') => {
    setTimeout(() => {
      scaleX.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setIsVisible)(false); // Define o estado como falso após a animação
      });
      setShowExpText(false);
      setShowDeleteText(false);

      if (action === 'complete') {
        if (props.currentStatus === 'pending') {
          completeCurrentTask();
        } else {
          restoreCurrentTask();
        }
      } else if (action === 'delete') {
        deleteCurrentTask();
      }
    }, 1000);
  };

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number }
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
    },
    onEnd: () => {
      if (translateX.value > 100) {
        translateX.value = withTiming(screenWidth, {}, () => {
          runOnJS(setShowExpText)(true);
          runOnJS(playSound)();
          textOpacity.value = withTiming(1, { duration: 500 });
          textScale.value = withTiming(1.5, { duration: 500 }, () => {
            runOnJS(closeHeightAfterDelay)('complete');
          });
        });
      } else if (translateX.value < -100) {
        translateX.value = withTiming(-screenWidth, {}, () => {
          runOnJS(setShowDeleteText)(true);
          runOnJS(playDeleteSound)();
          textOpacity.value = withTiming(1, { duration: 500 });
          textScale.value = withTiming(1.5, { duration: 500 }, () => {
            runOnJS(closeHeightAfterDelay)('delete');
          });
        });
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const heightStyle = useAnimatedStyle(() => ({
    height: scaleX.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  const backgroundColor = props.backgroundColor || '#2A2A35';

  if (!isVisible) {
    return null; // Não renderiza nada se o componente não estiver visível
  }

  return (
    <PanGestureHandler
      failOffsetY={[-5, 5]}
      activeOffsetX={[-5, 5]}
      onGestureEvent={gestureHandler}>
      <Animated.View
        style={[loaded ? heightStyle : { height: 'auto' }, { backgroundColor }]}
        onLayout={(e) => {
          if (!loaded) {
            scaleX.value = e.nativeEvent.layout.height;
            setLoaded(true);
          }
        }}>
        {showExpText && (
          <Animated.View style={[styles.expTextContainer, animatedTextStyle]}>
            <Text style={styles.expText}>
              {props.currentStatus === 'pending' ? (
                <Text>
                  <Text className="font-extrabold text-[--accent]">+ {props.expPoints} EXP</Text>{' '}
                  OBTIDO
                </Text>
              ) : (
                <Text>
                  <Text className="font-extrabold text-[--accent]">- {props.expPoints} EXP</Text>{' '}
                  REMOVIDO
                </Text>
              )}
            </Text>
            <View className="absolute flex items-center justify-center">
              <LottieView
                loop={false}
                autoPlay
                renderMode={'SOFTWARE'}
                source={require('../../assets/exp.json')}
                style={{ width: 500, height: 300 }}
              />
            </View>
          </Animated.View>
        )}
        {showDeleteText && (
          <Animated.View style={[styles.expTextContainer, animatedTextStyle]}>
            <Icon name="trash" size={20} color="#ED6466" />
            <Text style={[styles.expText, { color: '#ED6466' }]}>Tarefa Deletada</Text>
            <View className="absolute flex items-center justify-center">
              <LottieView
                loop={false}
                autoPlay
                renderMode={'SOFTWARE'}
                source={require('../../assets/deleteParticles.json')}
                style={{ width: 300, height: 200 }}
              />
            </View>
          </Animated.View>
        )}
        <Animated.View style={animatedStyle}>{props.children}</Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  expTextContainer: {
    ...StyleSheet.absoluteFillObject,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 1,
  },
  expText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 18,
  },
});

export default Swipable;
