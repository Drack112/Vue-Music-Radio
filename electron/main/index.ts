import { app, BrowserWindow, BrowserWindowConstructorOptions, shell } from "electron";
import log from "./logger";
import { electronApp } from "@electron-toolkit/utils";
import initIpcMain from "./ipcMain";
import Store from "electron-store";
import { initStore, StoreType } from "./store";
import { join } from "path";
import { appName, isDev, isMac } from "./utils";

class MainProcess {
  // Windows
  mainWindow: BrowserWindow | null = null;
  loadingWindow: BrowserWindow | null = null;

  // Store
  store: Store<StoreType> | null = null;

  // Helper
  isQuit: boolean = false;

  constructor() {
    if (!app.requestSingleInstanceLock()) {
      log.error("❌ There is already a program running and this process is terminated");
      app.quit();
      process.exit(0);
    } else this.showWindow();

    app.on("ready", async () => {
      log.info("🚀 Application Process Startup");
      electronApp.setAppUserModelId("com.drack.vueplayer");

      // Define store
      this.store = initStore();

      // Functions
      this.createLoadingWindow();
      this.createMainWindow();
      this.handleAppEvents();
      this.handleWindowEvents();

      // run main view
      initIpcMain(this.mainWindow, this.loadingWindow);
    });
  }

  private createWindow(options: BrowserWindowConstructorOptions = {}): BrowserWindow {
    const defaultOptions: BrowserWindowConstructorOptions = {
      title: appName,
      width: 1280,
      height: 720,
      frame: false,
      center: true,

      webPreferences: {
        preload: join(__dirname, "../preload/index.mjs"),
        sandbox: false,
        webSecurity: false,
        allowRunningInsecureContent: true,
        spellcheck: false,
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        contextIsolation: false,
      },
    };

    options = Object.assign(defaultOptions, options);
    const win = new BrowserWindow(options);
    return win;
  }

  private createLoadingWindow() {
    this.loadingWindow = this.createWindow({
      width: 800,
      height: 560,
      maxWidth: 800,
      maxHeight: 560,
      resizable: false,
    });

    this.loadingWindow.loadFile(join(__dirname, "../main/web/loading.html"));
  }

  private createMainWindow() {
    const options: BrowserWindowConstructorOptions = {
      width: this.store?.get("window").width,
      height: this.store?.get("window").height,
      minHeight: 800,
      minWidth: 1280,
      titleBarStyle: "customButtonsOnHover",
      show: false,
    };

    this.mainWindow = this.createWindow(options);

    if (isDev && process.env["ELECTRON_RENDERER_URL"]) {
      this.mainWindow?.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
      const port = Number(import.meta.env["VITE_SERVER_PORT"] || 25884);
      this.mainWindow?.loadURL(`http://127.0.0.1:${port}`);
    }

    if (this.store?.get("proxy")) {
      this.mainWindow?.webContents.session.setProxy({ proxyRules: this.store?.get("proxy") });
    }

    this.mainWindow?.webContents.setWindowOpenHandler((details) => {
      const { url } = details;
      if (url.startsWith("https://") || url.startsWith("http://")) {
        shell.openExternal(url);
      }
      return { action: "deny" };
    });
  }

  private showWindow() {
    if (this.mainWindow) {
      this.mainWindow.show();
      if (this.mainWindow.isMinimized()) this.mainWindow.restore();
      this.mainWindow.focus();
    }
  }

  //Atualiza o tamanho da janela
  private saveBounds() {
    if (this.mainWindow?.isFullScreen()) return;
    const bounds = this.mainWindow?.getBounds();
    if (bounds) this.store?.set("window", bounds);
  }

  handleAppEvents() {
    app.on("activate", () => {
      const allWindows = BrowserWindow.getAllWindows();
      if (allWindows.length) {
        allWindows[0].focus();
      } else {
        this.createMainWindow();
      }
    });

    app.on("window-all-closed", () => {
      if (!isMac) app.quit();
      this.mainWindow = null;
      this.loadingWindow = null;
    });

    app.on("second-instance", () => {
      this.showWindow();
    });

    // Protocolo personalizado
    app.on("open-url", (_, url) => {
      console.log("Received custom protocol URL:", url);
    });

    app.on("will-quit", () => {
      this.isQuit = true;
    });
  }

  handleWindowEvents() {
    this.mainWindow?.on("ready-to-show", () => {
      if (!this.mainWindow) return;
    });

    this.mainWindow?.on("focus", () => {
      if (this.mainWindow?.isFullScreen()) return;
      this.saveBounds();
    });

    this.mainWindow?.on("moved", () => {
      this.saveBounds();
    });

    this.mainWindow?.on("close", (event) => {
      event.preventDefault();
      if (this.isQuit) {
        app.exit();
      } else {
        this.mainWindow?.hide();
      }
    });
  }
}

export default new MainProcess();
