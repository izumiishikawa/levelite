import { Tabs } from 'expo-router';
import React, { useState, useReducer, useRef, useContext } from 'react';
import { StyleSheet, Image, LayoutChangeEvent, TouchableOpacity, View } from 'react-native';
import Text from '~/components/Text';
import ProfileBottomSheet from '~/components/ProfileBottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import { AppUserContext } from '~/contexts/AppUserContext';

export default function TabLayout() {
  const {playerData} = useContext(AppUserContext);

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  return (
    <>
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#17171C',
          },
          headerLeft: () => (
            <View className='ml-4 bg-[--accent] rounded-full w-8 h-8 flex justify-center items-center'>
              <Text className='text-white text-lg' extraBold>04</Text>
            </View>
          ),
          headerRight: () => (
            <View className="flex flex-row items-center gap-5">
              <View className="flex flex-row items-center gap-2">
                <Image
                  source={require('../../assets/coin.png')}
                  style={{
                    width: 20,
                    height: 20,
                  }}
                />
                <Text className="text-lg font-bold text-[#FFD700]">{playerData && playerData.coins || 0}</Text>
              </View>
              <View className="flex flex-row items-center gap-1">
                <Image
                  source={require('../../assets/streak.png')}
                  style={{
                    width: 26,
                    height: 26,
                  }}
                />
                <Text className="text-lg font-bold text-[#ff9600]">{playerData && playerData.streak}</Text>
              </View>
              <TouchableOpacity onPress={toggleBottomSheet} style={{ marginRight: 15 }}>
                {/* <Image
                  source={require('../../assets/pfp.jpg')}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 20,
                  }}
                /> */}
              </TouchableOpacity>
            </View>
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            headerTitle: '',
            title: 'Levelite',
            tabBarIcon: ({ ref }) => (
              <LottieView
                loop={false}
                ref={ref}
                autoPlay
                source={require('../../assets/home.json')}
                style={{ width: 25, height: 25 }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="skillbooks"
          options={{
            headerTitle: '',
            title: 'Habilidades',
            tabBarIcon: ({ ref }) => (
              <LottieView
                loop={false}
                ref={ref}
                autoPlay
                source={require('../../assets/book.json')}
                style={{ width: 25, height: 25 }}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            headerTitle: '',
            title: 'Jogador',
            tabBarIcon: ({ ref }) => (
              <LottieView
                loop={false}
                ref={ref}
                autoPlay
                source={require('../../assets/avatar.json')}
                style={{ width: 25, height: 25 }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="rank"
          options={{
            headerTitle: '',
            title: 'Competitivo',
            tabBarIcon: ({ ref }) => (
              <LottieView
                loop={false}
                ref={ref}
                autoPlay
                source={require('../../assets/Competition.json')}
                style={{ width: 36, height: 36 }}
              />
            ),
          }}
        />
      </Tabs>
      <ProfileBottomSheet isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)} />
    </>
  );
}

const AnimatedTabBar = ({
  state: { index: activeIndex, routes },
  navigation,
  descriptors,
}: any) => {
  const { bottom } = useSafeAreaInsets();
  const [layout, dispatch] = useReducer((state: any, action: any) => [...state, action], []);

  const handleLayout = (event: LayoutChangeEvent, index: number) => {
    const x = event.nativeEvent.layout.x;
    dispatch({ index, x });
  };

  return (
    <View style={[styles.tabBarContainerWrapper, { paddingBottom: bottom + 10 }]}>
      <View style={styles.tabBar}>
        {routes.map((route: any, index: number) => {
          const active = index === activeIndex;
          const { options } = descriptors[route.key];

          return (
            <TabBarComponent
              key={route.key}
              active={active}
              options={options}
              onLayout={(e: any) => handleLayout(e, index)}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        })}
      </View>
    </View>
  );
};

const TabBarComponent = ({ active, options, onLayout, onPress }: any) => {
  const lottieRef = useRef(null);

  // Animação para o fundo expansível
  const backgroundAnimation = useAnimatedStyle(() => ({
    width: withTiming(active ? 120 : 50, { duration: 250 }), // Expande para englobar o texto
    height: 45, // Altura fixa
    backgroundColor: active ? '#2A2A35' : 'transparent', // Muda a cor
    flexDirection: 'row', // Alinha ícone e texto lado a lado
    alignItems: 'center', // Centraliza verticalmente
    justifyContent: 'flex-start', // Centraliza horizontalmente
    gap: 5,
    borderRadius: 25,
    paddingHorizontal: 10,
  }));

  // Animação para o texto
  const textAnimation = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(active ? 0 : 20, { duration: 250 }) }, // Swipe
    ],
    opacity: withTiming(active ? 1 : 0, { duration: 250 }), // Fade in/out
  }));

  const handlePress = () => {
    if (lottieRef.current && typeof lottieRef.current.play === 'function') {
      lottieRef.current.play(); // Toca a animação
    }
    onPress(); // Navega para a aba
  };

  return (
    <TouchableOpacity onPress={handlePress} onLayout={onLayout} style={styles.tabItem}>
      <Animated.View style={[styles.circleBackground, backgroundAnimation]}>
        {/* Ícone */}
        {options.tabBarIcon ? (
          <View style={styles.lottieWrapper}>
            {options.tabBarIcon({
              focused: active,
              ref: lottieRef, // Passe a referência para o ícone
            })}
          </View>
        ) : (
          <Text>?</Text>
        )}
        {/* Texto animado */}
        <Animated.Text style={[styles.tabText, textAnimation]}>
          {options.title || options.tabBarLabel || 'Tab'}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabBarContainerWrapper: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Distribui as abas igualmente
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
    flex: 1, // Cada aba ocupa o mesmo espaço
    alignItems: 'center',
  },
  circleBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centraliza conteúdo horizontalmente
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
});
