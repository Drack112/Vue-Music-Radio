import { is } from "@electron-toolkit/utils";
import { app } from "electron";

export const isDev = is.dev;
export const isWin = process.platform === "win32";
export const isMac = process.platform === "darwin";
export const isLinux = process.platform === "linux";

export const appName = app.getName() || "Vue Tube";
