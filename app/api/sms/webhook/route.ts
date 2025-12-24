import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()
    const messageSid = body.get("MessageSid") as string
    const messageStatus = body.get("MessageStatus") as string

    if (!messageSid || !messageStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update the SMS log status
    await prisma.smsLog.updateMany({
      where: { twilioSid: messageSid },
      data: { status: messageStatus },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
