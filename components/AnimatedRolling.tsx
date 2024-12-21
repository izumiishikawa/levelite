import React from 'react';
import { Text, View, TextProps, Platform, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import clsx from 'clsx';

type TickerListProps = {
  number: number;
  fontSize: number;
  index: number;
  textColor: string;
  className?: string;
};

const numberstoNice = [...Array(10).keys()];
const _stagger = 50;

// Detectar telas pequenas e grandes
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360;
const isLargeAndroidScreen = Platform.OS === 'android' && width > 400;

const getLineHeight = (fontSize: number) => {
  if (Platform.OS === 'ios' || isLargeAndroidScreen) {
    return fontSize * 1.1;
  }
  return fontSize;
};

// Função para centralizar estilos
const getTextStyle = (fontSize: number, textColor: string) => ({
  fontSize,
  fontVariant: ['tabular-nums'],
  fontWeight: '900',
  lineHeight: getLineHeight(fontSize),
  color: textColor,
  textAlignVertical: 'center',
});

function Tick({ children, style, ...rest }: TextProps) {
  return <Text style={style} {...rest}>{children}</Text>;
}

function TickerList({ number, fontSize, index, textColor, className }: TickerListProps) {
  return (
    <View style={{ height: fontSize, overflow: 'hidden' }} className={clsx(className)}>
      <MotiView
        animate={{
          translateY: -fontSize * number,
        }}
        transition={{
          delay: index * _stagger,
          damping: 80,
          stiffness: 200,
        }}
      >
        {numberstoNice.map((num, idx) => (
          <Tick
            style={getTextStyle(fontSize, textColor)}
            key={`number-${num}-${idx}`}
          >
            {num}
          </Tick>
        ))}
      </MotiView>
    </View>
  );
}

const AnimatedRollingNumbers = ({ value = 12547, fontSize = 50, textColor = '#000', className = '' }: { value?: number; fontSize?: number; textColor?: string; className?: string }) => {
  const splitedValue = value.toString().split('');

  return (
    <View>
      <View className={`flex flex-row items-center flex-wrap`}>
        {splitedValue.map((number, index) => (
          <TickerList
            number={parseInt(number)}
            fontSize={fontSize}
            index={index}
            textColor={textColor}
            className={className}
            key={index}
          />
        ))}
      </View>
    </View>
  );
};

export default AnimatedRollingNumbers;
