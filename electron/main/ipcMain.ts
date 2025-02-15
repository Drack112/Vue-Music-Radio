import { app, BrowserWindow, ipcMain, powerSaveBlocker } from "electron";
import { isDev } from "./utils";
import log from "./logger";
import { StoreType } from "./store";
import Store from "electron-store";

const initIpcMain = (
  win: BrowserWindow | null,
  loadingWin: BrowserWindow | null,
  store: Store<StoreType>,
) => {
  initWinIpcMain(win, loadingWin, store);
  initStoreIpcMain(store);
};

const initStoreIpcMain = (store: Store<StoreType>): void => {
  if (!store) return;
};

const initWinIpcMain = (
  win: BrowserWindow | null,
  loadingWin: BrowserWindow | null,
  store: Store<StoreType>,
) => {
  let preventId: number | null = null;

  // Current window state
  ipcMain.on("win-state", (ev) => {
    ev.returnValue = win?.isMaximized();
  });

  // Loading complete
  ipcMain.on("win-loaded", () => {
    if (loadingWin && !loadingWin.isDestroyed()) loadingWin.close();
    win?.show();
    win?.focus();
  });

  // Minimize
  ipcMain.on("win-min", (ev) => {
    ev.preventDefault();
    win?.minimize();
  });
  // Maximize
  ipcMain.on("win-max", () => {
    win?.maximize();
  });
  // Restore
  ipcMain.on("win-restore", () => {
    win?.restore();
  });
  // Close
  ipcMain.on("win-close", (ev) => {
    ev.preventDefault();
    win?.close();
    app.quit();
  });
  // Hide
  ipcMain.on("win-hide", () => {
    win?.hide();
  });
  // Show
  ipcMain.on("win-show", () => {
    win?.show();
  });
  // Reload
  ipcMain.on("win-reload", () => {
    app.quit();
    app.relaunch();
  });

  // Dev tools
  ipcMain.on("open-dev-tools", () => {
    win?.webContents.openDevTools({
      title: "Vue Tube DevTools",
      mode: isDev ? "right" : "left",
    });
  });

  ipcMain.on("prevent-sleep", (_, val: boolean) => {
    if (val) {
      preventId = powerSaveBlocker.start("prevent-display-sleep");
      log.info("✅ System sleep prevention stopped");
    } else {
      if (preventId !== null) {
        powerSaveBlocker.stop(preventId);
        log.info("✅ System sleep prevention stopped");
      }
    }
  });

  ipcMain.on("reset-setting", () => {
    store.reset();
    log.info("✅ Reset setting successfully");
  });
};

export default initIpcMain;
