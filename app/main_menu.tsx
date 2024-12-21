import { router, useFocusEffect } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  interpolateColor,
  useSharedValue,
} from 'react-native-reanimated';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import AnimatedRollingNumbers from '~/components/AnimatedRolling';
import AttributeCircle from '~/components/AttributeCircle';

const MainMenu: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | undefined>();
  const initialPosition = -100;

  const sharedTranslateY = useSharedValue(initialPosition);
  const sharedOpacity = useSharedValue(0);
  const selectedItemTranslateY = useSharedValue(0);
  const selectedItemOpacity = useSharedValue(0);
  const selectedItemKey = useSharedValue('');
  const foregroundTranslateX = useSharedValue(-responsiveWidth(200));
  const textColorValue = useSharedValue(0);

  const sizes = {
    skill: responsiveFontSize(17),
    progress: responsiveFontSize(7),
    attributes: responsiveFontSize(8),
    achievements: responsiveFontSize(6),
    settings: responsiveFontSize(10),
    social: responsiveFontSize(12),
  };

  const opacities = {
    skill: 1.0,
    progress: 0.76,
    attributes: 0.85,
    achievements: 0.7,
    settings: 0.9,
    social: 0.8,
  };

  const createStyle = (delay: number, rotation: string, targetOpacity: number) =>
    useAnimatedStyle(() => ({
      opacity: withDelay(
        delay,
        withSpring(sharedOpacity.value * targetOpacity, { stiffness: 50, damping: 12 })
      ),
      transform: [
        { translateY: withDelay(delay, withSpring(sharedTranslateY.value)) },
        { rotate: rotation },
      ],
    }));

  const createForegroundStyle = (delay: number, rotation: string) =>
    useAnimatedStyle(() => ({
      transform: [
        {
          translateX: withDelay(delay, withTiming(foregroundTranslateX.value, { duration: 500 })),
        },
        { rotate: rotation },
      ],
    }));

  const createTextColorStyle = (delay: number) =>
    useAnimatedStyle(() => ({
      color: interpolateColor(textColorValue.value, [0, 1], ['#996DFF', '#FFFFFF']),
    }));

  const triggerReverseCascade = (itemKey: string) => {
    setSelectedItem(itemKey);
    sharedOpacity.value = 0;
    sharedTranslateY.value = initialPosition;
    foregroundTranslateX.value = -responsiveWidth(200);
    textColorValue.value = withTiming(0, { duration: 500 });

    selectedItemKey.value = itemKey;
    selectedItemOpacity.value = withTiming(1, { duration: 500 });
    selectedItemTranslateY.value = withSpring(0, { stiffness: 50, damping: 12 });

    setTimeout(() => {
        router.push({pathname: "/attributes"})
    }, 1000);
  };

  useFocusEffect(
    React.useCallback(() => {
      sharedTranslateY.value = initialPosition;
      sharedOpacity.value = 0;
      foregroundTranslateX.value = -responsiveWidth(200);
      textColorValue.value = 0;
  
      setTimeout(() => {
        sharedTranslateY.value = 0;
        sharedOpacity.value = 1;
        foregroundTranslateX.value = 0;
        textColorValue.value = withTiming(1, { duration: 500 });
      }, 500);
  
      return () => {
        sharedTranslateY.value = initialPosition;
        sharedOpacity.value = 0;
        foregroundTranslateX.value = -responsiveWidth(200);
        textColorValue.value = 0;
      };
    }, [])
  );
  

  const items = [
    { id: 'skill', name: 'Item 1', content: <AnimatedRollingNumbers /> },
    { id: 'attributes', name: 'Item 2', content: <AttributeCircle /> },
    { id: 'achievements', name: 'Item 3', content: <AnimatedRollingNumbers /> },
  ];

  return (
    <View className="flex h-full w-full flex-col items-center justify-center bg-[--background]">
      <Animated.Text
        className="z-20 text-[--accent]"
        style={[
          createStyle(0, '-12deg', opacities.skill),
          { fontSize: sizes.skill, marginBottom: responsiveHeight(-10) },
          styles.text,
        ]}
        onPress={() => triggerReverseCascade('skill')}>
        SKILL
      </Animated.Text>
      <View className="relative flex w-full items-center">
        <Animated.View
          style={[createForegroundStyle(500, '5deg'), styles.foreground]}
          className="absolute bg-[--foreground]"
        />
        <Animated.Text
          className="z-10 w-full text-center"
          style={[
            createStyle(50, '-6deg', opacities.progress),
            createTextColorStyle(500),
            { fontSize: sizes.progress, marginBottom: responsiveHeight(-4) },
            styles.text,
          ]}
          onPress={() => triggerReverseCascade('progress')}>
          Progress
        </Animated.Text>
      </View>
      <Animated.Text
        className="text-[--accent]"
        style={[
          createStyle(100, '-7deg', opacities.attributes),
          { fontSize: sizes.attributes, marginBottom: responsiveHeight(-2) },
          styles.text,
        ]}
        onPress={() => triggerReverseCascade('attributes')}>
        Attributes
      </Animated.Text>
      <View className="relative flex w-full items-center">
        <Animated.View
          style={[createForegroundStyle(600, '-5deg'), styles.foreground]}
          className="absolute bg-[--foreground]"
        />
        <Animated.Text
          className="z-10"
          style={[
            createStyle(200, '3deg', opacities.achievements),
            createTextColorStyle(600),
            { fontSize: sizes.achievements, marginBottom: responsiveHeight(-2) },
            styles.text,
          ]}
          onPress={() => triggerReverseCascade('achievements')}>
          Achievements
        </Animated.Text>
      </View>
      <Animated.Text
        className="text-[--accent]"
        style={[
          createStyle(300, '12deg', opacities.settings),
          { fontSize: sizes.settings, marginBottom: responsiveHeight(-4) },
          styles.text,
        ]}
        onPress={() => triggerReverseCascade('settings')}>
        CONFIG
      </Animated.Text>
      <View className="relative flex w-full items-center">
        <Animated.View
          style={[createForegroundStyle(700, '10deg'), styles.foreground]}
          className="absolute bg-[--foreground]"
        />
        <Animated.Text
          className="z-10 w-full text-center"
          style={[
            createStyle(400, '-3deg', opacities.social),
            createTextColorStyle(700),
            { fontSize: sizes.social },
            styles.text,
          ]}
          onPress={() => triggerReverseCascade('social')}>
          SOCIAL
        </Animated.Text>
      </View>
    </View>
  );
};

export default MainMenu;

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Poppins_900Black',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  foreground: {
    height: responsiveHeight(13),
    width: '120%',
    transform: [{ translateX: responsiveWidth(-100) }],
  },
});
