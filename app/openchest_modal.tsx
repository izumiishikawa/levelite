import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const OpenChestModal: React.FC = () => {
  const router = useRouter();
  const { xp, items } = useLocalSearchParams();

  return (
    <View className="flex-1 items-center justify-center bg-black/70 p-4">
      <View className="w-4/5 max-w-sm rounded-lg bg-[#2A2A35] p-6">
        <Text className="mb-4 text-xl font-bold text-white">Baú Aberto!</Text>
        <Text className="mb-2 text-base text-white">Você recebeu:</Text>
        <Text className="mb-4 text-lg font-bold text-green-400">{xp} XP</Text>
        <View className="space-y-2">
          {items &&
            JSON.parse(items as string).map((item: any, index: number) => (
              <View key={index} className="flex flex-row items-center space-x-4">
                <Image source={{ uri: item.icon }} className="h-10 w-10 rounded-full bg-gray-800" />
                <Text className="text-white">{item.name}</Text>
              </View>
            ))}
        </View>
        <TouchableOpacity
          className="mt-6 flex items-center justify-center rounded-lg bg-[--accent] px-4 py-2"
          onPress={() => router.back()}>
          <Text className="text-white">Fechar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OpenChestModal;
