import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface CustomTextProps extends RNTextProps {
  children: React.ReactNode;
  className?: string; // NativeWind Tailwind classes
  bold?: boolean;
  semiBold?: boolean;
  extraBold?: boolean;
  black?: boolean;
  light?: boolean;
  thin?: boolean;
}

const Text: React.FC<CustomTextProps> = ({
  children,
  className = '',
  bold,
  semiBold,
  extraBold,
  black,
  light,
  thin,
  style,
  ...props
}) => {
  // Determine the font family based on the props
  let fontFamily = 'Inter_600SemiBold'; // Default
  if (bold) fontFamily = 'Inter_700Bold';
  else if (semiBold) fontFamily = 'Inter_600SemiBold';
  else if (extraBold) fontFamily = "Inter_800ExtraBold"
  else if (black) fontFamily = "Inter_900Black";
  else if (light) fontFamily = 'Inter_300Light';
  else if (thin) fontFamily = 'Inter_100Thin';

  return (
    <RNText
      className={className} // NativeWind processará isso automaticamente
      style={[{ fontFamily }, style]} // Combine o estilo da fonte com o estilo extra
      {...props}
    >
      {children}
    </RNText>
  );
};

export default Text;
