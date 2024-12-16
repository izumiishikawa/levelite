import React, { useEffect } from 'react';
import { Text, View, TextProps } from 'react-native';
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
        {numberstoNice.map((num, idx) => {
          return (
            <Tick
              style={{
                fontSize,
                fontVariant: ['tabular-nums'],
                fontWeight: '900',
                lineHeight: fontSize * 1.1, // Garantindo alinhamento perfeito
                color: textColor, // Adicionando cor ao texto
              }}
              key={`number-${num}-${idx}`}
            >
              {num}
            </Tick>
          );
        })}
      </MotiView>
    </View>
  );
}

const AnimatedRollingNumbers = ({ value = 12547, fontSize = 50, textColor = '#000', className = '' }: { value?: number; fontSize?: number; textColor?: string; className?: string }) => {
  const splitedValue = value.toString().split('');

  return (
    <View>
      <View className={`flex flex-row items-center flex-wrap`}>
        {splitedValue.map((number, index) => {
          return (
            <TickerList
              number={parseInt(number)}
              fontSize={fontSize}
              index={index}
              textColor={textColor}
              className={className}
              key={index}
            />
          );
        })}
      </View>
    </View>
  );
};

export default AnimatedRollingNumbers;
