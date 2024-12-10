import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

import { cn } from '~/lib/cn';

const DEFAULT_MAX = 100;

const ProgressIndicator = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View> & {
    value?: number;
    max?: number;
    barColor?: string; // Nova prop para a cor da barra
    getValueLabel?: (value: number, max: number) => string;
  }
>(
  (
    {
      value: valueProp,
      max: maxProp,
      barColor = '--accent', // Cor padrão
      getValueLabel = defaultGetValueLabel,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Usa `maxProp` se disponível, ou `DEFAULT_MAX`
    const max = maxProp ?? DEFAULT_MAX;
    // Verifica se `valueProp` é válido, ou define como 0
    const value = isValidValueNumber(valueProp, max) ? valueProp : 0;

    // Calcula o progresso como uma porcentagem de `max`
    const progress = useDerivedValue(() => (value / max) * 100);

    const indicator = useAnimatedStyle(() => {
      return {
        width: withSpring(`${progress.value}%`, { overshootClamping: true }),
      };
    });

    return (
      <View
        role="progressbar"
        ref={ref}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={value}
        aria-valuetext={getValueLabel(value, max)}
        accessibilityValue={{
          min: 0,
          max,
          now: value,
          text: getValueLabel(value, max),
        }}
        className={cn('relative h-[10px] w-full overflow-hidden', className)}
        {...props}
      >
        <View className="absolute bottom-0 left-0 right-0 top-0 bg-muted opacity-20" />
        <Animated.View
          role="presentation"
          className={cn('h-full')}
          style={[indicator, { backgroundColor: barColor.startsWith('--') ? `var(${barColor})` : barColor }]}
        />
      </View>
    );
  }
);

ProgressIndicator.displayName = 'ProgressIndicator';

export { ProgressIndicator };

function defaultGetValueLabel(value: number, max: number) {
  return `${Math.round((value / max) * 100)}%`;
}

function isValidValueNumber(value: any, max: number): value is number {
  return typeof value === 'number' && !isNaN(value) && value <= max && value >= 0;
}
