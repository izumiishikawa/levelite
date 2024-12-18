import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Image, View, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import Text from '~/components/Text';
import { AppUserContext } from '~/contexts/AppUserContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { AttributeArc } from '~/components/AttributeArc';
import { classes } from '~/utils/classes';
import {
  acceptFriendRequest,
  consultPlayerInventory,
  getFriendList,
  updateProfilePicture,
} from '~/services/api';
import { useRouter } from 'expo-router';
import {
  useAttributesStore,
  useCoinsAndStreakStore,
  useFriendshipStore,
  useLevelsAndExpStore,
  usePlayerDataStore,
} from '~/stores/mainStore';
import { useShallow } from 'zustand/shallow';
import * as ImagePicker from 'expo-image-picker';
import Title from '~/components/Title';

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
  const { id, icon, setIcon, selectedClass, username, profileUpdateSignal } = usePlayerDataStore(
    useShallow((state) => ({
      id: state.id,
      icon: state.icon,
      setIcon: state.setIcon,
      selectedClass: state.selectedClass,
      username: state.username,
      profileUpdateSignal: state.profileUpdateSignal,
    }))
  );

  const { friendRequests, friends, setFriends, setFriendsRequests } = useFriendshipStore(
    useShallow((state) => ({
      friendRequests: state.friendRequests,
      friends: state.friends,
      setFriends: state.setFriends,
      setFriendsRequests: state.setFriendRequests,
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

  const [profileImage, setProfileImage] = useState(require('../../assets/pfp.jpg')); // Imagem padrão
  const [modalVisible, setModalVisible] = useState(false); // Estado do modal

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
  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Permissão para acessar a galeria é necessária.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const fileUri = result.assets[0].uri;

      try {
        const result = await updateProfilePicture(id, fileUri); // Chama a função para atualizar no backend
        setIcon(result);
        setProfileImage({ uri: fileUri }); // Atualiza o estado da imagem
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil.');
      }
    }

    setModalVisible(false);
  };

  const takePhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Permissão para acessar a câmera é necessária.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const fileUri = result.assets[0].uri;

      try {
        const result = await updateProfilePicture(id, fileUri); // Chama a função para atualizar no backend
        setIcon(result);
        setProfileImage({ uri: fileUri }); // Atualiza o estado da imagem
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil.');
      }
    }

    setModalVisible(false);
  };

  useEffect(() => {
    const getList = async () => {
      const list = await getFriendList();
      setFriends(list.friends);
    };

    getList();
  }, [friendRequests]);

  const removeProfileImage = () => {
    setProfileImage(require('../../assets/pfp.jpg')); // Reseta para a imagem padrão
    setModalVisible(false);
  };

  const handleAcceptFriendRequest = async (friendId: string) => {
    try {
      const response = await acceptFriendRequest(friendId);

      // Atualizar a lista de amigos e solicitações no estado
      const updated = friendRequests.filter((request) => request.from !== friendId);

      setFriendsRequests(updated);
    } catch (error) {
      console.error('Erro ao aceitar solicitação de amizade:', error);
    }
  };

  return (
    <ScrollView className="h-full w-full bg-[--background]">
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View className="flex w-[90%] flex-col rounded-lg bg-[--background] p-6">
            <Title text="Change profile picture" />
            <View className="mt-10 flex flex-row justify-between">
              <TouchableOpacity
                className="flex flex-col items-center justify-center gap-2 rounded-lg bg-[--foreground] p-4 px-6"
                onPress={takePhotoWithCamera}>
                <Icon name="camera" size={30} color="#fff" />
                <Text style={{ color: 'white' }}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-col items-center justify-center gap-2 rounded-lg bg-[--foreground] p-4 px-6"
                onPress={pickImageFromGallery}>
                <Icon name="image" size={30} color="#fff" />
                <Text style={{ color: 'white' }}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-col items-center justify-center gap-2 rounded-lg bg-[--foreground] p-4 px-6"
                onPress={removeProfileImage}>
                <Icon name="trash" size={30} color="#fff" />
                <Text style={{ color: 'white' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image
                resizeMethod="resize"
                source={{
                  uri: `https://novel-duckling-unlikely.ngrok-free.app/files/${icon}`,
                }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
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

          <View className=" flex w-[90%] flex-row flex-wrap justify-center gap-3">
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/add_friend',
                })
              }
              className="mt-5 flex w-[90%] flex-row items-center justify-center rounded-lg bg-[--foreground] p-3">
              <Text black className="text-white">
                + Add friend
              </Text>
            </TouchableOpacity>

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

            <View className="mb-10 mt-2 flex w-[100%] flex-row flex-wrap justify-center gap-2">
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

            <View className="flex w-full flex-col items-center">
              <Text className="mx-auto mb-4 mt-4 italic text-[#B8B8B8]">- Your friends -</Text>
              <View className="flex w-full flex-row flex-wrap gap-2">
                {(friends || []).map((friend) => {
                  return (
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: '/player_profile',
                          params: { friendId: friend.friendId },
                        })
                      }
                      key={friend.friendId} // Certifique-se de que cada usuário tenha um ID único
                      className="flex h-fit flex-col items-center gap-2 rounded-lg bg-[--foreground] px-4 py-6">
                      <Image
                        className="h-12 w-12 rounded-full border-2 border-[--accent]"
                        resizeMethod="resize"
                        source={{
                          uri: `https://novel-duckling-unlikely.ngrok-free.app/files/${friend.icon}`,
                        }}
                      />
                      <View className="flex flex-col gap-1">
                        <Text className="text-center" style={{ color: 'white', fontSize: 16 }} bold>
                          {friend.username}
                        </Text>
                        <View
                          className="flex flex-row items-center gap-2 rounded-full bg-[--accent] px-2"
                          style={{ alignSelf: 'flex-start', flexShrink: 1 }}
                        />
                        <View
                          className="flex flex-row items-center gap-2 rounded-full bg-[--accent] px-2 text-center"
                          style={{ alignSelf: 'flex-start', flexShrink: 1 }}>
                          <Icon name="fire-flame-curved" size={12} color="#fff" />
                          <Text className="text-white" bold>
                            LVL {friend.level}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="mb-80 flex w-full flex-col items-center">
              <Text className="mb-10 mt-4 italic text-[#B8B8B8]">- Your friend requests -</Text>
              {(friendRequests || []).map((user) => {
                return (
                  <View
                    key={user.from} // Certifique-se de que cada usuário tenha um ID único
                    className="flex w-full flex-row items-center gap-2 rounded-lg bg-[--foreground] p-2">
                    <Image
                      className="h-12 w-12 rounded-full"
                      resizeMethod="resize"
                      source={{
                        uri: `https://novel-duckling-unlikely.ngrok-free.app/files/${user.icon}`,
                      }}
                    />
                    <View className="flex flex-1 flex-col">
                      <Text style={{ color: 'white', fontSize: 16 }} bold>
                        {user.name}
                      </Text>
                      <View
                        className="flex flex-row items-center gap-2 rounded-full bg-[--accent] px-2"
                        style={{ alignSelf: 'flex-start', flexShrink: 1 }}
                      />
                    </View>
                    <View>
                      <TouchableOpacity
                        className="rounded-lg bg-[--accent] px-4 py-2"
                        onPress={() => handleAcceptFriendRequest(user.from)} // Substitua por sua função
                      >
                        <Text className="text-sm text-white" bold>
                          Accept
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
