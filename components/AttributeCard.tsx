import React, { useContext } from 'react';
import { Text, View } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { usePenaltyZoneStore, usePlayerDataStore } from '~/stores/mainStore';

// import { Container } from './styles';

const AttributeCard = ({ icon, isCompleted }: { icon: string; isCompleted: boolean }) => {
  const { id } = usePlayerDataStore(
    useShallow((state) => ({ id: state.id }))
  );
  
  const { inPenaltyZone } = usePenaltyZoneStore(
    useShallow((state) => ({ inPenaltyZone: state.inPenaltyZone }))
  );
  
  return (
    id && (
      <View
        style={{
          borderColor: isCompleted ? '#9ca3af' : inPenaltyZone ? '#cb3d55' : '#996DFF',
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
