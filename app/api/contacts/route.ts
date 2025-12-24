import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { validatePhoneNumber, formatPhoneNumber } from "@/lib/validation"

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contacts = await prisma.contact.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("[v0] Get contacts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { phoneNumber, categoryId } = await request.json()

    if (!phoneNumber || !categoryId) {
      return NextResponse.json({ error: "Phone number and category are required" }, { status: 400 })
    }

    const formattedPhone = formatPhoneNumber(phoneNumber)

    if (!validatePhoneNumber(formattedPhone)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Use E.164 format (e.g., +1234567890)" },
        { status: 400 },
      )
    }

    const contact = await prisma.contact.create({
      data: {
        phoneNumber: formattedPhone,
        categoryId: Number.parseInt(categoryId),
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error("[v0] Create contact error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 })
    }

    await prisma.contact.delete({
      where: { id: Number.parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete contact error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
