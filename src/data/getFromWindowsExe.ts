import * as fs from "fs";
import { spawn } from "child_process";
import { performance } from "perf_hooks";
import path = require("path");
import { MapApiResponse } from "../types/MapApiResponse";
import { Level, LevelType, Object, ObjectType } from "../types/level.type";


export async function getFromWindowsExe(
  seed: string,
  difficulty: string,
  mapId: number = 0
): Promise<Level[]> {
  let mapLines: Level[] = [];
  for (var i = 1; i < 136; i++) {
      let levelData = await getMapFromWindowsExe(seed, difficulty, i);
      if (levelData) {
        mapLines.push(levelData);
      }
  }
  return mapLines;
}

async function getMapFromWindowsExe(
  seed: string,
  difficulty: string,
  mapId: number
): Promise<Level | void> {
const D2_GAME_FILES = "E:\\Games\\Diablo II";
let localExe = "E:\\Dev\\OneXDeveloper\\MapAssist\\bin\\x64\\Debug\\MAServer.exe";
const cmd = [path.resolve(D2_GAME_FILES)];
const convSeed = (num) => [
  (num >> 24) & 255,
  (num >> 16) & 255,
  (num >> 8) & 255,
  num & 255,
];
//console.log("Spawning process: " + localExe + " " + cmd.join(" ").toString());
return new Promise((resolve, reject) => {
  var child = spawn(localExe, cmd);
  const buffer = Buffer.from([...convSeed(parseInt(seed)), parseInt(difficulty), 0, 0, 0, mapId, 0, 0, 0]);
  child.stdin.write(buffer);
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", function (data) {
      
    data = data.toString();
    data = data.substr(data.indexOf('{'), data.length);
    if (data.includes("Invalid map id!")) {
      reject("Invalid map id!");
    }
    if (data.includes("error")) {
      reject(data);
    }
    if (data.length > 20) {
      console.log(`d2mapapi data generation done ${seed} ${difficulty} ${mapId}`);
      child.kill(9);
      //console.log(data);
      return resolve(convertToBlacha(data));
    }
  });
  child.on("close", function (code) {
    child.kill(9);
    return resolve();
  });
});
}



function convertToBlacha(d2mapapistr: string): Level {
  console.log(d2mapapistr);
  try {
    let d2mapapijson: MapApiResponse = JSON.parse(d2mapapistr);
    convertObjects(d2mapapijson);
    const blachajson: Level = {
        type: LevelType.Map,
        id: d2mapapijson.id,
        name: "",
        offset: d2mapapijson.offset,
        size: d2mapapijson.size,
        map: convertMapData(d2mapapijson.mapData),
        objects: convertObjects(d2mapapijson)
    }
    return blachajson;
  } catch (err) {
    console.error(err);
  }
}

function convertObjects(d2mapapiData: MapApiResponse): Object[] {
  let objList: Object[] = [];
  for (const thisobj in d2mapapiData.objects) {
      d2mapapiData.objects[thisobj].forEach(obj => {
          
          const newObj: Object = {
              id: parseInt(thisobj),
              type: ObjectType.Object,
              x: obj.x - d2mapapiData.offset.x,
              y: obj.y - d2mapapiData.offset.y
          };
          const name = getObjectClass(parseInt(thisobj));
          if (name != null) {
              newObj.name = name;
          }
          objList.push(newObj);
      });
  }
  for (const thisobj in d2mapapiData.npcs) {
      d2mapapiData.npcs[thisobj].forEach(npc => {
          const newObj: Object = {
              id: parseInt(thisobj),
              type: ObjectType.NPC,
              x: npc.x - d2mapapiData.offset.x,
              y: npc.y - d2mapapiData.offset.y
          };
          objList.push(newObj);
      });
  }
  // for (const thisobj in d2mapapiData.exits) {
  //     d2mapapiData.exits[thisobj].forEach(exit => {
  //         const newObj: Object = {
  //             id: parseInt(thisobj),
  //             type: ObjectType.Exit,
  //             x: exit.x - d2mapapiData.offset.x,
  //             y: exit.y - d2mapapiData.offset.y
  //         };
  //         objList.push(newObj);
  //     });
  // }
  return objList;
}

function convertMapData(d2mapapiMapData: number[]): Array<number[]> {
  let blachaMapData: Array<number[]> = [];
  let thisRow: number[] = [];
  d2mapapiMapData.forEach(num => {
      if (num == -1) {
          blachaMapData.push(thisRow)
          thisRow = [];
      } else {
          thisRow.push(num);
      }
  });
  return blachaMapData;
}


