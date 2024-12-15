import LottieView from 'lottie-react-native';
import * as React from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
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
    const max = maxProp ?? DEFAULT_MAX;
    const value = isValidValueNumber(valueProp, max) ? valueProp : 0;

    const [barWidth, setBarWidth] = React.useState(0);

    const progress = useDerivedValue(() => (value / max) * barWidth, [value, max, barWidth]);

    const indicator = useAnimatedStyle(() => {
      return {
        width: withSpring(`${(value / max) * 100}%`, { overshootClamping: true }),
      };
    });

    const lottiePosition = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateX: withTiming(progress.value, { duration: 500 }),
          },
        ],
      };
    });

    const lottieRef = React.useRef<LottieView>(null);

    // Reproduz a animação do LottieView toda vez que o valor da barra muda
    React.useEffect(() => {
      if (lottieRef.current) {
        lottieRef.current.play();
      }
    }, [value]);

    const handleLayout = (event: LayoutChangeEvent) => {
      setBarWidth(event.nativeEvent.layout.width);
    };

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
        className={cn('relative h-[10px] w-full overflow', className)}
        onLayout={handleLayout} // Captura a largura da barra
        {...props}>
        <View className="absolute bottom-0 left-0 right-0 top-0 bg-muted opacity-20" />
        <Animated.View
          role="presentation"
          className={cn('h-full')}
          style={[
            indicator,
            { backgroundColor: barColor.startsWith('--') ? `var(${barColor})` : barColor },
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: -19, // Ajuste para posicionar o Lottie acima da barra
              left: -25,
              width: 100,
              height: 100,
              zIndex: 100,
            },
            lottiePosition,
          ]}>
          <LottieView
            ref={lottieRef}
            loop={false} // Toca apenas uma vez ao mudar o valor
            autoPlay={false} // Só toca ao mudar o valor
            source={require('../../assets/pulse.json')}
            renderMode="SOFTWARE"
            style={{ width: 50, height: 50 }}
          />
        </Animated.View>
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
