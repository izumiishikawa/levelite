import LottieView from 'lottie-react-native';
import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Text from './Text';

interface LevelUpAlertProps {
  visible: boolean;
  level: number;
  onClose: () => void;
}

const LevelUpAlert: React.FC<LevelUpAlertProps> = ({ visible, level, onClose }) => {
  const scaleY = useSharedValue(visible ? 1 : 0);
  const opacity = useSharedValue(visible ? 1 : 0);

  // Atualiza as animações ao alterar `visible`
  React.useEffect(() => {
    if (visible) {
      scaleY.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
      opacity.value = withTiming(1, { duration: 500 });
    } else {
      scaleY.value = withTiming(0, { duration: 500 });
      opacity.value = withTiming(0, { duration: 500 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null; // Retorna null se não for visível

  return (
    <View style={[styles.fullScreen, { zIndex: 9999 }]}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Animação de Confettis */}
          <LottieView
            loop
            autoPlay
            renderMode="SOFTWARE"
            source={require('../assets/confettis.json')}
            style={styles.lottie}
          />
          {/* Caixa de Alerta */}
          <Animated.View style={[styles.alertBox, animatedStyle]}>
            <Text style={styles.title}>Level Up!</Text>
            <View style={styles.separator} />
            <Text style={styles.message}>Parabéns! Você subiu de nível!</Text>
            <Text style={styles.levelInfo}>
              Você alcançou o <Text style={styles.levelText}>LVL {level}</Text>
            </Text>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    position: 'absolute',
    width: '160%',
    height: '250%',
  },
  alertBox: {
    width: '80%',
    backgroundColor: '#17171C',
    borderRadius: 12,
    padding: 20,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#996DFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    width: '70%',
    backgroundColor: '#FFF',
    marginVertical: 16,
  },
  message: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
  },
  levelInfo: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  levelText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#996DFF',
  },
});

export default LevelUpAlert;
