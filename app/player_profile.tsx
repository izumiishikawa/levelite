import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { AttributeArc } from '~/components/AttributeArc';
import Text from '~/components/Text';
import { getPlayersProfile } from '~/services/api';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { classes } from '~/utils/classes';

const PlayerProfile: React.FC = () => {
  const { friendId } = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar os dados do perfil do jogador
  const fetchUserData = useCallback(async () => {
    if (!friendId) return;

    try {
      const data = await getPlayersProfile(friendId as string);
      setUser(data.user);
    } catch (error) {
      console.error('Erro ao buscar perfil do jogador:', error);
    } finally {
    }
  }, [friendId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const attributeIcons = {
    focus: '🧠',
    vitality: '💪',
    aura: '🤝',
  };

  const currentClass = user ? classes.find((cls) => cls.id === user.selectedClass) : null;

  if (!user) {
    return (
      <View className='w-full h-full bg-[--background]' style={styles.centeredContainer}>
        <Text style={styles.errorMessage}>Usuário não encontrado.</Text>
      </View>
    );
  }

  return (
    <View className='bg-[--background] w-full h-full'>
      {/* Banner Section */}
      <View style={styles.bannerContainer}>
        <View style={styles.overlay} />
        <Image
          resizeMethod="resize"
          resizeMode="cover"
          source={require('../assets/purplebanner.jpg')}
          style={styles.bannerImage}
        />

        <View style={styles.profileContainer}>
          <Image
            resizeMethod="resize"
            source={{
              uri: `https://novel-duckling-unlikely.ngrok-free.app/files/${user.icon}`,
            }}
            style={styles.profileImage}
          />
        </View>
      </View>

      {/* Player Info Section */}
      <View style={styles.infoContainer}>
        <View style={styles.usernameContainer}>
          <Text style={styles.username} bold>
            {user.username}
          </Text>
          <View style={styles.levelContainer} className='bg-[--accent]'>
            <Icon name="fire-flame-curved" size={16} color="#fff" />
            <Text style={styles.levelText} black>
              LVL {user.level}
            </Text>
          </View>
        </View>
        <Text style={styles.quote} italic>
          "The Rizz Monarch"
        </Text>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <StatCard
            icon={<Image source={require('../assets/streak.png')} style={styles.statIcon} />}
            value={user.streak}
            label="Day Streak"
            color="#ff9600"
          />
          <StatCard
            icon={<Icon name="bolt-lightning" size={24} color="#faaf00" />}
            value={user.totalExp}
            label="Total EXP"
            color="#faaf00"
          />
          <StatCard
            icon={<Icon name="trophy" size={24} color="#cb3d55" />}
            value="Rank E"
            label="Global Rank"
            color="#cb3d55"
          />
          <StatCard
            icon={
              <Image
                source={currentClass?.icon}
                style={styles.statIcon}
              />
            }
            value={user.selectedClass}
            label="Player Class"
            color="#996DFF"
          />
        </View>
      </View>
    </View>
  );
};

// Componente para exibir estatísticas individuais
const StatCard: React.FC<{ icon: JSX.Element; value: string | number; label: string; color: string }> = ({
  icon,
  value,
  label,
  color,
}) => {
  return (
    <View style={styles.statCard} className='bg-[--foreground]'>
      <View style={styles.statRow}>
        {icon}
        <Text className='capitalize' style={[styles.statValue, { color }]} black>
          {value}
        </Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'var(--background)',
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    color: 'white',
    fontSize: 18,
  },
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
    zIndex: 2,
  },
  profileImage: {
    width: 125,
    height: 125,
    borderRadius: 62.5,
    borderWidth: 4,
  },
  infoContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 20,
    color: 'white',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  levelText: {
    color: 'white',
    marginLeft: 5,
  },
  quote: {
    color: '#B8B8B8',
    marginTop: 5,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    width: '90%',
  },
  statCard: {
    width: '45%',
    borderRadius: 8,
    padding: 12,
    margin: 5,
    alignItems: 'flex-start',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  statValue: {
    fontSize: 18,
    marginLeft: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#B8B8B8',
  },
});

export default PlayerProfile;
