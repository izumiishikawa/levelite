import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import Text from '~/components/Text';
import { fetchFriendsRanking, fetchGlobalRanking } from '~/services/api';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { router } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';

const Rank: React.FC = () => {
  const [isGlobal, setIsGlobal] = useState(true); // Controle do ranking ativo
  const [rankingData, setRankingData] = useState<any[]>([]); // Dados do ranking
  const [loading, setLoading] = useState(false); // Indicador de carregamento
  const [page, setPage] = useState(1); // Página atual para paginação
  const [hasMore, setHasMore] = useState(true); // Controle de mais dados para carregar
  const limit = 10; // Número de itens por página

  // Função para carregar dados de ranking
  const loadRanking = useCallback(
    async (reset: boolean = false) => {
      if (loading) return; // Evita múltiplas requisições

      setLoading(true);
      try {
        const data = isGlobal
          ? await fetchGlobalRanking(reset ? 1 : page, limit)
          : await fetchFriendsRanking(reset ? 1 : page, limit);

        if (reset) {
          setRankingData(data.ranking); // Reinicia os dados
          setPage(1); // Reseta a página
        } else {
          setRankingData((prev) => [...prev, ...data.ranking]); // Adiciona novos dados
        }

        setHasMore(data.ranking.length === limit); // Atualiza o controle de mais dados
      } catch (error) {
        console.error('Erro ao carregar ranking:', error.message);
      } finally {
        setLoading(false);
      }
    },
    [isGlobal, page, limit, loading]
  );

  // Recarrega o ranking ao alternar entre global e amigos
  useEffect(() => {
    loadRanking(true); // Reseta os dados e recarrega
  }, [isGlobal]);

  // Carrega mais dados ao mudar a página
  useEffect(() => {
    if (page > 1) loadRanking();
  }, [page]);

  const getStyles = (index: number): { background: string; font: string; border: string } => {
    switch (index) {
      case 1: // Primeiro lugar
        return {
          background: '#fcd84a',
          font: '#f39d3a',
          border: '#f39d3a',
        };
      case 2: // Segundo lugar
        return {
          background: '#c2cfdd',
          font: '#8a98a5',
          border: '#8a98a5',
        };
      case 3: // Terceiro lugar
        return {
          background: '#dcb08b',
          font: '#b67e33',
          border: '#b67e33',
        };
      default: // Outros
        return {
          background: 'transparent',
          font: '#fff',
          border: 'transparent',
        };
    }
  };

  // Renderiza um item do ranking
  const renderItem = ({ item, index }: any) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/player_profile',
          params: { friendId: item.friendId },
        })
      }
      className="relative mb-4 flex flex-row items-center gap-2 border-b-4 border-b-[--accent] bg-[--foreground]"
      style={{
        padding: 10,
        paddingLeft: 20,
        borderBottomWidth: 4,
      }}>
      <View className="absolute right-[-25px] top-[-10px] h-32 w-8 -rotate-6 bg-[--background]"></View>
      <View className="absolute left-[-25px] top-[-10px] h-32 w-8 -rotate-6 bg-[--background]"></View>
      <View style={{ alignItems: 'center' }}>
        {/* Círculo */}
        <View
          style={{
            backgroundColor: getStyles(index + 1).background, // Cor de fundo
            borderColor: getStyles(index + 1).border, // Cor da borda
            borderWidth: 3, // Largura da borda
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-center">
          <Text className="text-lg" black style={{ color: getStyles(index + 1).font }}>
            {index + 1}
          </Text>
        </View>

        {/* Triângulo */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 16,
            borderRightWidth: 16,
            borderBottomWidth: 16,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: getStyles(index + 1).border, // Cor da borda
            marginTop: -10, // Ajusta a posição do triângulo
            zIndex: -1,
          }}
        />
      </View>

      <Image
        className="h-12 w-12 rounded-full"
        resizeMethod="resize"
        source={{
          uri: `https://delicate-prawn-verbally.ngrok-free.app/files/${item.icon}`,
        }}
      />

      <View className="absolute right-6 top-2 flex flex-row items-center gap-2 rounded-full bg-[--accent] px-2">
        <Icon name="fire-flame-curved" size={16} color="#fff" />
        <Text className="text-xs text-white" black>
          LVL {item.level}
        </Text>
      </View>

      <View className="flex flex-col items-start gap-0">
        <View className="flex w-full flex-row items-center">
          <Text className="text-lg text-white" bold>
            {item.username}
          </Text>
        </View>
        <View className="flex flex-row items-center gap-2">
          <View className="flex flex-row items-center gap-2 rounded-full">
            <Icon name="bolt-lightning" size={12} color="#faaf00" />
            <Text className="text-sm text-white" black>
              {item.totalExp}{' '}
              <Text className="text-[#faaf00]" black>
                EXP
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20; // Distância até o final para ativar o carregamento
    return (
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
    );
  };
  

  return (
    <ScrollView
    contentContainerStyle={{ flexGrow: 1 }}
    className='h-full w-full bg-[--background] p-4'
    onScroll={({ nativeEvent }) => {
      if (isCloseToBottom(nativeEvent) && !loading && hasMore) {
        setPage((prev) => prev + 1);
      }
    }}
    scrollEventThrottle={400}>
    <View className="h-full w-full bg-[--background] pb-40">
      {/* Switch para alternar entre Global e Amigos */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 }}>
        <TouchableOpacity
          onPress={() => setIsGlobal(true)}
          className="rounded-l-full px-4 py-1"
          style={{
            backgroundColor: isGlobal ? '#996DFF' : '#2A2A35',
          }}>
          <Text style={{ color: isGlobal ? '#fff' : '#B8B8B8', fontSize: 14 }} bold>
            🌍 Global
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsGlobal(false)}
          className="rounded-r-full px-4 py-1"
          style={{
            backgroundColor: !isGlobal ? '#996DFF' : '#2A2A35',
          }}>
          <Text style={{ color: !isGlobal ? '#fff' : '#B8B8B8', fontSize: 14 }} bold>
            👥 Friends
          </Text>
        </TouchableOpacity>
      </View>
  
      {/* Exibição do ranking */}
      <View className='flex flex-col '>
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#2196F3" />
      ) : rankingData && rankingData.length > 0 ? (
        rankingData.map((item, index) => (
          <View
            key={`${item.id}-${index}`}
            >
            {renderItem({ item, index })}
          </View>
        ))
      ) : (
        <Text style={{ textAlign: 'center', color: '#555' }}>Nenhum dado encontrado.</Text>
      )}
      </View>
   
  
      {/* Loading adicional ao atingir o final */}
      {loading && page > 1 && <ActivityIndicator size="small" color="#2196F3" />}
    </View>
  </ScrollView>
  
  );
};

export default Rank;
