import "./env.js";               // load .env / .env.local first
import Fastify from "fastify";
import cors from "@fastify/cors";
import searchAutocompleteRoute from "./routes/searchAutocomplete.js";

const server = Fastify({
  logger: true,
});

/* enable CORS so the Astro dev/preview server (http://localhost:4321) can call the API */
server.register(cors, {
  /* allow all origins in dev; tighten for production as needed */
  origin: true,
  credentials: true,
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
