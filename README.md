# ClassConnect

ClassConnect is a premium, unified operating system built for modern coaching institutes to manage attendance, tests, fees, and parent communication in one seamless hub.

## Features
- **Smart Dashboard**: Centralized control for batch performance and scheduling.
- **Test Management**: High-fidelity results and instant tracking.
- **Attendance Tracking**: Automated logs for zero-miss attendance.
- **Fee Management**: Transparent finance and automated reminders.
- **Study Materials**: Easily upload and access notes and assignments.

## Tech Stack
- **Frontend**: HTML5, Vanilla CSS, JavaScript
- **Backend**: Node.js, Express
- **Integrations**: Nodemailer for automated contact/lead emails

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- An SMTP server configuration (e.g. Gmail App Passwords, SendGrid, Mailgun)

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/Siddharthdtiwari/ClassConnectSaaS.git
   cd classconnect
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
Create a `.env` file in the root directory based on `.env.example` (or just add the following variables):
```env
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin-email@gmail.com
```

### Running the App
For development with live reload:
```bash
npm run dev
```

For production:
```bash
npm start
```
The server will start at `http://localhost:3000`.

## Architecture
The application runs as a Single Page Application (SPA). `server.js` serves the static assets in `/public` and exposes a secure `/api/contact` endpoint to handle demo requests, sending customized HTML emails using Nodemailer.
