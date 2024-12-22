import { router, Tabs } from 'expo-router';
import React, { useState, useReducer, useRef, useCallback, useContext } from 'react';
import { StyleSheet, Image, LayoutChangeEvent, TouchableOpacity, View } from 'react-native';
import Text from '~/components/Text';
import ProfileBottomSheet from '~/components/ProfileBottomSheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { classes } from '~/utils/classes';
import AnimatedRollingNumbers from '~/components/AnimatedRolling';
import { AppUserContext } from '~/contexts/AppUserContext';
import { useCoinsAndStreakStore, usePlayerDataStore } from '~/stores/mainStore';
import { useShallow } from 'zustand/shallow';

interface Class {
  id: string;
  icon: any;
}

interface TabBarIconProps {
  ref?: React.RefObject<LottieView>;
  focused?: boolean;
}

interface TabOptions {
  title?: string;
  tabBarLabel?: string;
  tabBarIcon?: (props: TabBarIconProps) => JSX.Element;
}

interface RouteDescriptor {
  key: string;
  options: TabOptions;
}

interface AnimatedTabBarProps {
  state: {
    index: number;
    routes: {
      name: string;
      key: string;
    }[];
  };
  navigation: any;
  descriptors: { [key: string]: RouteDescriptor };
}

interface TabBarComponentProps {
  active: boolean;
  options: TabOptions;
  onLayout: (event: LayoutChangeEvent) => void;
  onPress: () => void;
}

const HeaderLeft = React.memo(({ selectedClass }: { selectedClass?: Class }) => (
  <View style={{ marginLeft: 10 }}>
    {selectedClass ? (
      <Image resizeMethod="resize" source={selectedClass.icon} style={{ width: 30, height: 30 }} />
    ) : (
      <Text>Classe</Text>
    )}
  </View>
));

