import React, { useContext } from 'react';
import { Text, View } from 'react-native';
import { AppUserContext } from '~/contexts/AppUserContext';

// import { Container } from './styles';

const AttributeCard = ({ icon, isCompleted }: { icon: string; isCompleted: boolean }) => {
  const { playerData } = useContext(AppUserContext);

  return (
    playerData && (
      <View
      style={{
        borderColor: isCompleted
          ? '#9ca3af'
          : playerData.inPenaltyZone
          ? '#cb3d55'
          : '#996DFF',
        backgroundColor: 'var(--foreground)',
        height: 56,
        width: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
      }}>
        <Text className="text-lg">{icon}</Text>
      </View>
    )
  );
};

export default AttributeCard;
