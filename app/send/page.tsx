"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: number
  name: string
  _count?: { contacts: number }
}

export default function SendPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    setLoading(true)
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()

      // Get contact counts for each category
      const contactsResponse = await fetch("/api/contacts")
      const contacts = await contactsResponse.json()

      const categoriesWithCounts = data.map((cat: Category) => ({
        ...cat,
        _count: { contacts: contacts.filter((c: any) => c.categoryId === cat.id).length },
      }))

      setCategories(categoriesWithCounts)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    if (message.length > 1600) {
      toast({
        title: "Error",
        description: "Message is too long (max 1600 characters)",
        variant: "destructive",
      })
      return
    }

    setSending(true)

    try {
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          categoryId: selectedCategory === "all" ? null : Number.parseInt(selectedCategory),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send messages")
      }

      toast({
        title: "Success",
        description: `Sent ${data.count} message(s) successfully`,
      })

      setMessage("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send messages",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const recipientCount = categories.find((c) => c.id.toString() === selectedCategory)?._count?.contacts || 0
  const allContactsCount = categories.reduce((sum, cat) => sum + (cat._count?.contacts || 0), 0)
  const totalRecipients = selectedCategory === "all" ? allContactsCount : recipientCount

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Send SMS</h1>
          <p className="text-muted-foreground">Compose and send messages to your contacts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>Select recipients and write your message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Recipients</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts ({allContactsCount})</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name} ({cat._count?.contacts || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message">Message</Label>
                <span className="text-xs text-muted-foreground">{message.length} / 1600 characters</span>
              </div>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows={8}
                maxLength={1600}
              />
            </div>

            {totalRecipients === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No contacts found in selected category. Add contacts first.</AlertDescription>
              </Alert>
            )}

            {totalRecipients > 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">Ready to send</p>
                <p className="text-sm text-muted-foreground">
                  This message will be sent to {totalRecipients} recipient{totalRecipients !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            <Button
              onClick={handleSend}
              disabled={sending || totalRecipients === 0 || !message.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Make sure you have configured your Twilio credentials in the environment variables before sending messages.
          </AlertDescription>
        </Alert>
      </div>
    </AppLayout>
  )
}
