import { execSync } from "child_process";
import * as express from "express";
import { param } from "express-validator";
var http = require('http');
import * as fs from 'fs';
import * as path from 'path';
import { testInstallation } from "../data/testInstallation";

import { mapData, mapImage, prefetch } from "./routes";

const uest = require('uest')
const bodyParser = require('body-parser');
const { registerFont } = require('canvas')
var morgan = require('morgan')
const moment = require('moment-timezone')
var clc = require("cli-color");

const D2_GAME_FILES = process.env.D2_GAME_FILES || "./game";
if (!fs.existsSync("./cache")) {
  fs.mkdirSync("./cache")
}

// log all errors to file
fs.writeFileSync('./cache/access.log', "");
var accessLogStream = fs.createWriteStream('./cache/access.log', { flags: 'a' })

const app = express();
const PORT = process.env.PORT || 3002;

var server = http.createServer(app);
server.on('error', function (e) {
  console.log(e)
  exit()
});
server.listen(PORT, async () => {

  console.log(clc.blue.bold(`D2-mapserver v13 launching...`));
  const generationQueue = './cache/queue.txt'
  if (fs.existsSync(generationQueue)) {
    fs.unlinkSync(generationQueue);
  }

  // delete cache json files
  console.log(`Cleaning up cache files...`);
  const filenames = fs.readdirSync("./cache");
  filenames.forEach(file => {
    if (file.endsWith('.json')) {
      fs.unlinkSync("./cache/" + file);
    }
  });

  // if in docker, setup wine
  if (process.env.WINEARCH) {
    if (!fs.existsSync("/app/game/Fog.dll")) {
      console.error("Fog.dll not found in /app/game, check your game files volume path");
      process.exit();
    }
    const fontFile = path.resolve("./build/static/Roboto-Regular.ttf");
    const fontFileBold = path.resolve("./build/static/Roboto-Bold.ttf");
    const fontFileExocet = path.resolve("./build/static/exocetblizzardot-medium.otf");
    const fontFileSC = path.resolve("./build/static/NotoSansSC-Regular.otf");
    const fontFileKR = path.resolve("./build/static/NotoSansKR-Regular.otf");
    
    if (fs.existsSync(fontFile)) {
      
      console.log("Adding font " + fontFileExocet);
      registerFont(fontFileExocet, { family: 'ExocetBlizzardMixedCapsOTMedium', weight: 'bold' })
      registerFont(fontFileExocet, { family: 'ExocetBlizzardMixedCapsOTMedium' })
      console.log("Adding font " + fontFileSC);
      registerFont(fontFileSC, { family: 'Noto Sans Simplified Chinese', weight: 'regular' })
      console.log("Adding font " + fontFileKR);
      registerFont(fontFileKR, { family: 'Noto Sans Korean', weight: 'regular' })
      console.log("Adding font " + fontFile);
      registerFont(fontFile, { family: 'Roboto' })
      console.log("Adding font " + fontFileBold);
      registerFont(fontFileBold, { family: 'Roboto', weight: 'bold' })
      
    }
    console.log(`Setting up wine config...`);
    execSync("winecfg", { env: { WINEPREFIX: '/app/wine_d2', WINEDEBUG: '-all,fixme-all', WINEARCH: 'win32' } });
  } else {
    if (!fs.existsSync(path.join(D2_GAME_FILES, "Fog.dll"))) {
      console.error(clc.redBright.bold("ERROR: Did not find the Diablo 2 LoD files in the expected location"));
      console.error(clc.redBright("Expected game files in this folder: " + path.resolve(D2_GAME_FILES)));
      console.error(clc.redBright("You can configure the folder with the command " + clc.white("'set D2_GAME_FILES=D:\\Games\\Diablo 2'")));
      console.error("Exiting....");
      exit();
    } else {
      console.log(clc.green("Found D2 LoD game files " + D2_GAME_FILES));
    }
    
    // if (!fs.existsSync(path.join(__dirname, "../static"))) {
    //   console.error(clc.redBright("Did not find static files in build folder"));
    //   console.error("Exiting....");
    //   exit();
    // }
    let localExe = path.dirname(process.execPath) + "/bin/d2-map.exe";
    if (!fs.existsSync(localExe)) {
      localExe = path.join(__dirname, "../../bin/d2-map.exe");
    }
    if (!fs.existsSync(localExe)) {
      console.error(clc.redBright.bold("ERROR: Did not find ./bin/d2-map.exe, please restore this file from the original download"));
      console.error("Exiting....");
      exit();
    } else {
      console.log(clc.green("Found bin/d2-map.exe tool " + path.join(__dirname, "../../bin/d2-map.exe")));
    }
    const result = await testInstallation();
    if (result) { 
      console.error(clc.redBright.bold(`ERROR: Error generating map data, here is a raw dump of the logs:`));
      console.error(result);
      console.error("Please refer to the below troubleshooting guide: (ctrl+click link to open)");
      console.error(clc.underline(`https://github.com/joffreybesos/d2r-mapview/wiki/Setup-guide#troubleshooting`));
      exit();
    }
  }
  console.log(`You can test this server by opening this link in your browser: (ctrl+click link to open)`);
  console.log(clc.underline(`http://localhost:3002/v1/map/12345/2/129/image?edge=true&isometric=true`));
  console.log(`For troubleshooting refer to ` + clc.underline(`https://github.com/joffreybesos/d2r-mapview/wiki/Setup-guide#troubleshooting`));
  console.log(`If you close this window the map server will shut down.`);
  console.log(`Download latest map hack from ` + clc.underline(`https://github.com/joffreybesos/d2r-mapview/releases/latest`));
  console.log(clc.green.bold(`Successfully started map server, you can now minimise this window and run d2r-map-vx.x.x.exe`));
  console.log(clc.green.bold(`Running on http://localhost:${PORT}`));
});

// Add headers before the routes are defined
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// log all HTTP errors
app.use(morgan('combined', {
  skip: function (req, res) { return res.statusCode < 400 },
  stream: accessLogStream }));
app.use(uest())

app.get(
  "/v1/map/:seed/:difficulty/:mapid",
  param("seed").isNumeric(),
  param("difficulty").isNumeric(),
  param("mapid").isNumeric(),
  mapData
);

app.get(
  "/v1/map/:seed/:difficulty/:mapid/image",
  param("seed").isNumeric(),
  param("difficulty").isNumeric(),
  param("mapid").isNumeric(),
  mapImage
);

app.use(bodyParser.json());
app.post(
  "/v1/map/prefetch",
  prefetch
);

app.get('/health', (req, res) => {
  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date()
  }
  res.status(200).send(data);
});

process.on('uncaughtException', function(err) {
  exit();
});

function exit() {
  var start = new Date().getTime(), expire = start + 60000;
  while (new Date().getTime() < expire) { }
  process.exit();
}
