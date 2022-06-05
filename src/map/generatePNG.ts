import { createCanvas } from "canvas";
import { Level } from "../types/level.type";
import { drawIcons } from "./drawing/drawIcons";
import { drawObjects } from "./drawing/drawObjects";
import { drawExits } from "./drawing/drawExits";
import { drawWalls } from "./drawing/drawWalls";
import { drawNPCs } from "./drawing/drawNPCs";
import { mapRefList } from "../static/mapRefData.json";
import { drawWatermark } from "./drawing/drawWatermark";
import { performance } from "perf_hooks";
import { drawVerboseObjects } from "./drawing/drawVerboseObjects";
import { getHeaderData } from "./getHeaderData";
import { drawWallEdges } from "./drawing/drawWallEdges";
import { drawQuestItems } from "./drawing/drawQuestItems";
import { trimCanvasRightBottom } from "./trim";
import { LevelImage } from "../types/LevelImage";
import { RequestConfig } from "../types/RequestConfig";

export async function generatePNG(
  levelImage: LevelImage,
  reqConfig: RequestConfig
): Promise<LevelImage> {
  const start = performance.now();
  const levelData: Level = levelImage.mapData;
  const scale = reqConfig.serverScale; // pixel plot size
  const padding = reqConfig.padding;
  console.log("reading size");
  const mapWidth = levelData.size.width * scale + padding + padding;
  const mapHeight = levelData.size.height * scale + padding + padding;
  console.log("readingd size");
  const canvas = createCanvas(mapWidth, mapHeight);
  const ctx = canvas.getContext("2d");
  ctx.translate(padding, padding);

  if (reqConfig.edge) {
    drawWallEdges(ctx, levelData, scale, reqConfig)
  } else {
    drawWalls(ctx, levelData, scale, reqConfig)
  }
  await Promise.allSettled([
    drawQuestItems(ctx, levelData, scale, reqConfig),
    drawObjects(ctx, levelData, scale, reqConfig),
    drawExits(ctx, levelData, scale, mapRefList, reqConfig),
    drawIcons(ctx, levelData, scale),
    drawNPCs(ctx, levelData, scale, reqConfig),
  ]);
  
  if (reqConfig.verbose) {
    drawVerboseObjects(ctx, levelData, scale);
  }
  trimCanvasRightBottom(canvas, padding);
  const headers = getHeaderData(levelData, mapRefList);

  const finalCanvas = drawWatermark(ctx, reqConfig);

  levelImage.padding = padding;
  levelImage.serverScale = scale;
  levelImage.exits = headers.exitLocations;
  levelImage.waypoint = headers.waypointLocation;
  levelImage.bosses = headers.bossLocations;
  levelImage.quests = headers.questLocations;
  levelImage.chests = headers.chestLocations;
  levelImage.superchests = headers.superchestLocations;
  levelImage.shrines = headers.shrineLocations;
  levelImage.wells = headers.wellLocations;
  levelImage.originalwidth = finalCanvas.width;
  levelImage.originalheight = finalCanvas.height;
  levelImage.canvas = finalCanvas;

  const mapName = mapRefList.find((map) => map.id == levelData.id);
  const end = performance.now();
  console.log(`Generated PNG ${levelData.id} '${mapName?.name}', took ${Math.trunc(end - start)}ms`);

  return levelImage;
}
