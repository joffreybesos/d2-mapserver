import * as fs from "fs";
import { spawn } from "child_process";
import { performance } from "perf_hooks";
import path = require("path");
import { MapApiResponse } from "./types/MapApiResponse";


getFromWindowsExe("12345","2",1);

export function getFromWindowsExe(
  seed: string,
  difficulty: string,
  mapId: number
): MapApiResponse | void {
  const start = performance.now();
  const D2_GAME_FILES = process.env.D2_GAME_FILES || "game";
  let localExe = path.dirname(process.execPath) + "bin/d2mapapi.exe";
  if (!fs.existsSync(localExe)) {
    localExe = path.join(__dirname, "../bin/d2mapapi.exe");
  }
  const args = [
    path.resolve(D2_GAME_FILES)
  ];
  const convSeed = num => [
    (num >> 24) & 255,
    (num >> 16) & 255,
    (num >> 8) & 255,
    num & 255,
  ];
  //const mapReq = Buffer.from([...convSeed(parseInt(seed)), parseInt(difficulty), 0, 0, 0, mapId, 0, 0, 0]);
  const mapReq = Buffer.from([70, 61, 86, 15, 2, 0, 0, 0, 103, 0, 0, 0]);
  console.log("Spawning process: " + localExe + " " + args.join(" ").toString());
  let scriptOutput: string = "";
  var child = spawn(localExe, args);
  const buffer = Buffer.from([...convSeed(seed), 2, 0, 0, 0, 104, 0, 0, 0]);
  child.stdin.write(buffer);
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", function (data) {
    data = data.toString();
    data = data.substr(1, data.length);
    scriptOutput += data;
    if (scriptOutput.length > 1) {
        console.log(`Windows exe done generation ${seed} ${difficulty} ${mapId}`);
        console.log(scriptOutput);
        child.kill(9);
    }
  });

  
  //child.kill(9);
  
  console.log(scriptOutput);
  
  // child.stderr.setEncoding("utf8");
  // child.stderr.on("data", (data) => {
  //   console.error("Error detected running Windows exe: " + data);
  // });

}

function processStdOut(scriptOutput: string): MapApiResponse {
  let thisMap: MapApiResponse;
  try {
    thisMap = JSON.parse(scriptOutput);
  } catch (err) {
    console.error(err);
  }
  return thisMap;
}
