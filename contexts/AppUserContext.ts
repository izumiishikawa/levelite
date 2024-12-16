import { createContext, Dispatch, SetStateAction, useState } from "react";

interface Attributes {
  vitality: number;
  focus: number;
  aura: number;
}

interface PlayerData {
  _id: string;
  username: string;
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
  mainGoal: string; // Adicionado
  exerciseFrequency: string; // Adicionado
  exerciseIntensity: string; // Adicionado
  cognitiveChallengePreference: string; // Adicionado
  selfDisciplineLevel: string; // Adicionado
  studyFrequency: string; // Adicionado
  health: number,
  maxHealth: number,
  mana: number,
  maxMana: number,
  coins: number,
  allTasksDone: boolean,
  selectedClass: string,
  generatedToday: boolean,
  classGeneratedToday: boolean,
  skillBookGeneratedToday: boolean,
  totalExp: number,
}

interface PlayerContextType {
  playerData: PlayerData;
  setPlayerData: Dispatch<SetStateAction<PlayerData>>;
}

export const AppUserContext = createContext<PlayerContextType>({
  playerData: {
    _id: "",
    username: "",
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
    mainGoal: "", // Adicionado
    exerciseFrequency: "", // Adicionado
    exerciseIntensity: "", // Adicionado
    cognitiveChallengePreference: "", // Adicionado
    selfDisciplineLevel: "", // Adicionado
    studyFrequency: "", // Adicionado
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
  },
  setPlayerData: () => {},
});
