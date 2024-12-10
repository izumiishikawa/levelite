import * as SecureStore from 'expo-secure-store';

export const saveSecurely = async (key: any, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await SecureStore.setItemAsync(key, jsonValue);
  } catch (err) {
    throw err;
  }
};

export const fetchSecurely = async (key: any) => {
  try {
    const jsonValue = await SecureStore.getItemAsync(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (err) {
    throw err;
  }
};

export const deleteSecurely = async (key: any) => {
  return await SecureStore.deleteItemAsync(key);
};
