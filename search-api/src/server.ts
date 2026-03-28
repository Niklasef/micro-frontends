import Fastify from "fastify";
import searchAutocompleteRoute from "./routes/searchAutocomplete.js";

const server = Fastify({
  logger: true,
});

server.register(searchAutocompleteRoute);

async function start() {
  try {
    await server.listen({
      port: Number(process.env.PORT) || 3001,
      host: "0.0.0.0",
    });
    server.log.info(`Server listening on ${(server.server.address() as any).port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();

export default server;
