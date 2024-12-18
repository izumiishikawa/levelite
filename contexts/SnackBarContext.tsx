import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { Animated, StyleSheet, View, Easing, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SnackBarContextType {
  showSnackBar: (content: ReactNode) => void;
}

const SnackBarContext = createContext<SnackBarContextType | null>(null);

export const useSnackBar = () => {
  const context = useContext(SnackBarContext);
  if (!context) throw new Error('useSnackBar must be used within a SnackBarProvider');
  return context;
};

export const SnackBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const position = useRef(new Animated.Value(Dimensions.get('window').height)).current; // Start off-screen

  const showSnackBar = useCallback((snackContent: ReactNode) => {
    setContent(snackContent);
    setVisible(true);

    // Slide up animation
    Animated.timing(position, {
      toValue: -insets.bottom - 80, // Position just above the bottom inset
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    // Hide after 3 seconds
    setTimeout(() => {
      Animated.timing(position, {
        toValue: Dimensions.get('window').height, // Slide off-screen
        duration: 300,
        easing: Easing.in(Easing.exp),
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        setContent(null);
      });
    }, 2000);
  }, [position, insets.bottom]);

  return (
    <SnackBarContext.Provider value={{ showSnackBar }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.snackBarContainer,
            { transform: [{ translateY: position }] },
          ]}>
          <View style={styles.snackBarContent}>{content}</View>
        </Animated.View>
      )}
    </SnackBarContext.Provider>
  );
};

const styles = StyleSheet.create({
  snackBarContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center', // Centraliza horizontalmente e ajusta a largura ao conteúdo
    backgroundColor: '#996DFF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 1000,
    alignItems: 'center',
    elevation: 5,
    opacity: 0.95,
    zIndex: 9999,
    maxWidth: '90%', // Evita que fique muito largo em telas grandes
  },
  snackBarContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
