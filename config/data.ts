interface PlayerContextType {
  id?: number;
  nickname?: string;
  generalLevel?: number;
}

export const playerDataSave: any = {
  id: 1,
  nickname: 'Satsuki Izumi',
  generalLevel: 3,
  player_weight: 58,
  player_height: 179,
  age: 20,
  attributes: [
    {
      name: "Fisico",
      level: 1,
      current_level_progress: 95,
    },
    {
      name: "Inteligência",
      level: 2,
      current_level_progress: 35,
    }
  ]
};
