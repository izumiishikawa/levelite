import { darken, lighten } from 'polished';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'react-native';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import Popover from 'react-native-popover-view';
import { useShallow } from 'zustand/shallow';
import Text from '~/components/Text';
import { useSnackBar } from '~/contexts/SnackBarContext';
import {
  getRoadmapById,
  getRoadmaps,
  enterRoadmapNode,
  enterRoadmap,
  getDungeonById,
} from '~/services/api';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { usePlayerDataStore } from '~/stores/mainStore';
import { useRouter } from 'expo-router';
import RoadmapNode from '~/components/RoadmapNode';
import DungeonNode from '~/components/DungeonNode';
import ChestNode from '~/components/ChestNode';
import EnemieNode from '~/components/EnemieNode';
import Title from '~/components/Title';

interface Element {
  type: 'node' | 'treasure' | 'dungeon';
  element: {
    id: string;
    name: string;
    requirements: [
      {
        type: string;
        value: number;
        description: string;
      },
    ];
    rewards: {
      xp: number;
      items: string[];
    };
    enemies: {};
    boss: {};
  };
}

interface RoadmapData {
  _id: string;
  name: string;
  description: string;
  elements: Element[];
}

type RoadmapProgress = {
  roadmapId: string;
  completedNodes: string[];
  completedTreasures: any[];
  completedDungeons: any[];
  _id: string;
};

const Roadmap: React.FC = () => {
  const [currentRoadmapData, setCurrentRoadmapData] = useState<RoadmapData | null>(null);
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
  const [dungeon, setDungeon] = useState();

  const { roadmapProgress, currentRoadmap, setCurrentRoadmap, currentDungeon } = usePlayerDataStore(
    useShallow((state) => ({
      roadmapProgress: state.roadmapProgress,
      currentRoadmap: state.currentRoadmap,
      setCurrentRoadmap: state.setCurrentRoadmap,
      currentDungeon: state.currentDungeon,
    }))
  );

  useEffect(() => {
    const fetchRoadmapData = async () => {
      try {
        if (currentRoadmap) {
          const roadmap = await getRoadmapById(currentRoadmap);
          setCurrentRoadmapData(roadmap);
        } else if (!currentRoadmap) {
          const fetchedRoadmaps = await getRoadmaps();
          setRoadmaps(fetchedRoadmaps);
        }
      } catch (error) {
        console.error('Error fetching roadmaps:', error);
      }
    };

    fetchRoadmapData();
  }, [currentRoadmap]);

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        console.log('Fetching data for dungeonId:', currentDungeon?.dungeonId);
        const dungeon = await getDungeonById(currentRoadmap, currentDungeon.dungeonId);

        if (dungeon) {
          setDungeon(dungeon);
        }
      } catch (err) {
        console.log('Error fetching dungeon data:', err);
      }
    };

    if (currentDungeon?.dungeonId) {
      fetchCurrentData();
    }
  }, [currentDungeon]);

  const enterOnRoadmap = async (roadmapId: string) => {
    try {
      const roadmap = await enterRoadmap(roadmapId);
      if (roadmap) {
        setCurrentRoadmap(roadmapId);
        setCurrentRoadmapData(roadmap);
      }
    } catch (error) {
      console.error('Error entering roadmap:', error);
    }
  };

  function hasCompletedNode(
    roadmapProgress: RoadmapProgress[],
    roadmapId: string,
    node: string
  ): boolean {
    const roadmap = roadmapProgress.find((item) => item.roadmapId === roadmapId);
    return roadmap ? roadmap.completedNodes.includes(node) : false;
  }

  function hasOpenedChest(
    roadmapProgress: RoadmapProgress[],
    roadmapId: string,
    node: string
  ): boolean {
    const roadmap = roadmapProgress.find((item) => item.roadmapId === roadmapId);
    return roadmap ? roadmap.completedTreasures.includes(node) : false;
  }

  function isEnemieDefeated(enemie: string): boolean {
    return currentDungeon ? currentDungeon?.defeatedEnemies.includes(enemie) : false;
  }

  return (
    <ScrollView
      className="w-full bg-[--background]"
      contentContainerStyle={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column-reverse',
      }}>
      {currentRoadmap && currentRoadmapData && !currentDungeon.dungeonId ? (
        <View className="mx-auto flex w-full flex-col items-center gap-10 py-40">
          {currentRoadmapData.elements.map((element, index) => {
            const isEven = index % 2 === 0;
            const alignmentStyle = isEven ? 'self-start' : 'self-end';

            switch (element.type) {
              case 'node':
                return (
                  <View className={`w-[50%] ${alignmentStyle}`} key={index}>
                    <RoadmapNode
                      roadmapId={currentRoadmap}
                      isCompleted={hasCompletedNode(
                        roadmapProgress,
                        currentRoadmap,
                        element.element.id
                      )}
                      element={element.element}
                    />
                  </View>
                );
              case 'dungeon':
                return (
                  <View className={`w-[60%] ${alignmentStyle}`} key={index}>
                    <DungeonNode
                      roadmapId={currentRoadmap}
                      isCompleted={hasCompletedNode(
                        roadmapProgress,
                        currentRoadmap,
                        element.element.id
                      )}
                      element={element.element}
                    />
                  </View>
                );
              case 'treasure':
                return (
                  <View className={`w-[70%] ${alignmentStyle}`} key={index}>
                    <ChestNode
                      roadmapId={currentRoadmap}
                      isCompleted={hasOpenedChest(
                        roadmapProgress,
                        currentRoadmap,
                        element.element.id
                      )}
                      element={element.element}
                    />
                  </View>
                );
            }
          })}
        </View>
      ) : roadmaps.length > 0 ? (
        <View className="flex w-full flex-col items-center gap-4 pb-20 pt-20">
          <View className="mb-6 w-[80%]">
            <Title text="roadmaps" />

            <Text className="mt-4 text-center text-white">Embark on an epic journey to uncover ancient dungeons shrouded in mystery. Face formidable challenges, conquer the unknown, and seize legendary treasures that await only the bravest of adventurers!</Text>
          </View>

          {roadmaps.map((roadmap) => (
            <TouchableOpacity
              onPress={() => enterOnRoadmap(roadmap._id)}
              className="w-[90%] rounded-lg bg-[--foreground] p-3"
              key={roadmap._id}>
              <Image
                resizeMethod="resize"
                resizeMode="stretch"
                source={require('../assets/dungeon_wallpaper.jpg')}
                style={{ width: '100%', height: 200 }}
              />
              <Text className="mt-4 text-lg text-[--accent]" black>{roadmap.name}</Text>
              <View className='h-0.5 w-full bg-white my-2' />
              <Text className="text-sm text-gray-300">{roadmap.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <>
          {currentDungeon && dungeon && (
            <View className="flex h-full w-full flex-col items-center gap-10 py-40">
              <Text className="text-white">Dungeon</Text>
              {dungeon?.element?.enemies.map((enemie, index) => (
                <EnemieNode
                  element={enemie}
                  key={index}
                  roadmapId={currentRoadmap}
                  isDefeated={isEnemieDefeated(enemie.id)}
                />
              ))}
            </View>
          )}
          <Text className="text-gray-500">No roadmaps available</Text>
        </>
      )}
    </ScrollView>
  );
};

export default Roadmap;
