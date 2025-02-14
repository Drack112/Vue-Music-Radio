import log from "electron-log";
import { join } from "path";
import { app } from "electron";
import { isDev } from "./utils";

Object.assign(console, log.functions);

log.transports.file.level = "info";
log.transports.file.maxSize = 2 * 1024 * 1024; // 2M

if (log.transports.ipc) log.transports.ipc.level = false;

log.transports.file.format = "{y}-{m}-{d} {h}:{i}:{s}:{ms} {text}";

if (isDev) {
  log.transports.file.resolvePathFn = () => join(app.getPath("documents"), "logs/log.txt");
} else {
  log.transports.file.level = false;
}

log.info("Logger initialized");

export default log;
