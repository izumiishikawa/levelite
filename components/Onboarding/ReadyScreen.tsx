import React, { useState } from 'react';
import { View, TouchableOpacity, Animated, Easing } from 'react-native';
import Text from '../Text';

interface ReadyScreenProps {
  onNext: () => void;
}

export const ReadyScreen: React.FC<ReadyScreenProps> = ({ onNext }) => {
  const [accepted, setAccepted] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));

  const handleAccept = () => {
    setAccepted(true);

    // Inicia a animação com um delay de 500ms
    setTimeout(() => {
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(onNext, 2000); 
      });
    }, 500);
  };

  // Animação para o "0" descer para fora da tela
  const level0TranslateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50], // Movimenta o "0" para baixo
  });

  // Animação para o "1" subir para a posição de destaque
  const level1TranslateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0], // Movimenta o "1" para cima
  });

  return (
    <View className="flex flex-1 flex-col w-[80%] items-center justify-center bg-[--background]">
      {!accepted ? (
        <View className="w-full text-center justify-center items-center">
          <Text className="text-md text-center text-[#B8B8B8]">
          Congratulations! You have proven yourself worthy and officially qualified as a{' '}
            <Text className="font-bold text-white">Player</Text>
          </Text>
          <Text className='text-sm text-[#B8B8B8] mt-2'>Do you accept this challenge?</Text>
          <TouchableOpacity onPress={handleAccept} className="mt-10 rounded-md bg-[--accent] flex justify-center items-center w-full px-6 py-3">
            <Text className="text-lg font-semibold text-white">I ACCEPT</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text className='text-white'>Welcome aboard, Player.</Text>

          <View className='flex flex-row justify-center items-center text-center'>
            <Text style={{paddingLeft: 50, fontSize: 48, fontWeight: 'bold', color: 'white' }}>
              LEVEL <Text className="text-[--accent]">0</Text>
            </Text>
            <View style={{ position: 'relative', width: 70, height: 60, overflow: 'hidden' }}>
              {/* "LVL 0" animação de saída */}
              <Animated.Text
                style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: '#996DFF',
                  position: 'absolute',
                  transform: [{ translateY: level0TranslateY }],
                  opacity: animationValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.5, 0],
                  }),
                }}>
                0
              </Animated.Text>
              {/* "LVL 1" animação de entrada */}
              <Animated.Text
                style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: '#996DFF',
                  position: 'absolute',
                  transform: [{ translateY: level1TranslateY }],
                  opacity: animationValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.5, 1],
                  }),
                }}>
                1
              </Animated.Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default ReadyScreen;
