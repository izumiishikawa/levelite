import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Image, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Text from '~/components/Text';
import { AppUserContext } from '~/contexts/AppUserContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { AttributeArc } from '~/components/AttributeArc';
import { classes } from '~/utils/classes';
import { consultPlayerInventory } from '~/services/api';
import { useRouter } from 'expo-router';
import {
  useAttributesStore,
  useCoinsAndStreakStore,
  useLevelsAndExpStore,
  usePlayerDataStore,
} from '~/stores/mainStore';
import { useShallow } from 'zustand/shallow';

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
  const { id, selectedClass, username, profileUpdateSignal } = usePlayerDataStore(
    useShallow((state) => ({
      id: state.id,
      selectedClass: state.selectedClass,
      username: state.username,
      profileUpdateSignal: state.profileUpdateSignal,
    }))
  );

  const { streak, coins } = useCoinsAndStreakStore(
    useShallow((state) => ({
      streak: state.streak,
      coins: state.coins,
    }))
  );

  const { aura, focus, vitality } = useAttributesStore(
    useShallow((state) => ({
      aura: state.aura,
      focus: state.focus,
      vitality: state.vitality,
    }))
  );

  const { totalExp, level } = useLevelsAndExpStore(
    useShallow((state) => ({
      totalExp: state.totalExp,
      level: state.level,
    }))
  );

  const [playerInventory, setPlayerInventory] = useState<InventoryItem[]>([]);

  const attributeIcons = {
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

  useEffect(() => {
    if (id) {
      getInventory(id);
    }
  }, [profileUpdateSignal, coins]);

  const currentClass = classes.find((cls) => cls.id === selectedClass);

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

  const router = useRouter();

  return (
    <ScrollView className="h-full w-full bg-[--background]">
      <>
        <View style={styles.bannerContainer}>
          <View style={styles.overlay} />
          <Image
            resizeMethod="resize"
            resizeMode="cover"
            source={require('../../assets/purplebanner.jpg')}
            style={styles.bannerImage}
          />

          <View style={styles.profileContainer}>
            <Image
              resizeMethod="resize"
              source={require('../../assets/pfp.jpg')}
              style={styles.profileImage}
            />
          </View>
        </View>
        <View className="mt-20 flex flex-col items-center gap-1">
          <View className="flex flex-row items-center text-lg text-white">
            <Text className="text-lg text-white" bold>
              {username}{' '}
            </Text>
            <View className="flex flex-row items-center gap-2 rounded-full bg-[--accent] px-2">
              <Icon name="fire-flame-curved" size={16} color="#fff" />
              <Text className="text-lg text-white" black>
                LVL {level}
              </Text>
            </View>
          </View>
          <Text className="italic text-[#B8B8B8]">"The Rizz Monarch"</Text>

          <View className="mt-2 flex flex-row justify-center gap-2">
            {Object.entries({ focus, vitality, aura }).map(([attribute, value]) => (
              <AttributeArc
                key={attribute}
                icon={attributeIcons[attribute as keyof typeof attributeIcons]} // Pega o ícone correspondente
                percentage={value} // Define o valor do atributo como percentage
              />
            ))}
          </View>

          <View className="mt-10 flex w-[90%] flex-row flex-wrap justify-center gap-3">
            <View className="flex w-[45%] flex-col items-start gap-1 rounded-lg bg-[--foreground] px-4 py-2">
              <View className="flex flex-row gap-2">
                <Image
                  resizeMethod="resize"
                  source={require('../../assets/streak.png')}
                  style={{
                    width: 26,
                    height: 26,
                  }}
                />
                <Text black className="text-lg text-[#ff9600]">
                  {streak}
                </Text>
              </View>
              <Text className="text-xs text-[#B8B8B8]">Day Streak</Text>
            </View>

            <View className="flex w-[45%] flex-col items-start gap-1 rounded-lg bg-[--foreground] px-4 py-2">
              <View className="flex flex-row gap-2">
                <Icon name="bolt-lightning" size={24} color="#faaf00" />
                <Text black className="text-lg text-[#faaf00]">
                  {totalExp}
                </Text>
              </View>
              <Text className="text-xs text-[#B8B8B8]">Total EXP</Text>
            </View>
            <View className="flex w-[45%] flex-col items-start gap-1 rounded-lg bg-[--foreground] px-4 py-2">
              <View className="flex flex-row gap-2">
                <Icon name="trophy" size={24} color="#cb3d55" />
                <Text black className="text-lg text-[#cb3d55]">
                  Rank E
                </Text>
              </View>
              <Text className="text-xs text-[#B8B8B8]">Global Rank</Text>
            </View>
            <View className="flex w-[45%] flex-col items-start gap-1 rounded-lg bg-[--foreground] px-4 py-2">
              <View className="flex flex-row gap-1">
                <Image
                  resizeMethod="resize"
                  source={currentClass?.icon}
                  style={{
                    width: 26,
                    height: 26,
                  }}
                />
                <Text black className="text-lg capitalize text-[#996DFF]">
                  {selectedClass}
                </Text>
              </View>
              <Text className="text-xs text-[#B8B8B8]">Player Class</Text>
            </View>

            <Text className="mt-4 italic text-[#B8B8B8]">- Your Inventory -</Text>

            <View className="mb-36 mt-2 flex w-[100%] flex-row flex-wrap justify-center gap-2">
              {Array.from({ length: 30 }).map((_, index) => {
                const inventoryItem = playerInventory[index];
                const itemData = inventoryItem?.itemId;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      itemData &&
                      router.push({
                        pathname: '/profile_item',
                        params: {
                          name: itemData.name,
                          description: itemData.description,
                          icon: itemData.icon,
                          rarity: itemData.rarity,
                          type: itemData.type,
                          effect: itemData.effect,
                          baseValue: itemData.baseValue,
                          playerId: id,
                          itemId: itemData._id,
                          quantity: inventoryItem.quantity,
                        },
                      })
                    }
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
                          resizeMethod="resize"
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
        </View>
      </>
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
