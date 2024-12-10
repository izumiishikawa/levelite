import React, { useContext, useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { AppUserContext } from '~/contexts/AppUserContext';
import { distributeAttributes } from '~/services/api';
import Text from './Text';

interface ProfileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

const ProfileBottomSheet: React.FC<ProfileBottomSheetProps> = ({ isOpen, onClose }) => {
  const { playerData, setPlayerData } = useContext(AppUserContext);

  const [attributes, setAttributes] = useState({
    aura: 0,
    vitality: 0,
    focus: 0,
  });

  const [availablePoints, setAvailablePoints] = useState(0);

  useEffect(() => {
    if (playerData) {
      setAttributes({
        aura: playerData.attributes.aura,
        vitality: playerData.attributes.vitality,
        focus: playerData.attributes.focus,
      });
      setAvailablePoints(playerData.pointsToDistribute);
    }
  }, [playerData]);

  const translateY = useSharedValue(height);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(isOpen ? height * 0.3 : height, { damping: 15 });
    overlayOpacity.value = withSpring(isOpen ? 1 : 0, { damping: 15 });
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleClose = () => {
    translateY.value = withSpring(height + 100, { damping: 15 });
    overlayOpacity.value = withSpring(0, { damping: 15 }, () => {
      runOnJS(onClose)();
    });
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startY: number }>({
    onStart: (_, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateY.value = Math.max(context.startY + event.translationY, height * 0.3);
    },
    onEnd: () => {
      if (translateY.value > height * 0.5) {
        translateY.value = withSpring(height + 100, { damping: 15 });
        overlayOpacity.value = withSpring(0, { damping: 15 }, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(height * 0.3, { damping: 15 });
      }
    },
  });

  if (!isOpen) return null;

  const attributeInfo = [
    { name: 'Aura', emoji: '🧠', key: 'aura', description: 'Habilidades mentais' },
    { name: 'Vitalidade', emoji: '💪', key: 'vitality', description: 'Força física e energia' },
    { name: 'Foco', emoji: '🎯', key: 'focus', description: 'Foco e consistência' },
  ] as const;

  type AttributeKey = (typeof attributeInfo)[number]['key'];

  const handleAddPoint = (key: AttributeKey) => {
    if (availablePoints > 0) {
      setAttributes((prev) => ({ ...prev, [key]: prev[key] + 1 }));
      setAvailablePoints((prev) => prev - 1);
    }
  };

  const handleRemovePoint = (key: AttributeKey) => {
    if (attributes[key] > (playerData?.attributes[key] || 0)) {
      setAttributes((prev) => ({ ...prev, [key]: prev[key] - 1 }));
      setAvailablePoints((prev) => prev + 1);
    }
  };

  const calculateDistributedPoints = () => {
    const distributedPoints = {} as Record<AttributeKey, number>;
    for (const key of Object.keys(attributes) as AttributeKey[]) {
      distributedPoints[key] = attributes[key] - playerData.attributes[key];
    }
    return distributedPoints;
  };

  const handleConfirm = async () => {
    const recentPoints = calculateDistributedPoints();
    try {
      await distributeAttributes(playerData._id, recentPoints);
      setAttributes({
        aura: 0,
        vitality: 0,
        focus: 0,
      }),
        setAvailablePoints(0);
      handleClose();
    } catch (error) {
      console.error('Failed to distribute attributes', error);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.overlay, animatedOverlayStyle]} />
      {playerData && (
        <>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose} />

          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.container, animatedStyle]}>
              <View style={styles.userInfo}>
                <Image source={require('../assets/pfp.jpg')} style={styles.profileImage} />
                <Text style={styles.userName}>
                  {playerData?.username || 'Usuário'}{' '}
                  <Text className="text-bold text-[--accent]"> [ LVL {playerData?.level} ]</Text>
                </Text>
                <Text style={styles.userDetails}>
                  Peso: {playerData?.weight || 'N/A'} kg | Altura: {playerData?.height || 'N/A'} cm
                </Text>
                <View className="h-[1px] w-[70%] bg-white" />
              </View>

              <View style={styles.pointsContainer}>
                <Text style={styles.sectionTitle}>
                  Pontos Disponíveis <Text className="text-[--accent]">[ {availablePoints} ]</Text>
                </Text>

                {attributeInfo.map((attr) => (
                  <View key={attr.key} style={styles.attributeRow}>
                    <View>
                      <Text style={styles.attributeName}>
                        {attr.emoji} {attr.name}
                      </Text>
                      <Text style={styles.attributeDescription}>{attr.description}</Text>
                    </View>
                    <View style={styles.counter}>
                      <TouchableOpacity
                        onPress={() => handleRemovePoint(attr.key)}
                        disabled={attributes[attr.key] === (playerData?.attributes[attr.key] || 0)}
                        style={styles.button}>
                        <Text style={styles.buttonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.attributePoints}>{attributes[attr.key]}</Text>
                      <TouchableOpacity
                        onPress={() => handleAddPoint(attr.key)}
                        disabled={availablePoints === 0}
                        style={styles.button}>
                        <Text style={styles.buttonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={handleConfirm}
                  className="flex w-full mt-4 items-center justify-center rounded-md bg-[--accent] py-4">
                  <Text className="text-white font-bold">Confirmar</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </PanGestureHandler>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#2A2A35',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 40,
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 100,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  userDetails: {
    fontSize: 14,
    color: '#B8B8B8',
  },
  pointsContainer: {
    flex: 1,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  attributeName: {
    fontSize: 16,
    color: 'white',
  },
  attributeDescription: {
    fontSize: 12,
    color: '#B8B8B8',
  },
  counter: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4A4A4A',
    borderRadius: 5,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  attributePoints: {
    fontSize: 16,
    color: 'white',
  },
});

export default ProfileBottomSheet;
