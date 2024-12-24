import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const url = 'https://delicate-prawn-verbally.ngrok-free.app';
import * as FileSystem from 'expo-file-system';
import { lookup as getMimeType } from 'react-native-mime-types';

export const consultPlayerStatus = async () => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.get(`${url}/user/profile`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const userLogin = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${url}/auth/authenticate`,
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const userRegister = async (username: string, email: string, password: string) => {
  try {
    const response = await axios.post(
      `${url}/auth/register`,
      { username, email, password },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    switch (response.status) {
      case 201:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const consultPlayerInventory = async (userId: string) => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');

    const response = await axios.get(`${url}/inventory/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const useInventoryItem = async (userId: string, itemId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.post(
      `${url}/inventory/${userId}/use`,
      { itemId }, // Corpo da requisição contendo o ID do item
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const buyShopItem = async (userId: string, itemId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.post(
      `${url}/inventory/${userId}/buy`,
      { itemId }, // Corpo da requisição contendo o ID do item
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const getShopItems = async () => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.get(`${url}/itemData/shop`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const consultPendingTasks = async (userId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.get(`${url}/user/tasks?userId=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const setGeneratedToday = async (userId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.put(
      `${url}/user/generated-today`,
      { userId },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw new Error('Failed to update generatedToday. Please try again later.');
  }
};

export const setClassGeneratedToday = async (userId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.put(
      `${url}/user/class-generated-today`,
      { userId },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw new Error('Failed to update generatedToday. Please try again later.');
  }
};

export const searchUsers = async (query: string): Promise<any> => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.get(`${url}/friendship/search`, {
      params: { query },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data.users; // Retorna a lista de usuários
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw new Error('Failed to fetch users. Please try again later.');
  }
};

export const sendFriendRequest = async (friendId: string): Promise<any> => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.post(
      `${url}/friendship/request`,
      { friendId },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data; // Retorna a lista de usuários
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw new Error('Failed to fetch users. Please try again later.');
  }
};

export const cancelFriendRequest = async (friendId: string): Promise<any> => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.post(
      `${url}/friendship/cancel`,
      { friendId },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data; // Retorna a lista de usuários
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw new Error('Failed to fetch users. Please try again later.');
  }
};

export const acceptFriendRequest = async (friendId: string): Promise<any> => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.post(
      `${url}/friendship/accept`,
      { friendId },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data; // Retorna a lista de usuários
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw new Error('Failed to fetch users. Please try again later.');
  }
};

export const fetchGlobalRanking = async (page: number = 1, limit: number = 10): Promise<any> => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.get(`${url}/ranking/global`, {
      params: { page, limit },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data; // Retorna o ranking global
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw new Error('Failed to fetch global ranking. Please try again later.');
  }
};

export const fetchFriendsRanking = async (page: number = 1, limit: number = 10): Promise<any> => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.get(`${url}/ranking/friends`, {
      params: { page, limit },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data; // Retorna o ranking entre amigos
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw new Error('Failed to fetch friends ranking. Please try again later.');
  }
};

export const getFriendList = async (): Promise<any> => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.get(`${url}/friendship/list`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data; // Retorna a lista de usuários
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw new Error('Failed to fetch users. Please try again later.');
  }
};

export const getFriendRequestsList = async (): Promise<any> => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.get(`${url}/friendship/requests`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data; // Retorna a lista de usuários
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw new Error('Failed to fetch users. Please try again later.');
  }
};

export const getPlayersProfile = async (friendId: string): Promise<any> => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.get(`${url}/friendship/user/${friendId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data; // Retorna a lista de usuários
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw new Error('Failed to fetch users. Please try again later.');
  }
};

export const restoreTask = async (taskId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.patch(
      `${url}/user/tasks/restore?taskId=${taskId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const consultPenaltyTasks = async (userId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.get(`${url}/user/penalty-tasks?userId=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const updateProfilePicture = async (userId: string, fileUri: string): Promise<any> => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    // Preparar o arquivo para upload
    const fileType = getMimeType(fileUri) || 'image/jpeg'; // Default para "image/jpeg" se não identificado
    const fileName = fileUri.split('/').pop() || 'profile-pic.jpg';

    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: fileType,
      name: fileName,
    } as any); // "as any" é necessário devido a tipos inconsistentes do FormData no React Native

    const response = await axios.post(`${url}/user/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao atualizar a foto de perfil:', error);
    throw error;
  }
};

export const updateProfileBanner = async (userId: string, fileUri: string): Promise<any> => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    // Preparar o arquivo para upload
    const fileType = getMimeType(fileUri) || 'image/jpeg'; // Default para "image/jpeg" se não identificado
    const fileName = fileUri.split('/').pop() || 'profile-pic.jpg';

    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: fileType,
      name: fileName,
    } as any); // "as any" é necessário devido a tipos inconsistentes do FormData no React Native

    const response = await axios.post(`${url}/user/profile-banner`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao atualizar a foto de perfil:', error);
    throw error;
  }
};

export const consultClassTasks = async (userId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.get(`${url}/class/tasks?userId=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const completeTask = async (taskId: string, userId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.put(
      `${url}/user/complete-task?taskId=${taskId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const createOrUpdatePlayerProfile = async (profileData: any) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.post(
      `${url}/auth/profile`, // Assumindo que essa rota seja '/user/profile'
      { ...profileData },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 201: // Created
      case 200: // OK (caso esteja atualizando um perfil existente)
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const distributeAttributes = async (
  userId: string,
  attributes: {
    aura?: number;
    vitality?: number;
    focus?: number;
  }
) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.put(
      `${url}/user/distribute-attributes`,
      { userId, ...attributes },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const getSkillBookTasks = async (bookId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.get(`${url}/skillbooks/tasks/${bookId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data.tasks; // Retorna os SkillBooks
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    return null; // Repassa o erro para ser tratado onde a função for chamada
  }
};

export const getSkillBookById = async (skillBookId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.get(`${url}/skillbooks/${skillBookId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data; // Retorna os SkillBooks
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    return null; // Repassa o erro para ser tratado onde a função for chamada
  }
};

export const getProgressCalendar = async (year: number, month: number) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.get(`${url}/progress/progress-calendar`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      params: { year, month },
    });

    if (response.status === 200) {
      return response.data; // Retorna o progresso do calendário
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching progress calendar:', error);
    return null; // Retorna null para indicar falha
  }
};

export const removeSkillBook = async (skillBookId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.delete(`${url}/skillbooks/remove/${skillBookId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data.tasks; // Retorna os SkillBooks
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    return null; // Repassa o erro para ser tratado onde a função for chamada
  }
};

export const updateSkillBook = async (
  skillBookId: string,
  skillBook: {
    title: string;
    focus: string;
    parameters: {
      difficulty: 'low' | 'medium' | 'high';
      frequency: 'daily' | 'weekly';
      level: 'beginner' | 'intermediate' | 'expert';
    };
  }
) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.put(
      `${url}/skillbooks/update-skillbook/${skillBookId}`,
      { ...skillBook },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data.tasks; // Retorna os SkillBooks
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    return null; // Repassa o erro para ser tratado onde a função for chamada
  }
};

export const generateSkillBookTasks = async (bookId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.post(
      `${url}/skillbooks/generate-skillbook-tasks/${bookId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const generateClassTasks = async (userId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.post(
      `${url}/class/generate-class-tasks`,
      { userId },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const getUserSkillBooks = async (userId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.get(`${url}/skillbooks/user-skillbooks/`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200:
        return response.data.skillBooks; // Retorna os SkillBooks
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error; // Repassa o erro para ser tratado onde a função for chamada
  }
};

export const createSkillBook = async (
  userId: string,
  skillBook: {
    title: string;
    focus: string;
    parameters: {
      difficulty: 'low' | 'medium' | 'high';
      frequency: 'daily' | 'weekly';
      level: 'beginner' | 'intermediate' | 'expert';
    };
    color: string;
  }
) => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.post(
      `${url}/skillbooks/create-skillbook`,
      { userId, ...skillBook },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const createUserTask = async (taskData: {
  userId: string;
  title: string;
  description: string;
  attribute: 'aura' | 'vitality' | 'focus';
  intensityLevel: 'low' | 'medium' | 'high';
  recurrence: 'daily' | 'weekly';
  xpReward: number;
}) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.post(`${url}/user/create-user-task`, taskData, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 201: // Sucesso na criação da task
        return response.data; // Retorna a task criada
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error; // Repassa o erro para ser tratado onde a função for chamada
  }
};

export const deleteTask = async (taskId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.delete(`${url}/user/delete-task?taskId=${taskId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    switch (response.status) {
      case 200: // Sucesso na deleção da tarefa
        return response.data; // Retorna a resposta da API
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error; // Repassa o erro para ser tratado onde a função for chamada
  }
};

export const generateAiTasks = async (userId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.post(
      `${url}/user/generate-tasks`,
      { userId },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 201: // Sucesso na criação da task
        return response.data.tasks; // Retorna a task criada
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error; // Repassa o erro para ser tratado onde a função for chamada
  }
};

export const updateStreak = async (userId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.put(
      `${url}/streak/update-streak`,
      { userId },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data; // Retorna os dados do sucesso da atualização
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const getRoadmaps = async () => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.get(
      `${url}/roadmaps/`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data; // Retorna os dados do sucesso da atualização
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const getRoadmapById = async (roadmapId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.get(
      `${url}/roadmaps/${roadmapId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data; // Retorna os dados do sucesso da atualização
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const getDungeonById = async (roadmapId: string, dungeonId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.get(
      `${url}/roadmaps/${roadmapId}/dungeons/${dungeonId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data; // Retorna os dados do sucesso da atualização
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const enterRoadmapNode = async (roadmapId: string, nodeId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.post(
      `${url}/roadmaps/${roadmapId}/elements/${nodeId}/enter`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data; // Retorna os dados do sucesso da atualização
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};


export const startDungeonBattle = async (enemyId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.post(
      `${url}/roadmaps/start-battle/${enemyId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data; // Retorna os dados do sucesso da atualização
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export const enterRoadmap = async (roadmapId: string) => {
  const userToken = await AsyncStorage.getItem('userToken');

  try {
    const response = await axios.post(
      `${url}/roadmaps/enter/${roadmapId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    switch (response.status) {
      case 200:
        return response.data; // Retorna os dados do sucesso da atualização
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};