// pages/item-details.tsx
import React, { useCallback, useContext } from 'react';
import { View, Image, StyleSheet, Pressable, Alert } from 'react-native';
import Text from '~/components/Text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInventoryItem } from '~/services/api';
import { AppUserContext } from '~/contexts/AppUserContext';
import { useSnackBar } from '~/contexts/SnackBarContext';
import { useShallow } from 'zustand/react/shallow';
import {
  useHealthAndManaStore,
  useLevelsAndExpStore,
  usePlayerDataStore,
} from '~/stores/mainStore';

const ItemDetails: React.FC = () => {
  const router = useRouter();
  const { showSnackBar } = useSnackBar();
  const { setProfileUpdateSignal } = usePlayerDataStore(
    useShallow((state) => ({ setProfileUpdateSignal: state.setProfileUpdateSignal }))
  );
  
  const { setHealth, setMana, setMaxHealth, setMaxMana } = useHealthAndManaStore(
    useShallow((state) => ({
      setHealth: state.setHealth,
      setMana: state.setMana,
      setMaxHealth: state.setMaxHealth,
      setMaxMana: state.setMaxMana,
    }))
  );
  
  const { setCurrentXP, setLevel, setTotalExp, setXpForNextLevel } = useLevelsAndExpStore(
    useShallow((state) => ({
      setCurrentXP: state.setCurrentXP,
      setLevel: state.setLevel,
      setTotalExp: state.setTotalExp,
      setXpForNextLevel: state.setXpForNextLevel,
    }))
  );
  
  const { name, description, icon, rarity, type, effect, baseValue, playerId, itemId, quantity } =
    useLocalSearchParams();

    const handleUseItem = useCallback(async () => {
      try {
        // Exibe o snackbar
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
              You used a {name}!
            </Text>
          </View>
        );
    
        // Retorna à página anterior
        router.back();
    
        // Faz a chamada da API para usar o item
        const result = await useInventoryItem(playerId as string, itemId as string);
        console.log(effect)
    
        // Atualiza o estado com base no efeito do item
        switch (effect) {
          case 'mana_recover':
            setMana(result.mana);
            break;
          case 'healing':
            setHealth(result.health);
            break;
          case 'increase_max_mana':
            setMaxMana(result.maxMana);
            break;
          case 'max_health_increase':
            setMaxHealth(result.maxHealth);
            break;
          case 'exp_boost':
            setCurrentXP(result.currentXP);
            setTotalExp(result.totalExp);
            break;
          case "level_up":
            setLevel(result.level)
            setXpForNextLevel(result.xpForNextLevel);
          default:
            console.warn(`Unknown effect: ${result.effect}`);
            break;
        }
    
        // Opcional: sinaliza uma atualização no perfil
        setProfileUpdateSignal(Math.random());
      } catch (error) {
        Alert.alert('Error', 'Failed to use the item.');
      }
    }, [playerId, itemId, name, router, showSnackBar, icon]);
    
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

  return (
    <View className="flex h-full w-full flex-col items-center justify-center bg-black/50">
      <View className="relative w-[90%]  rounded-lg bg-[--foreground] p-6 py-10">
        <View className="mx-auto flex w-[90%] flex-col items-center">
          <View
            className="absolute top-20 bg-[--accent] opacity-30"
            style={{ width: 100, height: 100, top: 0, transform: [{ rotate: '45deg' }] }}></View>
          <Image
            resizeMethod="resize"
            className="mt-10"
            source={{
              uri: `https://novel-duckling-unlikely.ngrok-free.app/files/${icon}`,
            }}
            style={{ width: 64, height: 64, marginBottom: 45, marginTop: 20 }}
          />
          <Text
            style={{ backgroundColor: getBorderColorByRarity(rarity as string) }}
            black
            className="absolute -right-4 -top-4 rounded-full px-4 py-1 text-xs uppercase text-white">
            {rarity}
          </Text>
          <Text black className="mb-4 mt-5 w-[90%] text-center text-lg uppercase text-white">
            {name}
          </Text>
          <Text className="mb-4 w-[90%] text-center text-sm text-[#B8B8B8]">{description}</Text>
          <Pressable className="mt-4 w-full rounded-lg bg-[--accent] py-3" onPress={handleUseItem}>
            <Text className="text-center text-white" black>
              {type === 'consumable' ? 'Use' : 'Equip'}
            </Text>
          </Pressable>
          <Pressable
            className="mt-2 w-full rounded-lg bg-[--background] py-3"
            onPress={() => router.back()}>
            <Text className="text-center text-[#B8B8B8]">Close</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default ItemDetails;
