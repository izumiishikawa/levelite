import LottieView from 'lottie-react-native';
import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AppUserContext } from '~/contexts/AppUserContext';
import Text from './Text';
import AnimatedRollingNumbers from './AnimatedRolling';
import { useShallow } from 'zustand/shallow';
import { useCoinsAndStreakStore, usePlayerDataStore } from '~/stores/mainStore';

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const StreakCalendar = ({ streak }: { streak: number }) => {
  const todayIndex = new Date().getDay(); // Índice do dia atual da semana

  // Calcula os dias retroativos para preencher com base no streak
  const days = Array(7).fill(false); // Array de 7 dias (vazio por padrão)
  const fillDays = Math.min(streak, 7); // O streak nunca ultrapassa 7 dias

  for (let i = 0; i < fillDays; i++) {
    const fillIndex = (todayIndex - i + 7) % 7; // Retroativo
    days[fillIndex] = true;
  }

  // Reorganiza os labels para começar no dia correto retroativamente
  const adjustedDayLabels = [
    ...dayLabels.slice(todayIndex + 1),
    ...dayLabels.slice(0, todayIndex + 1),
  ];

  return (
    <View style={styles.streakCalendarContainer}>
      {days.map((isFilled, index) => (
        <View key={index} style={styles.streakDayContainer}>
          <Text style={styles.dayLabel}>
            {adjustedDayLabels[index % 7]}
          </Text>
          <View
            style={[
              styles.streakDot,
              isFilled && styles.filledDot, // Aplica estilo preenchido
            ]}
          >
            {isFilled && <Icon name="check" size={18} color="#FFFFFF" />}
          </View>
        </View>
      ))}
    </View>
  );
};


export default function AllTasksCompleted({ onComplete }: { onComplete: () => void }) {
  const { id } = usePlayerDataStore(
    useShallow((state) => ({ id: state.id }))
  );
  
  const { streak, coins, setCoins } = useCoinsAndStreakStore(
    useShallow((state) => ({ streak: state.streak, coins: state.coins, setCoins: state.setCoins }))
  );
  
  const [currentStep, setCurrentStep] = useState(0);
  const [showCoinSplash, setShowCoinSplash] = useState(false);

  useEffect(() => {
    setCoins(coins + 100)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCoinSplash(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [id]);

  const steps = [
    {
      content: (
        <View style={styles.content}>
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
            You received <Text style={styles.highlight}>{100} coins</Text> for completing your daily tasks!
          </Text>
        </View>
      ),
    },
    {
      content: (
        <View style={styles.content}>
          <LottieView
            loop={false}
            autoPlay
            renderMode="SOFTWARE"
            style={styles.streak}
            source={require('../assets/streak.json')}
          />
          <Text style={styles.streakNumber}>
            <AnimatedRollingNumbers value={streak + 1} textColor='#FF9600' />
          </Text>
          {/* <StreakCalendar streak={playerData?.streak || 0} /> */}
          <Text style={styles.contentTextStreak}>
            {(streak) === 1
              ? 'You started a new streak! Keep completing your daily tasks to increase your streak.'
              : `Congratulations! Your streak is now ${streak} consecutive days.`}
          </Text>
        </View>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      onRequestClose={() => {}}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {id && (
          <>
            <View style={styles.contentContainer}>{steps[currentStep].content}</View>
            <View style={styles.nextButtonContainer}>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                  {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#17171C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 20,
  },
  contentTextStreak: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
  },
  streakNumber: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#FF9600',
    textAlign: 'center',
    marginTop: 10,
  },
  coinchest: {
    width: 200,
    height: 200,
  },
  streak: {
    width: 300,
    height: 300,
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
  nextButtonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: '#996DFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakCalendarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  streakDayContainer: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  dayLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  streakDot: {
    width: 32,
    height: 32,
    borderRadius: 100,
    backgroundColor: '#444444',
    display: "flex",
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledDot: {
    backgroundColor: '#FF9600',
  },
});