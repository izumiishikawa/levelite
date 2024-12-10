import LottieView from 'lottie-react-native';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppUserContext } from '~/contexts/AppUserContext';
import { updateStreak } from '~/services/api';
import Text from './Text';

export default function AllTasksCompleted({ onComplete }: { onComplete: () => void }) {
  const { playerData } = useContext(AppUserContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCoinSplash, setShowCoinSplash] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (playerData && playerData._id) {
        try {
          await updateStreak(playerData._id); // Chama a função de atualização do streak
        } catch (error) {
          console.error('Erro ao atualizar o streak:', error);
        }
      }

      // Define o delay para a animação do coinsplash
      const timer = setTimeout(() => {
        setShowCoinSplash(true);
      }, 1000);

      // Cleanup do timeout ao desmontar o componente
      return () => clearTimeout(timer);
    };

    initialize();
  }, [playerData]);

  const steps = [
    {
      content: (
        <View className="flex flex-col items-center">
          <LottieView
            loop={false}
            autoPlay
            renderMode="SOFTWARE"
            style={styles.coinchest}
            source={require('../assets/coinchest.json')}
          />
          {showCoinSplash && (
            <LottieView
              loop={false}
              autoPlay
              renderMode="SOFTWARE"
              style={styles.coinsplash}
              source={require('../assets/coinsplash.json')}
            />
          )}
          <Text style={styles.contentText}>
            Você recebeu <Text style={styles.highlight}>{100} moedas</Text> por concluir suas
            tarefas diárias!
          </Text>
        </View>
      ),
    },
    {
      content: (
        <View className="flex flex-col items-center z-50">
          <LottieView
            loop={false}
            autoPlay
            renderMode="SOFTWARE"
            style={styles.coinchest}
            source={require('../assets/streak.json')}
          />
          <Text className="text-6xl font-extrabold text-[#ff9600] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            {(playerData?.streak + 1) || 0 + 1}
          </Text>
          <Text style={styles.contentTextStreak}>
            {((playerData?.streak + 1) || 0) + 1 === 1
              ? 'Você começou um novo streak! Continue completando suas tarefas diariamente para aumentar sua sequência.'
              : `Parabéns! Seu streak agora é de ${(playerData?.streak + 1) || 0 + 1} dias consecutivos.`}
          </Text>
        </View>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      onComplete(); // Chama a função passada ao componente
    }
  };

  return (
    <View className="h-full w-full bg-[--background]" style={styles.container}>
      {playerData && (
        <>
          <View style={styles.contentContainer}>{steps[currentStep].content}</View>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep < steps.length - 1 ? 'Próximo' : 'Concluir'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E25',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
  },
  contentTextStreak: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
  },
  coinchest: {
    width: 200,
    height: 200,
  },
  coinsplash: {
    position: 'absolute',
    width: 300,
    height: 300,
    top: -70,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
  nextButton: {
    backgroundColor: '#996DFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
