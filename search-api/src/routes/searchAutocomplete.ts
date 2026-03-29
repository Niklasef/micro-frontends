import { FastifyPluginAsync } from "fastify";
import { verifyToken } from "../auth.js";

const ALL_ITEMS = [
  "Product A",
  "Product B",
  "Product C",
  "Product D",
  "Product E",
  "Product F",
  "Category 1",
  "Category 2",
  "Camera Lens",
  "Camping Bag",
  "Coffee Mug",
];

const MOCK_RECENT_ORDERS = [
  {
    id: "ord-1001",
    title: "Coffee Mug",
    subtitle: "Ordered 2 days ago",
  },
  {
    id: "ord-1002",
    title: "Camping Bag",
    subtitle: "Ordered 1 week ago",
  },
  {
    id: "ord-1003",
    title: "Product B",
    subtitle: "Ordered 3 weeks ago",
  },
];

const searchAutocompleteRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get<{
    Querystring: { q?: string };
  }>("/search-autocomplete", async (request, reply) => {
    const q = request.query.q?.trim().toLowerCase() ?? "";

    if (!q) {
      return reply.send({ suggestions: [], recentOrders: [] });
    }

    const suggestions = ALL_ITEMS.filter((item) =>
      item.toLowerCase().includes(q),
    ).slice(0, 5);

    let recentOrders: typeof MOCK_RECENT_ORDERS = [];

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      fastify.log.info("No Authorization header supplied");
    }

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice("Bearer ".length);
      fastify.log.info({ token }, "Received bearer token");

      try {
        const payload = await verifyToken(token);
        fastify.log.info({ sub: payload.sub, exp: payload.exp }, "Token verified successfully");

        recentOrders = MOCK_RECENT_ORDERS.filter((order) =>
          order.title.toLowerCase().includes(q),
        ).slice(0, 3);
      } catch (err) {
        fastify.log.warn({ err }, "Token verification failed");
        // invalid / expired token – treat as unauthenticated
      }
    }

    return reply.send({ suggestions, recentOrders });
  });
};

export default searchAutocompleteRoute;
