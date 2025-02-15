import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import log from "../../main/logger";
import NeteaseCloudMusicAPi from "NeteaseCloudMusicApi";
import { pathCase } from "change-case";

const getHandler = (name: string, neteaseApi: (params: any) => any) => {
  return async (
    req: FastifyRequest<{ Querystring: { [key: string]: string } }>,
    reply: FastifyReply,
  ) => {
    log.info("🌐 Request NcmAPI:", name);

    try {
      const result = await neteaseApi({
        ...req.query,
        ...(req.body as Record<string, any>),
        cookie: req.cookies,
      });
      return reply.send(result.body);
    } catch (error: any) {
      log.error("❌ NcmAPI Error:", error);
      if ([400, 301].includes(error.status)) {
        return reply.status(error.status).send(error.body);
      }
      return reply.status(500);
    }
  };
};

const initNcmApi = async (fastify: FastifyInstance) => {
  fastify.get("/netease", (_, reply) => {
    reply.send({
      version: "4.25.0",
      description: "网易云音乐 Node.js API service",
      author: "@binaryify",
      license: "MIT",
      url: "https://gitlab.com/Binaryify/neteasecloudmusicapi",
    });
  });

  Object.entries(NeteaseCloudMusicAPi).forEach(([routerName, neteaseApi]: [string, any]) => {
    if (["serveNcmApi", "getModulesDefinitions"].includes(routerName)) return;

    const pathName = pathCase(routerName);
    const handler = getHandler(pathName, neteaseApi);

    fastify.get(`/netease/${pathName}`, handler);
    fastify.post(`/netease/${pathName}`, handler);

    if (routerName.includes("_")) {
      fastify.get(`/netease/${routerName}`, handler);
      fastify.post(`/netease/${routerName}`, handler);
    }
  });

  log.info("🌐 Register NcmAPI successfully");
};

export default initNcmApi;
