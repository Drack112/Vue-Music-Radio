import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin, loadEnv } from "electron-vite";
import { MainEnv } from "./env";

import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import viteCompression from "vite-plugin-compression";
import wasm from "vite-plugin-wasm";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";

export default defineConfig(({ command, mode }) => {
  const getEnv = (name: keyof MainEnv): string => {
    return loadEnv(mode, process.cwd())[name];
  };

  console.log(command);

  const webPort = Number(getEnv("VITE_WEB_PORT"));
  const serverPort = Number(getEnv("VITE_SERVER_PORT"));

  return {
    main: {
      plugins: [externalizeDepsPlugin()],
      build: {
        publicDir: resolve(__dirname, "public"),
        rollupOptions: {
          input: {
            index: resolve(__dirname, "electron/main/index.ts"),
            // lyric: resolve(__dirname, "web/lyric.html"),
            // loading: resolve(__dirname, "web/loading.html"),
          },
        },
      },
    },
    preload: {
      plugins: [externalizeDepsPlugin()],
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, "electron/preload/index.ts"),
          },
        },
      },
    },
    plugins: [
      vue(),
      AutoImport({
        imports: [
          "vue",
          "vue-router",
          "@vueuse/core",
          {
            "naive-ui": ["useDialog", "useMessage", "useNotification", "useLoadingBar"],
          },
        ],
        eslintrc: {
          enabled: true,
          filepath: "./auto-eslint.mjs",
        },
      }),
      Components({
        resolvers: [NaiveUiResolver()],
      }),
      viteCompression(),
      wasm(),
    ],
  };
});
