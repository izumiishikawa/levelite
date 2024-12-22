import { create } from 'zustand';

interface AuthStore {
  isLogged: boolean;
  setIsLogged: (isLogged: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLogged: true,
  setIsLogged: (isLogged) => set({isLogged})
}))

interface PlayerDataStore {
  id: string;
  icon: string;
  banner: string,
  username: string;
  playerTitle: string;
  generatedToday: boolean | null;
  classGeneratedWeek: boolean | null;
  selectedClass: string;
  profileUpdateSignal: number;
  height: number;
  weight: number;
  onboarded: boolean;
  updateTasksSignal: number;
  setClassGeneratedWeek: (classGeneratedWeek: boolean) => void;
  setPlayerTitle: (playerTitle: string) => void;
  setUpdateTaskSignal: (updateTasksSignal: number) => void;
  updateSkillBookSignal: number;
  setUpdateSkillBookSignal: (updateTasksSignal: number) => void;
  setOnboarded: (onboarded: boolean) => void;
  setIcon: (icon: string) => void;
  setBanner: (banner: string) => void;
  setId: (id: string) => void;
  setProfileUpdateSignal: (profileUpdateSignal: number) => void;
  setSelectedClass: (selectedClass: string) => void;
  setGeneratedToday: (generatedToday: boolean) => void;
  setUsername: (username: string) => void;
  setHeight: (height: number) => void;
  setWeight: (weight: number) => void;
}

export const usePlayerDataStore = create<PlayerDataStore>((set) => ({
  id: '',
  icon: '',
  banner: '',
  username: '',
  playerTitle: '',
  generatedToday: null,
  classGeneratedWeek: null,
  selectedClass: '',
  profileUpdateSignal: 0,
  height: 0,
  weight: 0,
  onboarded: false,
  updateTasksSignal: 0,
  setClassGeneratedWeek: (classGeneratedWeek) => set({classGeneratedWeek}),
  setPlayerTitle: (playerTitle) => set({playerTitle}),
  setUpdateTaskSignal: (updateTasksSignal) => set({ updateTasksSignal }),
  updateSkillBookSignal: 0,
  setUpdateSkillBookSignal: (updateSkillBookSignal) => set({ updateSkillBookSignal }),
  setOnboarded: (onboarded) => set({ onboarded }),
  setIcon: (icon) => set({ icon }),
  setBanner: (banner) => set({ banner }),
  setId: (id) => set({ id }),
  setProfileUpdateSignal: (profileUpdateSignal) => set({ profileUpdateSignal }),
  setGeneratedToday: (generatedToday) => set({ generatedToday }),
  setSelectedClass: (selectedClass) => set({ selectedClass }),
  setUsername: (username) => set({ username }),
  setHeight: (height) => set({ height }),
  setWeight: (weight) => set({ weight }),
}));

// Store for Coins and Streak Management
interface CoinsAndStreakStore {
  coins: number;
  streak: number;
  gems: number;
  setCoins: (coins: number) => void;
  setStreak: (streak: number) => void;
  setGems: (gems: number) => void;
}

export const useCoinsAndStreakStore = create<CoinsAndStreakStore>((set) => ({
  coins: 0,
  streak: 0,
  gems: 0,
  setCoins: (coins) => set({ coins }),
  setStreak: (streak) => set({ streak }),
  setGems: (gems) => set({ gems }),
}));

// Store for Levels and Experience Management
interface LevelsAndExpStore {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  pointsToDistribute: number;
  totalExp: number;
  setLevel: (level: number) => void;
  setCurrentXP: (xp: number) => void;
  setXpForNextLevel: (xp: number) => void;
  setPointsToDistribute: (points: number) => void;
  setTotalExp: (exp: number) => void;
}

export const useLevelsAndExpStore = create<LevelsAndExpStore>((set) => ({
  level: 0,
  currentXP: 0,
  xpForNextLevel: 0,
  pointsToDistribute: 0,
  totalExp: 0,
  setLevel: (level) => set({ level }),
  setCurrentXP: (xp) => set({ currentXP: xp }),
  setXpForNextLevel: (xp) => set({ xpForNextLevel: xp }),
  setPointsToDistribute: (points) => set({ pointsToDistribute: points }),
  setTotalExp: (exp) => set({ totalExp: exp }),
}));

// Store for Penalty Zone Management
interface PenaltyZoneStore {
  inPenaltyZone: boolean;
  setInPenaltyZone: (status: boolean) => void;
}

