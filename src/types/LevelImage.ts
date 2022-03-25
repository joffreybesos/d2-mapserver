import { Canvas } from "canvas";
import { Level, LevelList } from "../types/level.type";

export class LevelImage {
  canvas: Canvas;
  mapData: Level;
  seedData: LevelList;
  leftTrimmed: number;
  topTrimmed: number;
  serverScale: number;
  exits?: string;
  waypoint?: string;
  bosses?: string;
  quests?: string;
  chests?: string;
  superchests?: string;
  shrines?: string;
  wells?: string;
  padding: number;
  rotate?: string;
  originalwidth: number;
  originalheight: number;
  constructor() {
    this.leftTrimmed = 0;
    this.topTrimmed = 0;
  }
}
