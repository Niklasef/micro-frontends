import { NextRequest, NextResponse } from "next/server";

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

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";

  if (!q) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = ALL_ITEMS.filter((item) =>
    item.toLowerCase().includes(q)
  ).slice(0, 5);

  return NextResponse.json({ suggestions });
}