function getObjectClass(code: number): string | null {
  switch (code){
      case 119:
      case 145:
      case 156:
      case 157:
      case 237:
      case 238:
      case 288:
      case 323:
      case 324:
      case 398:
      case 402:
      case 429:
      case 494:
      case 496:
      case 511:
      case 539:
          return "Waypoint"
      case 60:
          return "Portal"
      case 1: 
      case 3: 
      case 5: 
      case 6: 
      case 50: 
      case 51: 
      case 53: 
      case 54: 
      case 55: 
      case 56: 
      case 57: 
      case 58: 
      case 79: 
      case 87: 
      case 88: 
      case 89: 
      case 125: 
      case 126: 
      case 127: 
      case 128: 
      case 139: 
      case 140: 
      case 141: 
      case 144: 
      case 146: 
      case 147: 
      case 148: 
      case 154: 
      case 155: 
      case 158: 
      case 159: 
      case 169: 
      case 171: 
      case 174: 
      case 175: 
      case 176: 
      case 177: 
      case 178: 
      case 181: 
      case 182: 
      case 183: 
      case 185: 
      case 186: 
      case 187: 
      case 188: 
      case 198: 
      case 203: 
      case 204: 
      case 205: 
      case 223: 
      case 224: 
      case 225: 
      case 240: 
      case 241: 
      case 242: 
      case 243: 
      case 244: 
      case 247: 
      case 248: 
      case 266: 
      case 268: 
      case 270: 
      case 271: 
      case 272: 
      case 274: 
      case 284: 
      case 314: 
      case 315: 
      case 316: 
      case 317: 
      case 326: 
      case 329: 
      case 330: 
      case 331: 
      case 332: 
      case 333: 
      case 334: 
      case 335: 
      case 336: 
      case 354: 
      case 355: 
      case 356: 
      case 360: 
      case 371: 
      case 372: 
      case 380: 
      case 381: 
      case 383: 
      case 384: 
      case 387: 
      case 388: 
      case 389: 
      case 390: 
      case 391: 
      case 397: 
      case 405: 
      case 406: 
      case 407: 
      case 413: 
      case 416: 
      case 420: 
      case 424: 
      case 425: 
      case 430: 
      case 431: 
      case 432: 
      case 433: 
      case 454: 
      case 455: 
      case 463: 
      case 466: 
      case 485: 
      case 486: 
      case 487: 
      case 501: 
      case 502: 
      case 504: 
      case 505: 
      case 518: 
      case 524: 
      case 525: 
      case 526: 
      case 529: 
      case 530: 
      case 531: 
      case 532: 
      case 533: 
      case 534: 
      case 535: 
      case 540: 
      case 541: 
      case 544: 
      case 545: 
      case 556: 
          return "chest"
      case 130: 
      case 132: 
      case 137: 
      case 138: 
      case 170: 
      case 322: 
      case 426: 
      case 493: 
      case 498: 
      case 513: 
      case 519:  
          return "Well"
      case 2:
      case 83:
      case 85:
      case 86:
      case 93:
      case 96:
      case 97:
      case 109:
      case 116:
      case 120:
      case 123:
      case 124:
      case 133:
      case 134:
      case 135:
      case 136:
      case 150:
      case 151:
      case 172:
      case 184:
      case 190:
      case 191:
      case 197:
      case 199:
      case 200:
      case 201:
      case 202:
      case 206:
      case 226:
      case 231:
      case 232:
      case 236:
      case 249:
      case 260:
      case 262:
      case 263:
      case 264:
      case 265:
      case 275:
      case 276:
      case 277:
      case 278:
      case 279:
      case 282:
      case 299:
      case 300:
      case 303:
      case 325:
      case 361:
      case 414:
      case 415:
      case 421:
      case 422:
      case 423:
      case 427:
      case 428:
      case 464:
      case 465:
      case 472:
      case 479:
      case 483:
      case 484:
      case 488:
      case 491:
      case 492:
      case 495:
      case 497:
      case 499:
      case 503:
      case 509:
      case 512:
      case 520:
      case 521:
      case 522:
          return "Shrine"
      case 17: // cairn stones
      case 30: // tree
      case 108: // malus
      case 354: // HoradricCubeChest
      case 355: // HoradricScrollChest
      case 356: // StaffOfKingsChest
      case 357: // YetAnotherTome
      case 152: // HoradricOrifice
      case 252: // gidbin
      case 376: // HellForge
      case 460: // DrehyaWildernessStartPosition
      case 462: // NihlathakWildernessStartPosition
      case 473: // CagedWussie
      
      case 392: // diablo seal
      case 393: // diablo seal
      case 394: // diablo seal
      case 395: // diablo seal
      case 396: // diablo seal
          return "quest";
      case 397:
      case 580:
      case 581:
          return "chest-super"
  }
  return null;
}