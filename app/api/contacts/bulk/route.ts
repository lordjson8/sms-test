import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { validatePhoneNumber, formatPhoneNumber } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { contacts } = await request.json()

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: "Contacts array is required" }, { status: 400 })
    }

    const validContacts = contacts
      .map((contact) => {
        const formattedPhone = formatPhoneNumber(contact.phoneNumber)
        if (!validatePhoneNumber(formattedPhone)) return null
        return {
          phoneNumber: formattedPhone,
          categoryId: Number.parseInt(contact.categoryId),
        }
      })
      .filter(Boolean)

    await prisma.contact.createMany({
      data: validContacts as any,
      skipDuplicates: true,
    })

    return NextResponse.json({ success: true, count: validContacts.length }, { status: 201 })
  } catch (error) {
    console.error("[v0] Bulk create contacts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
