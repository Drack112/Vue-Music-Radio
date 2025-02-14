import { app, shell, BrowserWindow, BrowserWindowConstructorOptions } from "electron";

class MainProcess {
  mainWindow: BrowserWindow | null = null;

  isQuit: boolean = false;

  constructor() {
    if (!app.requestSingleInstanceLock()) {
      console.log("Num da");
      app.quit();
      process.exit(0);
    } else this.showWindow();

    app.on("ready", async () => {
      console.info("🚀 Application Process Startup");
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
