import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  Image,
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import Text from '~/components/Text';
import { AppUserContext } from '~/contexts/AppUserContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { AttributeArc } from '~/components/AttributeArc';
import { classes } from '~/utils/classes';
import { consultPlayerInventory, useInventoryItem } from '~/services/api';

type Attributes = {
  focus: number;
  vitality: number;
  aura: number;
};

type InventoryItem = {
  itemId: {
    _id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    type: string;
    effect: string;
    baseValue: number;
  };
  quantity: number;
};

const Profile: React.FC = () => {
  const { playerData } = useContext(AppUserContext);
  const [playerInventory, setPlayerInventory] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const attributeIcons: { [key in keyof Attributes]: string } = {
    focus: '🧠',
    vitality: '💪',
    aura: '🤝',
  };

  const getInventory = useCallback(async (playerId: string) => {
    try {
      const data = await consultPlayerInventory(playerId);
      setPlayerInventory(data.items || []);
    } catch (error) {
      console.error('Erro ao buscar o inventário:', error);
    }
  }, []);

  const handleUseItem = useCallback(async () => {
    if (!selectedItem || !playerData) return;

    try {
      await useInventoryItem(playerData._id, selectedItem.itemId._id);
      closeModal();
      getInventory(playerData._id);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível usar o item.');
    }
  }, [selectedItem, playerData, getInventory]);

  useEffect(() => {
    if (playerData) {
      getInventory(playerData._id);
    }
  }, [playerData, getInventory]);

  const selectedClass = classes.find((cls) => cls.id === playerData?.selectedClass);

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

  const openModal = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedItem(null);
  }, []);

  return (
    <ScrollView className="h-full w-full bg-[--background]">
      {playerData && (
        <>
          <View style={styles.bannerContainer}>
            <View style={styles.overlay} />
            <Image
              resizeMode="cover"
              source={require('../../assets/purplebanner.jpg')}
              style={styles.bannerImage}
            />

            <View style={styles.profileContainer}>
              <Image source={require('../../assets/pfp.jpg')} style={styles.profileImage} />
            </View>
          </View>
          <View className="mt-20 flex flex-col items-center gap-1">
            <View className="flex flex-row items-center text-lg text-white">
              <Text className="text-lg text-white" bold>
                {playerData?.username}{' '}
              </Text>
              <View className="flex flex-row items-center gap-2 rounded-full bg-[--accent] px-2">
                <Icon name="fire-flame-curved" size={16} color="#fff" />
                <Text className="text-lg text-white" black>
                  LVL {playerData?.level}
                </Text>
              </View>
            </View>
            <Text className="italic text-[#B8B8B8]">"The Rizz Monarch"</Text>

            <View className="mt-2 flex flex-row justify-center gap-2">
              {Object.entries(playerData.attributes).map(([attribute, value]) => (
                <AttributeArc
                  key={attribute}
                  icon={attributeIcons[attribute as keyof Attributes]}
                  percentage={value as number}
                />
              ))}
            </View>

            <View className="mt-10 flex w-[90%] flex-row flex-wrap justify-center gap-3">
              <View className="flex w-[45%] flex-col items-start gap-1 rounded-lg bg-[--foreground] px-4 py-2">
                <View className="flex flex-row gap-2">
                  <Image
                    source={require('../../assets/streak.png')}
                    style={{
                      width: 26,
                      height: 26,
                    }}
                  />
                  <Text black className="text-lg text-[#ff9600]">
                    {playerData && playerData.streak}
                  </Text>
                </View>
                <Text className="text-xs text-[#B8B8B8]">Day Streak</Text>
              </View>

              <View className="flex w-[45%] flex-col items-start gap-1 rounded-lg bg-[--foreground] px-4 py-2">
                <View className="flex flex-row gap-2">
                  <Icon name="bolt-lightning" size={24} color="#faaf00" />
                  <Text black className="text-lg text-[#faaf00]">
                    {playerData && playerData.totalExp}
                  </Text>
                </View>
                <Text className="text-xs text-[#B8B8B8]">Total EXP</Text>
              </View>
              <View className="flex w-[45%] flex-col items-start gap-1 rounded-lg bg-[--foreground] px-4 py-2">
                <View className="flex flex-row gap-2">
                  <Icon name="trophy" size={24} color="#cb3d55" />
                  <Text black className="text-lg text-[#cb3d55]">Rank E</Text>
                </View>
                <Text className="text-xs text-[#B8B8B8]">Global Rank</Text>
              </View>
              <View className="flex w-[45%] flex-col items-start gap-1 rounded-lg bg-[--foreground] px-4 py-2">
                <View className="flex flex-row gap-1">
                  <Image
                    source={selectedClass?.icon}
                    style={{
                      width: 26,
                      height: 26,
                    }}
                  />
                  <Text black className="text-lg capitalize text-[#996DFF]">
                    {playerData && playerData.selectedClass}
                  </Text>
                </View>
                <Text className="text-xs text-[#B8B8B8]">Player Class</Text>
              </View>

              <Text className="mt-4 italic text-[#B8B8B8]">- Your Inventory -</Text>

              <View className="mt-2 mb-36 flex w-[100%] flex-row flex-wrap justify-center gap-2">
                {Array.from({ length: 30 }).map((_, index) => {
                  const inventoryItem = playerInventory[index];
                  const itemData = inventoryItem?.itemId;

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => inventoryItem && openModal(inventoryItem)}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderColor: itemData
                          ? getBorderColorByRarity(itemData.rarity)
                          : 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 2,
                        backgroundColor: '#2A2A35',
                      }}>
                      {itemData ? (
                        <>
                          <Image
                            source={{
                              uri: `https://novel-duckling-unlikely.ngrok-free.app/files/${itemData.icon}`,
                            }}
                            style={{ width: 30, height: 30 }}
                          />
                          <Text black className="absolute right-[5px] top-[3px] text-xs text-white">
                            {inventoryItem.quantity}
                          </Text>
                        </>
                      ) : (
                        <Text className="text-xs text-[#B8B8B8]"> </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {selectedItem && (
              <Modal
                visible={modalVisible}
                statusBarTranslucent
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <Image
                      className="mt-10"
                      source={{
                        uri: `https://novel-duckling-unlikely.ngrok-free.app/files/${selectedItem.itemId.icon}`,
                      }}
                      style={{ width: 80, height: 80, marginBottom: 20 }}
                    />
                    <Text
                      style={{ backgroundColor: getBorderColorByRarity(selectedItem.itemId.rarity) }}
                      black
                      className="text-white px-4 py-1 rounded-full uppercase text-xs absolute right-4 top-4">
                      {selectedItem.itemId.rarity}
                    </Text>
                    <Text black className="text-lg uppercase w-[90%] text-center text-white mb-4">
                      {selectedItem.itemId.name}
                    </Text>
                    <Text className="text-sm w-[90%] text-center text-[#B8B8B8]">
                      {selectedItem.itemId.description}
                    </Text>
                    <Pressable
                      style={styles.modalButton}
                      className="bg-[--accent] mt-10 w-full"
                      onPress={handleUseItem}>
                      <Text className="text-white" black>
                        {selectedItem.itemId.type === 'consumable' ? 'Use' : 'Equip'}
                      </Text>
                    </Pressable>
                    <Pressable className="mt-2 p-4" onPress={closeModal}>
                      <Text className="text-[#B8B8B8]">Close</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    opacity: 0.45,
    zIndex: 1,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  profileContainer: {
    position: 'absolute',
    bottom: -60,
    left: '50%',
    transform: [{ translateX: -62.5 }],
    zIndex: 9999,
  },
  profileImage: {
    width: 125,
    height: 125,
    borderRadius: 125 / 2,
    borderWidth: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    paddingVertical: 40,
    backgroundColor: '#282828',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButton: {
    marginTop: 15,
    padding: 10,
    borderRadius: 4,
    width: '80%',
    alignItems: 'center',
  },
});

export default Profile;
