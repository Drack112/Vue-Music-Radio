import { app, shell, BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import * as path from "path";

class MainProcess {
  mainWindow: BrowserWindow | null = null;

  isQuit: boolean = false;

  constructor() {
    if (!app.requestSingleInstanceLock()) {
      console.log("Num da");
      app.quit();
      process.exit(0);
    } else {
      app.on("ready", async () => {
        console.info("🚀 Application Process Startup");
        this.createWindow();
      });
    }
  }

  private createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"), // Adjust the path to your preload script if needed
      },
    });

    this.mainWindow.loadFile(path.join(__dirname, "index.html")); // Adjust the path to your HTML file if needed

    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });
  }

  private showWindow() {
    if (this.mainWindow) {
      this.mainWindow.show();
      if (this.mainWindow.isMinimized()) this.mainWindow.restore();
      this.mainWindow.focus();
    }
  }
}

export default new MainProcess();
