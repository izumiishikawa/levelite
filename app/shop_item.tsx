import React, { useCallback } from 'react';
import { View, Image, Pressable, Alert, Vibration } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Text from '~/components/Text';
import { buyShopItem } from '~/services/api';
import { Audio } from 'expo-av';
import { useSnackBar } from '~/contexts/SnackBarContext';
import { InteractionManager } from 'react-native';
import { useCoinsAndStreakStore, usePlayerDataStore } from '~/stores/mainStore';
import { useShallow } from 'zustand/shallow';

const ShopItemPage: React.FC = () => {
  const { id } = usePlayerDataStore(useShallow((state) => ({ id: state.id })));
  const { coins, setCoins } = useCoinsAndStreakStore(
    useShallow((state) => ({
      coins: state.coins,
      setCoins: state.setCoins,
    }))
  );
  const { showSnackBar } = useSnackBar();
  const { itemId, name, description, icon, buyPrice } = useLocalSearchParams();
  const router = useRouter();

  const playSound = useCallback(async () => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(require('../assets/purchase.mp3'));
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (err) {
      console.error('Erro ao tocar som:', err);
    }
  }, []);

  const handleBuyItem = useCallback(() => {
    InteractionManager.runAfterInteractions(async () => {
      try {
        const data = await buyShopItem(id, itemId as string);
        showSnackBar(
          <View className="flex flex-row items-center gap-2">
            <Image
              resizeMethod="resize"
              style={{ width: 25, height: 25 }}
              source={{
                uri: `https://novel-duckling-unlikely.ngrok-free.app/files/${icon}`,
              }}
            />
            <Text className="text-white" black>
              You purchased a {name}!
            </Text>
          </View>
        );

        playSound();
        Vibration.vibrate();

        router.back();
        const value = coins - data.item.buyPrice;

        setCoins(value);
      } catch (error) {
        showSnackBar(
          <View className="flex flex-row items-center gap-2">
            <Image
              resizeMethod="resize"
              style={{ width: 25, height: 25 }}
              source={{
                uri: `https://novel-duckling-unlikely.ngrok-free.app/files/${icon}`,
              }}
            />
            <Text className="text-white" black>
              You don't have enougth coins.
            </Text>
          </View>
        );

        router.back();
      }
    });
  }, [id, itemId, coins, name, icon, playSound, setCoins, showSnackBar, router]);

  return (
    <View className="flex-1 items-center justify-center bg-black/65 p-6">
      <View className="relative w-[90%] items-center rounded-lg bg-[--foreground] p-6 py-10">
        <View
          className="absolute top-20 bg-[--accent] opacity-30"
          style={{ width: 100, height: 100, top: 40, transform: [{ rotate: '45deg' }] }}></View>
        <Image
          resizeMethod="resize"
          source={{ uri: `https://novel-duckling-unlikely.ngrok-free.app/files/${icon}` }}
          style={{ width: 64, height: 64, marginBottom: 45, marginTop: 20 }}
        />
        <Text black className="text-lg text-white">
          {name}
        </Text>
        <Text className="mt-2 text-center text-[#B8B8B8]">{description}</Text>
        <View className="mt-4 flex flex-row items-center rounded-full bg-[--background] px-4 py-1">
          <Text black className=" text-lg text-[#FFD700]">
            {buyPrice} 🪙
          </Text>
        </View>
        <Pressable onPress={handleBuyItem} className="mt-4 w-full rounded-lg bg-[--accent] py-3">
          <Text className="text-center font-bold text-white">Buy</Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          className="mt-2 w-full rounded-lg bg-[--background] py-3">
          <Text className="text-center text-sm text-[#B8B8B8]">Close</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ShopItemPage;
