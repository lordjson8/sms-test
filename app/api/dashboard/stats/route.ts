import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total contacts
    const totalContacts = await prisma.contact.count()

    // Get total sent messages
    const totalSent = await prisma.smsLog.count()

    // Get messages sent today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sentToday = await prisma.smsLog.count({
      where: {
        sentAt: {
          gte: today,
        },
      },
    })

    // Calculate delivery rate
    const deliveredCount = await prisma.smsLog.count({
      where: {
        status: "delivered",
      },
    })
    const deliveryRate = totalSent > 0 ? Math.round((deliveredCount / totalSent) * 100) : 0

    // Get recent logs
    const recentLogs = await prisma.smsLog.findMany({
      take: 5,
      orderBy: {
        sentAt: "desc",
      },
      include: {
        category: true,
      },
    })

    // Get category stats
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            contacts: true,
            smsLogs: true,
          },
        },
      },
    })

    const categoryStats = categories.map((cat) => ({
      name: cat.name,
      contactCount: cat._count.contacts,
      messageCount: cat._count.smsLogs,
    }))

    return NextResponse.json({
      totalContacts,
      totalSent,
      sentToday,
      deliveryRate,
      recentLogs,
      categoryStats,
    })
  } catch (error) {
    console.error("[v0] Get dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
