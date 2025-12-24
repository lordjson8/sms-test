# SMS Management System

A personal mass SMS management web application built with Next.js, Prisma, SQLite, and Twilio.

## Features

- **Single User Authentication**: Secure login with bcrypt password hashing
- **Contact Management**: Add, organize, and categorize phone numbers
- **Bulk Import**: CSV upload support for importing multiple contacts
- **SMS Sending**: Send messages to all contacts or specific categories
- **Delivery Tracking**: Real-time status updates for sent messages
- **Activity History**: Complete log of all sent messages with filters
- **Dashboard**: Overview of contacts, messages, and delivery rates

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite with Prisma ORM
- **Authentication**: Session-based with bcrypt
- **SMS Service**: Twilio API
- **UI**: Shadcn/ui with Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Twilio account with credentials

### Installation

1. Clone the repository or download the ZIP file

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Run the database setup script
python scripts/setup-database.py

# Generate Prisma client
npx prisma generate
```

4. Configure environment variables:
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Twilio credentials:
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

7. Create your account (first user only) and start managing SMS campaigns!

## Configuration

### Twilio Webhook Setup

To receive delivery status updates, configure your Twilio webhook:

1. Go to your Twilio Console
2. Navigate to Phone Numbers → Your SMS Number
3. Set the "A MESSAGE COMES IN" webhook to: `https://your-domain.com/api/sms/webhook`
4. Set HTTP Method to `POST`

### CSV Import Format

For bulk contact import, use this CSV format:

```csv
phoneNumber,categoryId
+12345678901,1
+12345678902,2
+12345678903,1
```

- `phoneNumber`: E.164 format (e.g., +1234567890)
- `categoryId`: ID of an existing category

## Database Schema

- **User**: Single user authentication
- **Category**: Contact organization
- **Contact**: Phone numbers with categories
- **SmsLog**: Message history and delivery status

## Security Features

- Bcrypt password hashing
- HTTP-only session cookies
- Input validation for phone numbers (E.164 format)
- Rate limiting on SMS endpoint (5 seconds between sends)
- Single-user restriction (only first signup allowed)

## API Routes

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration (first user only)
- `POST /api/auth/logout` - User logout
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Add new contact
- `DELETE /api/contacts?id={id}` - Delete contact
- `POST /api/contacts/bulk` - Bulk import contacts
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `POST /api/sms/send` - Send SMS messages
- `POST /api/sms/webhook` - Twilio delivery status webhook
- `GET /api/sms/history` - Get message history
- `GET /api/dashboard/stats` - Get dashboard statistics

## License

MIT
