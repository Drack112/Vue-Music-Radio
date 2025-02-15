import axios from "axios";
import log from "../../main/logger";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import getKuwoSongUrl from "./kuwo";

const getNeteaseSongUrl = async (id: number | string) => {
  try {
    if (!id) return { code: 404, url: null };
    const baseUrl = "https://music-api.gdstudio.xyz/api.php";
    const result = await axios.get(baseUrl, {
      params: { types: "url", id },
    });
    const songUrl = result.data.url;
    log.info("🔗 NeteaseSongUrl URL:", songUrl);
    return { code: 200, url: songUrl };
  } catch (error) {
    log.error("❌ Get NeteaseSongUrl Error:", error);
    return { code: 404, url: null };
  }
};

const UnblockAPI = async (fastify: FastifyInstance) => {
  fastify.get("/unblock", (_, reply) => {
    reply.send({
      name: "UnblockAPI",
      description: "Vue Tube UnblockAPI service",
      author: "@drack112",
      content:
        "部分接口采用 @939163156 by GD音乐台(music.gdstudio.xyz)，仅供本人学习使用，不可传播下载内容，不可用于商业用途。",
    });
  });

  fastify.get(
    "unblock/netease",
    async (
      req: FastifyRequest<{ Querystring: { [key: string]: string } }>,
      reply: FastifyReply,
    ) => {
      const { id } = req.query;
      const result = await getNeteaseSongUrl(id);
      return reply.send(result);
    },
  );

  fastify.get(
    "/unblock/kuwo",
    async (
      req: FastifyRequest<{ Querystring: { [key: string]: string } }>,
      reply: FastifyReply,
    ) => {
      const { keyword } = req.query;
      const result = await getKuwoSongUrl(keyword);
      return reply.send(result);
    },
  );

  log.info("🌐 Register UnblockAPI successfully");
};

export default UnblockAPI;
