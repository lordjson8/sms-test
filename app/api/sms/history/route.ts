import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    if (categoryId && categoryId !== "all") {
      where.categoryId = Number.parseInt(categoryId)
    }

    if (startDate) {
      where.sentAt = { gte: new Date(startDate) }
    }

    if (endDate) {
      where.sentAt = { ...where.sentAt, lte: new Date(endDate) }
    }

    const logs = await prisma.smsLog.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        sentAt: "desc",
      },
      take: 100, // Limit to last 100 messages
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error("[v0] Get SMS history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
