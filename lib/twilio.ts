import twilio from "twilio"

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials are not configured")
  }

  return twilio(accountSid, authToken)
}

export function getTwilioPhoneNumber() {
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER

  if (!phoneNumber) {
    throw new Error("Twilio phone number is not configured")
  }

  return phoneNumber
}
