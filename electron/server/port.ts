import getPort from "get-port";

let webPort: number;
let serverPort: number;

const getSafePort = async () => {
  if (webPort && serverPort) return { webPort, serverPort };
  webPort = await getPort({ port: 14558 });
  serverPort = await getPort({ port: 25884 });
  return { webPort, serverPort };
};

export default getSafePort;
