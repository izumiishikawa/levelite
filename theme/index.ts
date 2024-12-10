import { Theme } from '@react-navigation/native';
import { COLORS } from './colors';

interface CustomTheme extends Theme {
  font: {
    regular: string;
    bold: string;
  };
}

const NAV_THEME: { light: CustomTheme; dark: CustomTheme } = {
  light: {
    dark: false,
    colors: {
      background: COLORS.light.background,
      border: COLORS.light.grey5,
      card: COLORS.light.card,
      notification: COLORS.light.destructive,
      primary: COLORS.light.primary,
      text: COLORS.black,
    },
    font: {
      regular: 'Inter_400Regular',
      bold: 'Inter_700Bold',
    },
  },
  dark: {
    dark: true,
    colors: {
      background: COLORS.dark.background,
      border: COLORS.dark.grey5,
      card: COLORS.dark.grey6,
      notification: COLORS.dark.destructive,
      primary: COLORS.dark.primary,
      text: COLORS.white,
    },
    font: {
      regular: 'Inter_400Regular',
      bold: 'Inter_700Bold',
    },
  },
};

export { NAV_THEME };
