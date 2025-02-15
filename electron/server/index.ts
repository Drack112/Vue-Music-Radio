import fastifyCookie from "@fastify/cookie";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastify from "fastify";
import log from "../main/logger";
import { join } from "path";
import { isDev } from "../main/utils";
import initNcmApi from "./netease";
import initUnblockAPI from "./unblock";

const initAppServer = async () => {
  try {
    const server = fastify({
      ignoreTrailingSlash: true,
    });

    server.register(fastifyCookie);
    server.register(fastifyMultipart);

    if (!isDev) {
      log.info("📂 Serving static files from /renderer");
      server.register(fastifyStatic, {
        root: join(__dirname, "../renderer"),
      });
    }

    server.get("/api", (_, reply) => {
      reply.send({
        name: "Vue Tube API",
        description: "Vue Tube API service",
        author: "@drack112",
        list: [
          {
            name: "NeteaseCloudMusicApi",
            url: "/api/netease",
          },
          {
            name: "UnblockAPI",
            url: "/api/unblock",
          },
        ],
      });
    });

    server.register(initNcmApi, { prefix: "/api" });
    server.register(initUnblockAPI, { prefix: "/api" });

    const port = Number(import.meta.env["VITE_SERVER_PORT"] || 25884);
    await server.listen({ port });
    log.info(`🌐 Starting AppServer on port ${port}`);
    return server;
  } catch (error) {
    log.error("🚫 AppServer failed to start");
    throw error;
  }
};

export default initAppServer;
