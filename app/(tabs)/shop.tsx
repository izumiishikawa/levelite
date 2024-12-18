import React, { useState, useEffect, useCallback } from 'react';
import { Image, View, ScrollView, TouchableOpacity } from 'react-native';
import Text from '~/components/Text';
import { getShopItems } from '~/services/api';
import { useRouter } from 'expo-router';

interface ShopItem {
  _id: string;
  name: string;
  icon: string;
  buyPrice: number;
  description: string;
  rarity: string;
}
const Shop: React.FC = () => {
  const [isGifCompleted, setIsGifCompleted] = useState(false);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const router = useRouter();

  const fetchShopItems = useCallback(async () => {
    try {
      const items = await getShopItems();
      setShopItems(items);
    } catch (error) {
      console.error('Erro ao buscar itens da loja:', error);
    }
  }, []);

  useEffect(() => {
    fetchShopItems();
  }, [fetchShopItems]);

  const getBorderColorByRarity = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return '#FFD700';
      case 'epic':
        return '#996DFF';
      case 'rare':
        return '#00BFFF';
      default:
        return '#B8B8B8';
    }
  };

  return (
    <ScrollView className="relative flex h-full w-full flex-col bg-[--background] p-4">
      <Image
        resizeMethod="resize"
        source={
          isGifCompleted
            ? require('../../assets/himarishop_static.png')
            : require('../../assets/himarishop.gif')
        }
        className="h-64 w-[95%] self-start justify-self-start"
        resizeMode="contain"
        onLoadEnd={() => {
          if (!isGifCompleted) setTimeout(() => setIsGifCompleted(true), 3000);
        }}
      />

      <View className="mb-40 mt-4 flex w-full flex-row flex-wrap justify-center gap-2">
        {shopItems.map((item) => (
          <TouchableOpacity
            key={item._id}
            className="flex w-full flex-col items-center justify-between rounded-lg bg-[--foreground] px-4 py-4"
            style={{
              maxWidth: '45%',
              borderColor: getBorderColorByRarity(item.rarity),
              borderWidth: 2,
            }}
            onPress={() =>
              router.push({
                pathname: '/shop_item',
                params: {
                  itemId: item._id,
                  name: item.name,
                  description: item.description,
                  icon: item.icon,
                  buyPrice: item.buyPrice,
                },
              })
            }>
            <View className="flex w-[95%] flex-col items-center">
              <Image
                resizeMethod="resize"
                source={{
                  uri: `https://novel-duckling-unlikely.ngrok-free.app/files/${item.icon}`,
                }}
                style={{ width: 42, height: 42 }}
              />
              <Text bold className="mt-2 w-full text-center text-sm text-white">
                {item.name}
              </Text>
            </View>

            <View className="mt-4 flex flex-row items-center rounded-full bg-[--background] px-4 py-1">
              <Text className="text-sm text-[#FFD700]">{item.buyPrice} 🪙</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default Shop;
