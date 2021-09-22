import { config } from "dotenv";
import * as fs from "fs";
import path from "path";
import TelegramBot from "node-telegram-bot-api";
config();

const TELEGRAM_KEY = process.env.TELEGRAM_KEY || "";
const bot = new TelegramBot(TELEGRAM_KEY, { polling: true });

let currentDirectory = "E:\\";

bot.on("message", handleOnMessage);

async function handleOnMessage(msg) {
  let response = {
    type: "default",
    message: null,
  };
  try {
    if (msg.text.split(" ").length === 1) {
      response.message = await command(msg.text);
    } else if (msg.text.split(" ")[0] === "cd") {
      response = await changeDirectory(
        msg.text
          .split(" ")
          .filter((item) => item !== "cd")
          .join(" ")
          .trim()
      );
    }
    switch (response.type) {
      case "video":
        bot.sendVideo(msg.chat.id, response.message);
        break;

      default:
        bot.sendMessage(msg.chat.id, response.message || "Error!");
        break;
    }
  } catch {
    bot.sendMessage(msg.chat.id, "Error!");
  }
}

async function getDirectoryList(path) {
  try {
    const list = await fs.readdirSync(path);
    return list.join(`\n`);
  } catch (error) {
    return "Error!";
  }
}

async function changeDirectory(key) {
  try {
    switch (key) {
      case "..":
        const arr = currentDirectory.split("\\");
        arr.pop();
        currentDirectory = arr.join("\\");
        return {
          type: "default",
          message: `Current directory: "${currentDirectory}"`,
        };
      default:
        const newDirecotory = `${currentDirectory}\\${key}`;
        await fs.statSync(newDirecotory);
        if (key.match(/\.[0-9a-z]+$/i)) {
          const file = await fs.readFileSync(newDirecotory);
          return {
            type: "video",
            message: file,
          };
        }
        currentDirectory = newDirecotory;
        return {
          type: "default",
          message: currentDirectory,
        };
    }
  } catch {
    return "Error!";
  }
}

async function command(type) {
  switch (type) {
    case "current":
      return `Current directory: "${currentDirectory}"`;
    case "ls":
      const list = await getDirectoryList(currentDirectory);
      return list;
    default:
      return "Неизвестная команда!";
  }
}

// fs.stat(currentDirectory, (err) => {
//   if (err) {
//     console.log("err");
//   }
//   console.log("hi");
// });
