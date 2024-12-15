import React, { useContext } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import Text from '~/components/Text';
import { AppUserContext } from '~/contexts/AppUserContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { AttributeArc } from '~/components/AttributeArc';

type Attributes = {
  focus: number;
  vitality: number;
  aura: number;
};

const Profile: React.FC = () => {
  const { playerData } = useContext(AppUserContext);

  const attributeIcons: { [key in keyof Attributes]: string } = {
    focus: '🧠',
    vitality: '💪',
    aura: '🤝',
  };

  return (
    <View className="h-full w-full bg-[--background]">
      {playerData && (
        <>
          <View style={styles.bannerContainer}>
            {/* Overlay */}
            <View style={styles.overlay} />
            {/* <Image
              resizeMode="cover"
              source={require('../../assets/purplebanner.jpg')}
              style={styles.bannerImage}
            /> */}

            {/* Imagem de Perfil */}
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
            <Text className="italic text-[#B8B8B8]">"𝘛𝘩𝘦 𝘴𝘩𝘢𝘥𝘰𝘸 𝘮𝘰𝘯𝘢𝘳𝘤𝘩"</Text>

            <View className="mt-2 flex flex-row justify-center gap-2">
              {Object.entries(playerData.attributes).map(([attribute, value]) => (
                <AttributeArc
                  key={attribute}
                  icon={attributeIcons[attribute as keyof Attributes]} // Pega o ícone correspondente
                  percentage={value as number} // Define o valor do atributo como percentage
                />
              ))}
            </View>
          </View>
        </>
      )}
    </View>
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
    bottom: -60, // Ajusta a posição vertical para sobrepor o banner
    left: '50%',
    transform: [{ translateX: -62.5 }], // Centraliza horizontalmente (metade da largura da imagem)
    zIndex: 9999, // Garante que fique acima do banner
  },
  profileImage: {
    width: 125,
    height: 125,
    borderRadius: 125 / 2, // Torna a imagem circular
    borderWidth: 4,
  },
});

export default Profile;
