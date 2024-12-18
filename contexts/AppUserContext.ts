import { createContext, Dispatch, SetStateAction, useState } from "react";

interface Attributes {
  vitality: number;
  focus: number;
  aura: number;
}

interface PlayerData {
  _id: string;
  username: string;
  passwordHash: string;
  email: string;
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  pointsToDistribute: number;
  attributes: Attributes;
  tasksCompleted: number;
  streak: number;
  createdAt: string;
  weight: number;
  age: number;
  height: number;
  inPenaltyZone: boolean;
  mainGoal: string;
  exerciseFrequency: string;
  exerciseIntensity: string;
  cognitiveChallengePreference: string;
  selfDisciplineLevel: string;
  studyFrequency: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  coins: number;
  allTasksDone: boolean;
  selectedClass: string;
  generatedToday: boolean;
  classGeneratedToday: boolean;
  skillBookGeneratedToday: boolean;
  totalExp: number;
  onboarded: boolean;
  lastTaskCompletedAt: string | null;
  gems: number;
  allDone: boolean;
}

interface PlayerContextType {
  playerData: PlayerData;
  setPlayerData: Dispatch<SetStateAction<PlayerData>>;
}

export const AppUserContext = createContext<PlayerContextType>({
  playerData: {
    _id: "",
    username: "",
    passwordHash: "",
    email: "",
    level: 0,
    currentXP: 0,
    xpForNextLevel: 0,
    pointsToDistribute: 0,
    attributes: {
      vitality: 0,
      focus: 0,
      aura: 0,
    },
    tasksCompleted: 0,
    streak: 0,
    createdAt: "",
    weight: 0,
    age: 0,
    height: 0,
    inPenaltyZone: false,
    mainGoal: "",
    exerciseFrequency: "",
    exerciseIntensity: "",
    cognitiveChallengePreference: "",
    selfDisciplineLevel: "",
    studyFrequency: "",
    health: 0,
    maxHealth: 0,
    mana: 0,
    maxMana: 0,
    coins: 0,
    allTasksDone: false,
    selectedClass: "",
    generatedToday: false,
    classGeneratedToday: false,
    skillBookGeneratedToday: false,
    totalExp: 0,
    onboarded: false,
    lastTaskCompletedAt: null,
    gems: 0,
    allDone: false,
  },
  setPlayerData: () => {},
});
