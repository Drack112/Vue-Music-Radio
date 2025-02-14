import { app, BrowserWindow, ipcMain } from "electron";

const initIpcMain = (win: BrowserWindow | null, loadingWin: BrowserWindow | null) => {
  initWinIpcMain(win, loadingWin);
};

const initWinIpcMain = (win: BrowserWindow | null, loadingWin: BrowserWindow | null) => {
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
};

export default initIpcMain;
