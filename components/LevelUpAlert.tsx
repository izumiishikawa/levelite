import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import LottieView from 'lottie-react-native';
import Text from './Text';
import AnimatedRollingNumbers from './AnimatedRolling';

interface LevelUpAlertProps {
  visible: boolean;
  level: number;
  onClose: () => void;
}

const LevelUpAlert: React.FC<LevelUpAlertProps> = ({ visible, level, onClose }) => {
  const [initialLevel, setInitialLevel] = useState(999);
  const scaleY = useSharedValue(visible ? 1 : 0);
  const opacity = useSharedValue(visible ? 1 : 0);
  const translateX = useSharedValue(visible ? -500 : 0);
  const arrowY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scaleY.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
      opacity.value = withTiming(1, { duration: 500 });
      translateX.value = withTiming(-80, { duration: 500, easing: Easing.out(Easing.ease) });

      arrowY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      setTimeout(() => {
        setInitialLevel(level);
      }, 1000);
    } else {
      scaleY.value = withTiming(0, { duration: 500 });
      opacity.value = withTiming(0, { duration: 500 });
      translateX.value = withTiming(-300, { duration: 500 });
    }
  }, [visible, level]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
    opacity: opacity.value,
  }));

  const textSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: arrowY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      statusBarTranslucent
      transparent={true}
      style={[styles.fullScreen, { zIndex: 9999 }]}>
      <View style={styles.fullScreen} />
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Animação de Confettis */}
          <LottieView
            loop={false}
            autoPlay
            renderMode="SOFTWARE"
            source={require('../assets/confettis.json')}
            style={styles.lottie}
          />
          {/* Caixa de Alerta */}
          <View style={styles.alertBox}>
            <Animated.View style={[styles.levelUpTextContainer, textSlideStyle]}>
              <View style={[styles.backgroundAccent]} />
              <Text black style={[styles.levelUpText]}>LEVEL UP!</Text>
            </Animated.View>
          </View>
          <View style={styles.centered}>
            <AnimatedRollingNumbers textColor="#fff" fontSize={220} value={initialLevel} />
            <LottieView
              loop={true}
              autoPlay
              renderMode="SOFTWARE"
              source={require('../assets/arrowup.json')}
              style={styles.up}
            />
          </View>
          {/* Animação de 3 setas */}
          <View style={styles.arrowContainer}>
            {[...Array(3)].map((_, index) => (
              <Animated.View key={index} style={[styles.arrowIcon, arrowStyle]}>
                <Icon name="chevron-up" className='opacity-25' size={180} color="#996DFF" />
              </Animated.View>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lottie: {
    position: 'absolute',
    width: '160%',
    height: '250%',
  },
  up: {
    position: 'absolute',
    width: '120%',
    height: '150%',
    zIndex: 9999,
  },
  alertBox: {
    width: '200%',
    backgroundColor: '#17171C',
    borderRadius: 12,
    padding: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '60%',
    transform: [{ rotate: '16deg' }],
  },
  levelUpTextContainer: {
    position: 'relative',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  levelUpText: {
    fontSize: 80,
    color: '#996DFF',
  },
  backgroundAccent: {
    height: 56,
    width: 80,
    backgroundColor: '#996DFF',
  },
  arrowContainer: {
    position: "absolute",
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  arrowIcon: {
    marginVertical: -40,
  },
  centered: {
    position: 'absolute',
    zIndex: 50,
    alignItems: 'center',
  },
});

export default LevelUpAlert;
