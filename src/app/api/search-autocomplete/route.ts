import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

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

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";
  console.log(
    "[api/search-autocomplete] host=%s url=%s q=%s enableSession=%s",
    req.headers.get("host"),
    req.nextUrl.toString(),
    q,
    process.env.FM_ENABLE_AUTOCOMPLETE_SESSION === "1"
  );

  if (!q) {
    return NextResponse.json({
      suggestions: [],
      recentOrders: [],
    });
  }

  const session = await getServerSession(authOptions);

  const suggestions = ALL_ITEMS.filter((item) =>
    item.toLowerCase().includes(q)
  ).slice(0, 5);

  const recentOrders = session
    ? MOCK_RECENT_ORDERS.filter((order) =>
        order.title.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  return NextResponse.json({
    suggestions,
    recentOrders,
  });
}
