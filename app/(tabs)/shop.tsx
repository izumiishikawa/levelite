import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Image, View, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import Text from '~/components/Text';
import { AppUserContext } from '~/contexts/AppUserContext';
import { getShopItems, buyShopItem } from '~/services/api';
import { Audio } from 'expo-av';

interface ShopItem {
  _id: string;
  name: string;
  icon: string;
  buyPrice: number;
  description: string;
  rarity: string,
}

const Shop: React.FC = () => {
  const { playerData, setPlayerData } = useContext(AppUserContext);
  const [isGifCompleted, setIsGifCompleted] = useState(false);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const playSound = useCallback(async () => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(require('../../assets/purchase.mp3'));
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (err) {
      console.error('Erro ao tocar som:', err);
    }
  }, []);

  const getBorderColorByRarity = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return '#FFD700';
      case 'epic':
        return '#996DFF';
      case 'rare':
        return '#00BFFF';
      case 'common':
      default:
        return '#B8B8B8';
    }
  };

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

  const openModal = useCallback((item: ShopItem) => {
    setSelectedItem(item);
    setPurchaseSuccess(false);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedItem(null);
    setModalVisible(false);
  }, []);

  const handleBuyItem = useCallback(async () => {
    if (!selectedItem || !playerData) return;

    try {
      await buyShopItem(playerData._id, selectedItem._id);
      playSound();
      setPurchaseSuccess(true);

      setPlayerData((prevData) =>
        prevData
          ? { ...prevData, coins: prevData.coins - selectedItem.buyPrice }
          : prevData
      );
    } catch (error) {
      console.error('Erro ao comprar o item:', error);
    }
  }, [selectedItem, playerData, setPlayerData, playSound]);

  return (
    <ScrollView className="relative flex h-full w-full flex-col bg-[--background] p-4">
      <Image
        source={
          isGifCompleted
            ? require('../../assets/himarishop_static.png')
            : require('../../assets/himarishop.gif')
        }
        className="h-64 w-[95%] self-start justify-self-start"
        resizeMode="contain"
        onLoadEnd={() => {
          if (!isGifCompleted) {
            setTimeout(() => setIsGifCompleted(true), 3000);
          }
        }}
      />

      <View className="mb-40 mt-4 flex flex-row flex-wrap justify-center gap-4">
        {shopItems.map((item) => (
          <TouchableOpacity
            key={item._id}
            className="items-center rounded-lg bg-[--foreground] px-2 py-4"
            style={{
              width: 100,
              justifyContent: 'space-between',
              borderColor:  getBorderColorByRarity(item.rarity),
              borderWidth: 1,
            }}
            onPress={() => openModal(item)}>
            <Image
              source={{
                uri: `https://novel-duckling-unlikely.ngrok-free.app/files/${item.icon}`,
              }}
              style={{ width: 42, height: 42 }}
            />
            <Text className="mt-3 w-full text-center text-xs text-white">{item.name}</Text>
            <Text className="mt-2 text-sm text-[#FFD700]">{item.buyPrice} 🪙</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedItem && (
        <Modal
          visible={modalVisible}
          transparent={true}
          statusBarTranslucent
          animationType="fade"
          onRequestClose={closeModal}>
          <View
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            className="flex-1 items-center justify-center">
            <View className="w-[90%] items-center rounded-lg bg-[--foreground] p-6">
              {purchaseSuccess ? (
                <>
                  <Text className="text-center text-lg text-[#4CAF50]">Purchase Successful!</Text>
                  <Text className="mt-2 text-center text-[#B8B8B8]">
                    You successfully bought {selectedItem.name}.
                  </Text>
                  <Pressable
                    className="mt-4 w-full rounded-md bg-[--accent] px-6 py-3"
                    onPress={closeModal}>
                    <Text className="w-full text-center text-white" black>
                      Close
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Image
                    source={{
                      uri: `https://novel-duckling-unlikely.ngrok-free.app/files/${selectedItem.icon}`,
                    }}
                    style={{ width: 64, height: 64, marginBottom: 10 }}
                  />
                  <Text className="w-[90%] text-center text-lg text-white">
                    {selectedItem.name}
                  </Text>
                  <Text className="mt-2 w-[90%] text-center text-[#B8B8B8]">
                    {selectedItem.description}
                  </Text>
                  <Text className="mt-4 text-lg text-[#FFD700]">
                    Price: {selectedItem.buyPrice} 🪙
                  </Text>
                  <Pressable
                    className="mt-4 w-full rounded-md bg-[--accent] px-6 py-3"
                    onPress={handleBuyItem}>
                    <Text className="w-full text-center text-white" black>
                      Buy
                    </Text>
                  </Pressable>
                  <Pressable className="mt-3 w-full" onPress={closeModal}>
                    <Text className="p-4 text-center text-xs text-[#B8B8B8]">Close</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

export default Shop;
