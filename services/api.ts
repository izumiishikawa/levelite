import axios from 'axios';
const url = 'https://novel-duckling-unlikely.ngrok-free.app';

export const consultPlayerStatus = async (userId: string) => {
  try {
    const response = await axios.get(`${url}/user/profile?userId=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error while calling getInfo API ', error);
    throw error;
  }
};

export const consultPendingTasks = async (userId: string) => {
  try {
    const response = await axios.get(`${url}/user/tasks?userId=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const restoreTask = async (taskId: string) => {
  try {
    const response = await axios.patch(
      `${url}/user/tasks/restore?taskId=${taskId}`, // Rota para restaurar a tarefa
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
    console.error('Error while calling restoreTask API', error);
    throw error;
  }
};


export const consultPenaltyTasks = async (userId: string) => {
  try {
    const response = await axios.get(`${url}/user/penalty-tasks?userId=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    switch (response.status) {
      case 200:
        return response.data;
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error while calling getInfo API ', error);
    throw error;
  }
};

export const completeTask = async (taskId: string, userId: string) => {
  try {
    const response = await axios.put(
      `${url}/user/complete-task?taskId=${taskId}`,
      { userId },
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
    console.error('Error while calling getInfo API ', error);
    throw error;
  }
};

export const createOrUpdatePlayerProfile = async (userId: string, profileData: any) => {
  try {
    const response = await axios.post(
      `${url}/auth/profile`, // Assumindo que essa rota seja '/user/profile'
      { userId, ...profileData },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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
    console.error('Error while calling createOrUpdatePlayerProfile API', error);
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
  try {
    const response = await axios.put(
      `${url}/user/distribute-attributes`,
      { userId, ...attributes },
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
    console.error('Error while distributing attributes', error);
    throw error;
  }
};

export const getSkillBookTasks = async (bookId: string) => {
  try {
    const response = await axios.get(`${url}/skillbooks/tasks/${bookId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    switch (response.status) {
      case 200:
        return response.data.tasks; // Retorna os SkillBooks
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error while fetching SkillBooks', error);
    throw error; // Repassa o erro para ser tratado onde a função for chamada
  }
};

export const generateSkillBookTasks = async (bookId: string) => {
  try {
    const response = await axios.post(`${url}/skillbooks/generate-skillbook-tasks/${bookId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error while creating skillbook', error);
    throw error;
  }
};

export const getUserSkillBooks = async (userId: string) => {
  try {
    const response = await axios.get(`${url}/skillbooks/user-skillbooks/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    switch (response.status) {
      case 200:
        return response.data.skillBooks; // Retorna os SkillBooks
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error while fetching SkillBooks', error);
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
    };
  }
) => {
  try {
    const response = await axios.post(
      `${url}/skillbooks/create-skillbook`,
      { userId, ...skillBook },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error while creating skillbook', error);
    throw error;
  }
};

export const createUserTask = async (taskData: {
  userId: string;
  title: string;
  description: string;
  attribute: 'aura' | 'vitality' | 'focus';
  intensityLevel: 'low' | 'medium' | 'high';
  recurrence: "daily" | 'weekly',
  xpReward: number;
}) => {
  try {
    const response = await axios.post(`${url}/user/create-user-task`, taskData, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    switch (response.status) {
      case 201: // Sucesso na criação da task
        return response.data; // Retorna a task criada
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error while creating user task', error);
    throw error; // Repassa o erro para ser tratado onde a função for chamada
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const response = await axios.delete(`${url}/user/delete-task?taskId=${taskId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    switch (response.status) {
      case 200: // Sucesso na deleção da tarefa
        return response.data; // Retorna a resposta da API
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error while deleting user task', error);
    throw error; // Repassa o erro para ser tratado onde a função for chamada
  }
};



export const generateAiTasks = async (userId: string) => {
  try {
    const response = await axios.post(`${url}/user/generate-tasks`, { userId }, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    switch (response.status) {
      case 201: // Sucesso na criação da task
        return response.data.tasks; // Retorna a task criada
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error while creating user task', error);
    throw error; // Repassa o erro para ser tratado onde a função for chamada
  }
};

export const updateStreak = async (userId: string) => {
  try {
    const response = await axios.put(
      `${url}/streak/update-streak`,
      { userId },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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
    console.error('Error while updating streak ', error);
    throw error;
  }
};