import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { getTwilioClient, getTwilioPhoneNumber } from "@/lib/twilio"

// Rate limiting: Store last send time in memory (in production, use Redis)
let lastSendTime = 0
const RATE_LIMIT_MS = 5000 // 5 seconds between sends

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting
    const now = Date.now()
    if (now - lastSendTime < RATE_LIMIT_MS) {
      return NextResponse.json(
        {
          error: `Please wait ${Math.ceil((RATE_LIMIT_MS - (now - lastSendTime)) / 1000)} seconds before sending again`,
        },
        { status: 429 },
      )
    }

    const { message, categoryId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get contacts
    const contacts = await prisma.contact.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        category: true,
      },
    })

    if (contacts.length === 0) {
      return NextResponse.json({ error: "No contacts found" }, { status: 400 })
    }

    // Initialize Twilio
    const client = getTwilioClient()
    const fromNumber = getTwilioPhoneNumber()

    // Send messages
    const results = await Promise.allSettled(
      contacts.map(async (contact) => {
        try {
          const twilioMessage = await client.messages.create({
            body: message,
            from: fromNumber,
            to: contact.phoneNumber,
          })

          // Log to database
          await prisma.smsLog.create({
            data: {
              recipient: contact.phoneNumber,
              message,
              status: twilioMessage.status,
              categoryId: contact.categoryId,
              twilioSid: twilioMessage.sid,
            },
          })

          return { success: true, sid: twilioMessage.sid }
        } catch (error: any) {
          // Log failed attempt
          await prisma.smsLog.create({
            data: {
              recipient: contact.phoneNumber,
              message,
              status: "failed",
              categoryId: contact.categoryId,
            },
          })

          throw error
        }
      }),
    )

    lastSendTime = now

    const successful = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    return NextResponse.json({
      success: true,
      count: successful,
      failed,
      total: contacts.length,
    })
  } catch (error: any) {
    console.error("[v0] Send SMS error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
