import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import AnimatedRollingNumbers from '~/components/AnimatedRolling';
import Text from '~/components/Text';
import Title from '~/components/Title';
import { TouchableWithoutFeedback } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { useAttributesStore, useLevelsAndExpStore } from '~/stores/mainStore';
import { distributeAttributes } from '~/services/api';
import { router } from 'expo-router';
const AttributeCircle: React.FC = () => {
  const { pointsToDistribute, setPointsToDistribute } = useLevelsAndExpStore(
    useShallow((state) => ({
      pointsToDistribute: state.pointsToDistribute,
      setPointsToDistribute: state.setPointsToDistribute,
    }))
  );

  const { aura, vitality, focus, setAura, setVitality, setFocus } = useAttributesStore(
    useShallow((state) => ({
      aura: state.aura,
      vitality: state.vitality,
      focus: state.focus,
      setAura: state.setAura,
      setVitality: state.setVitality,
      setFocus: state.setFocus,
    }))
  );

  const vitalityAnimation = useRef<LottieView>(null);
  const auraAnimation = useRef<LottieView>(null);
  const focusAnimation = useRef<LottieView>(null);

  const [availablePoints, setAvailablePoints] = useState(pointsToDistribute);
  const [attributes, setAttributes] = useState({
    aura,
    vitality,
    focus,
  });

  // Titles for attributes
  const titles = {
    vitality: [
      'Fragile',
      'Weak',
      'Average',
      'Strong',
      'Durable',
      'Iron Body',
      'Unbreakable',
      'Titanic',
      'Colossal',
      'Immortal',
    ],
    aura: [
      'No Presence',
      'Faint',
      'Noticeable',
      'Influential',
      'Commanding',
      'Imposing',
      'Dominant',
      'Regal',
      'Majestic',
      'Legendary',
    ],
    focus: [
      'Scatterbrain',
      'Unfocused',
      'Average',
      'Sharp',
      'Insightful',
      'Brilliant',
      'Genius',
      'Mastermind',
      'Prodigy',
      'Omniscient',
    ],
  };

  const getTitle = (attribute: number, type: keyof typeof titles) => {
    const index = Math.min(Math.floor(attribute / 5), titles[type].length - 1);
    return titles[type][index];
  };

  const handlePlayAnimation = (animationRef: React.RefObject<LottieView>) => {
    if (animationRef.current) {
      animationRef.current.play();
    }
  };

  const handleAddPoint = (
    key: keyof typeof attributes,
    animationRef: React.RefObject<LottieView>
  ) => {
    if (availablePoints > 0) {
      setAttributes((prev) => ({ ...prev, [key]: prev[key] + 1 }));
      setAvailablePoints((prev) => prev - 1);
      handlePlayAnimation(animationRef);
    }
  };

  const handleRemovePoint = (key: keyof typeof attributes) => {
    if (attributes[key] > (key === 'aura' ? aura : key === 'vitality' ? vitality : focus)) {
      setAttributes((prev) => ({ ...prev, [key]: prev[key] - 1 }));
      setAvailablePoints((prev) => prev + 1);
    }
  };

  const handleConfirm = async () => {
    const recentPoints = {
      aura: attributes.aura - aura,
      vitality: attributes.vitality - vitality,
      focus: attributes.focus - focus,
    };

    if (recentPoints.aura > 0 || recentPoints.vitality > 0 || recentPoints.focus > 0) {
      try {
        await distributeAttributes('playerId', recentPoints);
        setAura(attributes.aura);
        setVitality(attributes.vitality);
        setFocus(attributes.focus);
        setAvailablePoints(0);
        setPointsToDistribute(0);
        router.back();
      } catch (error) {
        console.error('Failed to distribute attributes', error);
      }
    } else {
      console.warn('No points distributed. Please allocate at least one point before confirming.');
    }
  };

  const renderRemoveButton = (key: keyof typeof attributes) => (
    <TouchableOpacity
      onPress={() => handleRemovePoint(key)}
      style={{
        position: 'absolute',
        bottom: 0,
        right: -15,
        width: 60,
        height: 60,
        backgroundColor: '#cb3d55',
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
      }}>
      <Text black className="text-5xl text-white">
        -
      </Text>
    </TouchableOpacity>
  );

  const renderCircle = (
    key: keyof typeof attributes,
    label: string,
    value: number,
    animationRef: React.RefObject<LottieView>,
    type: keyof typeof titles
  ) => (
    <View style={{ position: 'relative' }}>
      {attributes[key] > (key === 'aura' ? aura : key === 'vitality' ? vitality : focus) &&
        renderRemoveButton(key)}
      <TouchableWithoutFeedback onPress={() => handleAddPoint(key, animationRef)}>
        <View
          style={{ width: 202, height: 202 }}
          className="relative flex items-center justify-center rounded-full bg-[--accent]">
          <View className="absolute left-0 h-full w-full">
            <LottieView
              ref={animationRef}
              loop={false}
              autoPlay={false}
              source={require('../assets/atripulse.json')}
              style={{
                width: '200%',
                height: '200%',
                position: 'absolute',
                left: -100,
                top: -100,
              }}
            />
          </View>

          <View className="absolute w-full top-4 flex rotate-6 flex-col items-center gap-0">
            <Text className="text-5xl text-white" black>
              {label}
            </Text>
            <AnimatedRollingNumbers value={value} textColor="#fff" fontSize={100} />
            <View className="absolute -bottom-8 w-[110%] rotate-6 bg-[--foreground] px-4 py-2">
              <Text className="text-center text-lg text-white" bold>
                {getTitle(value, type)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );

  return (
    <ScrollView>
      <View className="mb-20 mt-20 flex h-full w-full flex-col items-center bg-[--background]">
        <View className="w-[80%]">
          <Title text="Attributes" />
          <Text className="my-4 text-center text-white">
            Here lies the power to shape your destiny: distribute your points and craft the ultimate
            build
          </Text>

          <View className="flex w-full flex-row items-center gap-4">
            <View className="flex h-12 w-12 items-center justify-center rounded-full bg-[--accent]">
              <Text className="text-3xl text-white" black>
                {availablePoints}
              </Text>
            </View>
            <Text className="text-3xl text-white" bold>
              REMAINING POINTS
            </Text>
          </View>
        </View>

        <View className="relative mt-10 flex w-[90%] flex-col items-center justify-center gap-10">
          {renderCircle('vitality', 'Vitality', attributes.vitality, vitalityAnimation, 'vitality')}
          {renderCircle('aura', 'Aura', attributes.aura, auraAnimation, 'aura')}
          {renderCircle('focus', 'Focus', attributes.focus, focusAnimation, 'focus')}
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          style={{
            marginTop: 40,
            width: '80%',
            height: 50,
            backgroundColor: availablePoints === pointsToDistribute ? '#2A2A35' : '#996DFF',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 12,
          }}
          disabled={availablePoints === pointsToDistribute}>
          <Text className="text-white" bold>
            Confirm
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AttributeCircle;
