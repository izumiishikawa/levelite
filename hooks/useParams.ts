import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

export type NavigationParamsList = {
  SkillBookTasks: {
    skillBookId: string;
    title: string;
    generatedToday: boolean;
  };
};

export default function useParams<ScreenName extends keyof NavigationParamsList>() {
  const params = useLocalSearchParams();
  const parsedParams = useMemo(
    () =>
      Object.keys(params).reduce(
        (acc, key) => {
          let value: any = params[key];

          if (!value) {
            return acc;
          }
          if (['true', 'false'].includes(value)) {
            value = value === 'true';
          } else {
            const numberValue = parseInt(value, 10);

            if (!Number.isNaN(numberValue)) {
              value = numberValue;
            }
          }

          return { ...acc, [key]: value };
        },
        {} as NonNullable<NavigationParamsList[ScreenName]>
      ),
    [params]
  );

  return parsedParams;
}
