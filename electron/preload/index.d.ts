import { ElectronApp } from "@electron-toolkit/utils";

declare global {
  interface Window {
    electron: ElectronApp;
    api: unknown;
  }
}
