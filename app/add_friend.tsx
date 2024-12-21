import React, { useState, useEffect } from 'react';
import { TextInput, View, FlatList, TouchableOpacity } from 'react-native';
import Text from '~/components/Text';
import Title from '~/components/Title';
import { searchUsers, sendFriendRequest, cancelFriendRequest } from '~/services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconAwesome from 'react-native-vector-icons/FontAwesome6';
import { Image } from 'react-native';
import LottieView from 'lottie-react-native';

interface User {
  icon: string;
  username: string;
  level: number;
  friendId: string;
  requestSent: boolean; // Indica se a solicitação já foi enviada
  hasPendingRequest: boolean;
}

const AddFriend: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Atualizar o debounce após 1 segundo de inatividade
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (debouncedQuery.trim() !== '') {
        try {
          setIsLoading(true);
          const users = await searchUsers(debouncedQuery); // Chama a função `searchUsers`
          console.log(users);
          setIsLoading(false);
          // Adiciona o campo `requestSent` com base em `hasPendingRequest` do backend
          setUsers(users.map((user: User) => ({ ...user, requestSent: user.hasPendingRequest })));
        } catch (error) {
          console.error('Erro ao buscar usuários:', error);
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    };

    fetchUsers();
  }, [debouncedQuery]);

  // Lidar com o clique no botão de adicionar/cancelar
  const handleFriendRequest = async (friendId: string, isRequestSent: boolean) => {
    try {
      if (isRequestSent) {
        // Cancelar pedido de amizade
        await cancelFriendRequest(friendId);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.friendId === friendId ? { ...user, requestSent: false } : user
          )
        );
      } else {
        // Enviar pedido de amizade
        await sendFriendRequest(friendId);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.friendId === friendId ? { ...user, requestSent: true } : user
          )
        );
      }
    } catch (error) {
      console.error('Erro ao processar solicitação de amizade:', error);
    }
  };

  return (
    <View className="h-full w-full bg-[--background]">
      <View className="mx-auto mt-20 w-[80%]">
        <Title text="Add a friend" />
      </View>

      <View className="relative mt-10 w-full">
        <TextInput
          placeholder="Search for a friend..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            backgroundColor: '#2A2A35',
            color: 'white',
            width: '100%',
            padding: 12,
            paddingLeft: 45,
            borderRadius: 8,
            marginBottom: 12,
          }}
        />
        <View className="absolute bottom-[-6px] right-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
        <View className="absolute bottom-[-6px] left-[-12px] h-20 w-10 rotate-[15deg] bg-[--background]" />
      </View>

      {isLoading && (
        <View className="mt-20 flex w-full flex-col items-center">
          <Text className="mb-5 text-white" bold>
            Searching users..
          </Text>
          <LottieView
            source={require('../assets/loading4.json')} // Substitua pelo arquivo JSON da animação
            autoPlay
            loop
            style={{ width: 100, height: 100 }}
          />
        </View>
      )}

      <FlatList
        data={users}
        keyExtractor={(item) => item.friendId}
        renderItem={({ item }) => (
          <View
            className="mx-auto flex w-[90%] flex-row items-center justify-between"
            style={{
              padding: 12,
              backgroundColor: '#2A2A35',
              marginVertical: 6,
              borderRadius: 8,
            }}>
            <View className="flex flex-row items-center gap-2">
              <Image
                className="h-12 w-12 rounded-full"
                resizeMethod="resize"
                source={{
                  uri: `https://delicate-prawn-verbally.ngrok-free.app/files/${item.icon}`,
                }}
              />
              <View className="flex flex-col">
                <Text style={{ color: 'white', fontSize: 16 }} bold>
                  {item.username}{' '}
                </Text>
                <View
                  className="flex flex-row items-center gap-2 rounded-full bg-[--accent] px-2"
                  style={{ alignSelf: 'flex-start', flexShrink: 1 }}>
                  <IconAwesome name="fire-flame-curved" size={12} color="#fff" />
                  <Text className="text-white" bold>
                    LVL {item.level}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              className="rounded-full bg-[--accent] px-2 py-2"
              onPress={() => handleFriendRequest(item.friendId, item.requestSent)}>
              <Icon
                name={item.requestSent ? 'person-remove' : 'person-add'}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default AddFriend;
