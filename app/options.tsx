import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useShallow } from 'zustand/shallow';
import Text from '~/components/Text';
import Title from '~/components/Title';
import { useAuthStore } from '~/stores/mainStore';

// import { Container } from './styles';

const Options: React.FC = () => {
  const { isLogged, setIsLogged } = useAuthStore(
    useShallow((state) => ({ isLogged: state.isLogged, setIsLogged: state.setIsLogged }))
  );

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setIsLogged(false);
    router.push({ pathname: '/' });
  };

  return (
    <View className="h-full w-full bg-[--background] pt-20">
      <View className="mx-auto w-[80%]">
        <Title text="Settings" />
      </View>
      <View className="mx-auto mt-20 flex w-[90%] flex-col items-center">
        <TouchableOpacity
          onPress={() => logout()}
          className="w-full rounded-lg bg-[--foreground] px-4 py-4">
          <Text className="text-center text-white">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Options;
