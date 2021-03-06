import { CanvasRenderingContext2D } from "canvas";
import path = require("path");
import { Level, ObjectType } from "../../types/level.type";
import { RequestConfig } from "../../types/RequestConfig";
import { drawCircle, drawText, drawImageOutline } from "./drawPrimatives";

export async function drawQuestItems(
  ctx: CanvasRenderingContext2D,
  levelData: Level,
  scale: number,
  reqConfig: RequestConfig
) {
  // this part adds the special objects (doors, waypoints etc)
  levelData.objects.forEach((mapObject) => {
    let x = mapObject.x * scale + scale - 1.5;
    let y = mapObject.y * scale + scale + 0.4;
    //quest items adding a green circle
    switch (mapObject.name) {
      case "orifice": // act 2 orifice
        if (reqConfig.showTextLabels) {
          drawText(ctx, x - 5, y + 5, 14, "Orifice", "#FFFFFF");
        }
        drawCircle(ctx, x, y - 10, 20, "#00FF00");
        break;
      case "gidbinn altar":
        if (levelData.id != 75) {
          if (reqConfig.showTextLabels) {
            drawText(ctx, x - 5, y + 5, 14, "Gidbinn Altar", "#FFFFFF");
          }
          drawCircle(ctx, x, y, 20, "#00FF00");
        }
        break;
      case "Hellforge": // act 4 hellforge
        if (reqConfig.showTextLabels) {
          drawText(ctx, x + 5, y - 5, 14, "Hellforge", "#FFFFFF");
        }
        drawCircle(ctx, x + 10, y - 10, 20, "#00FF00");
        break;
      case "cagedwussie1": // prisoners act 5
        if (reqConfig.showTextLabels) {
          drawText(ctx, x, y, 14, "Caged Barbs", "#FFFFFF");
        }
        drawImageOutline(
          ctx,
          x + 75,
          y + 63,
          path.join(__dirname, "../../../build/static/barbprison.png"),
          44,
          30,
          "#00FF00"
        );
        break;
    }

    if (mapObject.name == "Tome") {
      // arcane summoner
      drawImageOutline(
        ctx,
        x - 60,
        y - 25,
        path.join(__dirname, "../../../build/static/pedastal.png"),
        40,
        60,
        "#00FF00"
      );
    }

    if (mapObject.name == "LamTome") {
      // lam essens tome
      drawImageOutline(
        ctx,
        x,
        y,
        path.join(__dirname, "../../../build/static/pedastal.png"),
        20,
        30,
        "#00FF00"
      );
    }

    if (mapObject.name == "Inifuss") {
      // tree
      drawImageOutline(
        ctx,
        x - 25,
        y + 23,
        path.join(__dirname, "../../../build/static/inifusstree.png"),
        30,
        50,
        "#00FF00"
      );
    }

    if (mapObject.name == "taintedsunaltar") {
      // claw viper temple 2 altar
      drawImageOutline(
        ctx,
        x - 10,
        y + 10,
        path.join(__dirname, "../../../build/static/clawviperaltar.png"),
        40,
        40,
        "#00FF00"
      );
    }

    if (mapObject.name == "Seal") {
      // chaos sanctuary seal
      drawImageOutline(
        ctx,
        x - 5,
        y + 15,
        path.join(__dirname, "../../../build/static/seal.png"),
        30,
        30,
        "#00FF00"
      );
    } 

    // anya
    if (mapObject.type == ObjectType.NPC) {
      if (
        levelData.name == "Cellar of Pity" ||
        levelData.name == "Frozen River"
      ) {
        if (reqConfig.showTextLabels) {
          drawText(ctx, x, y, 14, "Anya", "#FFFFFF");
        }
        drawCircle(ctx, x+10, y - 10, 20, "#00FF00");
      }
    }
  });

  levelData.objects.map((mapObject) => {
    let x = mapObject.x * scale;
    let y = mapObject.y * scale;
    // drawn stones
    switch (mapObject.name) {
      case "StoneTheta":
      case "StoneBeta":
      case "StoneAlpha":
      case "StoneLambda":
        drawImageOutline(
          ctx,
          x - 18,
          y + 18,
          path.join(__dirname, "../../../build/static/stone.png"),
          scale * 4,
          scale * 13,
          "#00FF00"
        );
        break;
    }
  });

  levelData.objects.map((mapObject) => {
    let x = mapObject.x * scale;
    let y = mapObject.y * scale;
    // drawn stones
    switch (mapObject.name) {
      case "StoneGamma":
      case "StoneDelta":
        drawImageOutline(
          ctx,
          x - 18,
          y + 18,
          path.join(__dirname, "../../../build/static/stone.png"),
          scale * 4,
          scale * 13,
          "#00FF00"
        );
        break;
    }
  });
}
