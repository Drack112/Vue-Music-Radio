import log from "./logger";
import Store from "electron-store";

log.info("🌱 Store init");

export interface StoreType {
  window: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
  proxy: string;
}

export const initStore = () => {
  return new Store<StoreType>({
    defaults: {
      window: {
        width: 1280,
        height: 800,
      },
      proxy: "",
    },
  });
};