const HeaderRight = React.memo(
  ({
    icon,
    coins,
    gems,
    streak,
    toggleBottomSheet,
  }: {
    icon?: string;
    coins?: any;
    gems?: any;
    streak: any;
    toggleBottomSheet: () => void;
  }) => (
    <View style={styles.headerRightContainer}>
      <View style={styles.headerItemContainer}>
        <Image
          resizeMethod="resize"
          source={require('../../assets/gem.png')}
          style={styles.coinImage}
        />
        <AnimatedRollingNumbers textColor="#08b7fc" fontSize={18} value={gems || 0} />
      </View>
      <View style={styles.headerItemContainer}>
        <Image
          resizeMethod="resize"
          source={require('../../assets/coin.png')}
          style={styles.coinImage}
        />
        <AnimatedRollingNumbers textColor="#FFD700" fontSize={18} value={coins || 0} />
      </View>
      <View style={styles.headerItemContainer}>
        <Image
          resizeMethod="resize"
          source={require('../../assets/streak.png')}
          style={styles.streakImage}
        />
        <AnimatedRollingNumbers textColor="#ff9600" fontSize={18} value={streak || 0} />
      </View>
      <TouchableOpacity onPress={toggleBottomSheet}>
        <Image
          resizeMethod="resize"
          source={{
            uri: `https://delicate-prawn-verbally.ngrok-free.app/files/${icon}`,
          }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
    </View>
  )
);

export default function TabLayout() {
  const { icon, selectedClass } = usePlayerDataStore(
    useShallow((state) => ({
      icon: state.icon,
      selectedClass: state.selectedClass,
    }))
  );
  const { coins, streak, gems } = useCoinsAndStreakStore();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const toggleBottomSheet = useCallback(() => {
    router.push({ pathname: '/main_menu' });
  }, []);

  const currentClass = classes.find((cls) => cls.id === selectedClass);

  return (
    <>
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerStyle: styles.headerStyle,
          lazy: true,
          headerLeft: () => <HeaderLeft selectedClass={currentClass} />,
          headerRight: () => (
            <HeaderRight
              icon={icon}
              coins={coins}
              streak={streak}
              gems={gems}
              toggleBottomSheet={toggleBottomSheet}
            />
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            headerTitle: '',
            title: 'Levelite',
            tabBarIcon: ({ ref }: TabBarIconProps) => (
              <LottieView
                loop={false}
                ref={ref}
                autoPlay
                source={require('../../assets/home.json')}
                style={styles.lottieIcon}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="skillbooks"
          options={{
            headerTitle: '',
            title: 'Skills',
            tabBarIcon: ({ ref }: TabBarIconProps) => (
              <LottieView
                loop={false}
                ref={ref}
                autoPlay
                source={require('../../assets/book.json')}
                style={styles.lottieIcon}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerTitle: '',
            title: 'Player',
            tabBarIcon: ({ ref }: TabBarIconProps) => (
              <LottieView
                loop={false}
                ref={ref}
                autoPlay
                source={require('../../assets/avatar.json')}
                style={styles.lottieIcon}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            headerTitle: '',
            title: 'Shop',
            tabBarIcon: ({ ref }: TabBarIconProps) => (
              <LottieView
                loop={false}
                ref={ref}
                autoPlay
                source={require('../../assets/coin.json')}
                style={styles.lottieIcon}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="rank"
          options={{
            headerTitle: '',
            title: 'Ranks',
            tabBarIcon: ({ ref }: TabBarIconProps) => (
              <LottieView
                loop={false}
                ref={ref}
                autoPlay
                source={require('../../assets/Competition.json')}
                style={styles.lottieLargeIcon}
              />
            ),
          }}
        />
      </Tabs>
      <ProfileBottomSheet isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)} />
    </>
  );
}

const AnimatedTabBar = React.memo(
  ({ state: { index: activeIndex, routes }, navigation, descriptors }: AnimatedTabBarProps) => {
    const { bottom } = useSafeAreaInsets();
    const [layout, dispatch] = useReducer((state: any[], action: any) => [...state, action], []);

    const handleLayout = useCallback((event: LayoutChangeEvent, index: number) => {
      const x = event.nativeEvent.layout.x;
      dispatch({ index, x });
    }, []);

    return (
      <View style={[styles.tabBarContainerWrapper, { paddingBottom: bottom + 10 }]}>
        <View style={styles.tabBar}>
          {routes.map((route, index) => {
            const active = index === activeIndex;
            const { options } = descriptors[route.key];

            return (
              <TabBarComponent
                key={route.key}
                active={active}
                options={options}
                onLayout={(e) => handleLayout(e, index)}
                onPress={() => navigation.navigate(route.name)}
              />
            );
          })}
        </View>
      </View>
    );
  }
);

const TabBarComponent = React.memo(
  ({ active, options, onLayout, onPress }: TabBarComponentProps) => {
    const lottieRef = useRef<LottieView>(null);

    const backgroundAnimation = useAnimatedStyle(() => ({
      width: withTiming(active ? 95 : 50, { duration: 250 }),
      height: 45,
      backgroundColor: active ? '#2A2A35' : 'transparent',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      borderRadius: 25,
      paddingHorizontal: 10,
    }));

    const textAnimation = useAnimatedStyle(() => ({
      transform: [{ translateX: withTiming(active ? 0 : 20, { duration: 250 }) }],
      opacity: withTiming(active ? 1 : 0, { duration: 250 }),
    }));

    const handlePress = useCallback(() => {
      if (lottieRef.current && typeof lottieRef.current.play === 'function') {
        lottieRef.current.play();
      }
      onPress();
    }, [onPress]);

    return (
      <TouchableOpacity onPress={handlePress} onLayout={onLayout} style={styles.tabItem}>
        <Animated.View style={[styles.circleBackground, backgroundAnimation]}>
          {options.tabBarIcon ? (
            <View style={styles.lottieWrapper}>
              {options.tabBarIcon({
                focused: active,
                ref: lottieRef,
              })}
            </View>
          ) : (
            <Text>?</Text>
          )}
          <Animated.Text style={[styles.tabText, textAnimation]}>
            {options.title || options.tabBarLabel || 'Tab'}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#17171C',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  headerItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  coinImage: {
    width: 20,
    height: 20,
  },
  streakImage: {
    width: 26,
    height: 26,
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 20,
    marginRight: 20,
  },
  tabBarContainerWrapper: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#1E1E25',
    paddingHorizontal: 25,
    paddingVertical: 5,
    borderRadius: 100,
    width: '95%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  circleBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    overflow: 'hidden',
  },
  lottieWrapper: {
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  lottieIcon: {
    width: 25,
    height: 25,
  },
  lottieLargeIcon: {
    width: 36,
    height: 36,
  },
});