export const usePenaltyZoneStore = create<PenaltyZoneStore>((set) => ({
  inPenaltyZone: false,
  setInPenaltyZone: (status) => set({ inPenaltyZone: status }),
}));

// Store for Attributes Management
interface AttributesStore {
  vitality: number;
  focus: number;
  aura: number;
  setVitality: (value: number) => void;
  setFocus: (value: number) => void;
  setAura: (value: number) => void;
}

export const useAttributesStore = create<AttributesStore>((set) => ({
  vitality: 0,
  focus: 0,
  aura: 0,
  setVitality: (value) => set({ vitality: value }),
  setFocus: (value) => set({ focus: value }),
  setAura: (value) => set({ aura: value }),
}));

// Store for Health and Mana Management
interface HealthAndManaStore {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  setHealth: (health: number) => void;
  setMaxHealth: (maxHealth: number) => void;
  setMana: (mana: number) => void;
  setMaxMana: (maxMana: number) => void;
}

export const useHealthAndManaStore = create<HealthAndManaStore>((set) => ({
  health: 0,
  maxHealth: 0,
  mana: 0,
  maxMana: 0,
  setHealth: (health) => set({ health }),
  setMaxHealth: (maxHealth) => set({ maxHealth }),
  setMana: (mana) => set({ mana }),
  setMaxMana: (maxMana) => set({ maxMana }),
}));

// Store for Main Goals and Preferences
interface MainGoalStore {
  mainGoal: string;
  exerciseFrequency: string;
  exerciseIntensity: string;
  cognitiveChallengePreference: string;
  selfDisciplineLevel: string;
  studyFrequency: string;
  setMainGoal: (goal: string) => void;
  setExerciseFrequency: (frequency: string) => void;
  setExerciseIntensity: (intensity: string) => void;
  setCognitiveChallengePreference: (preference: string) => void;
  setSelfDisciplineLevel: (level: string) => void;
  setStudyFrequency: (frequency: string) => void;
}

export const useMainGoalStore = create<MainGoalStore>((set) => ({
  mainGoal: '',
  exerciseFrequency: '',
  exerciseIntensity: '',
  cognitiveChallengePreference: '',
  selfDisciplineLevel: '',
  studyFrequency: '',
  setMainGoal: (goal) => set({ mainGoal: goal }),
  setExerciseFrequency: (frequency) => set({ exerciseFrequency: frequency }),
  setExerciseIntensity: (intensity) => set({ exerciseIntensity: intensity }),
  setCognitiveChallengePreference: (preference) =>
    set({ cognitiveChallengePreference: preference }),
  setSelfDisciplineLevel: (level) => set({ selfDisciplineLevel: level }),
  setStudyFrequency: (frequency) => set({ studyFrequency: frequency }),
}));

interface FriendshipStore {
  friends: string[]; // Lista de IDs ou nomes dos amigos
  friendRequests: {
    icon: any;
    name: string;
    from: string;
    status: 'pending' | 'accepted' | 'rejected';
  }[]; // Solicitações de amizade
  setFriends: (friends: string[]) => void; // Definir lista de amigos
  addFriend: (friendId: string) => void; // Adicionar um amigo à lista
  removeFriend: (friendId: string) => void; // Remover um amigo da lista
  setFriendRequests: (
    requests: { from: string; status: 'pending' | 'accepted' | 'rejected' }[]
  ) => void; // Definir solicitações
  addFriendRequest: (request: {
    from: string;
    status: 'pending' | 'accepted' | 'rejected';
  }) => void; // Adicionar solicitação
  updateFriendRequest: (from: string, status: 'accepted' | 'rejected') => void; // Atualizar status de uma solicitação
  clearFriendRequests: () => void; // Limpar todas as solicitações
}

export const useFriendshipStore = create<FriendshipStore>((set) => ({
  friends: [],
  friendRequests: [],

  setFriends: (friends) => set({ friends }),

  addFriend: (friendId) => set((state) => ({ friends: [...state.friends, friendId] })),

  removeFriend: (friendId) =>
    set((state) => ({
      friends: state.friends.filter((id) => id !== friendId),
    })),

  setFriendRequests: (requests) => set({ friendRequests: requests }),

  addFriendRequest: (request) =>
    set((state) => ({
      friendRequests: [...state.friendRequests, request],
    })),

  updateFriendRequest: (from, status) =>
    set((state) => ({
      friendRequests: state.friendRequests.map((req) =>
        req.from === from ? { ...req, status } : req
      ),
    })),

  clearFriendRequests: () => set({ friendRequests: [] }),
}));
