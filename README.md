# ClassConnect

ClassConnect is a premium, unified operating system built for modern coaching institutes to manage attendance, tests, fees, and parent communication in one seamless hub. It also ships a **Solutions Hub** — a public library of textbook solutions (PDF, Google Drive, or AI-generated HTML) organized into playlists/chapters, managed through a secured admin panel.

## Features
- **Smart Dashboard**: Centralized control for batch performance and scheduling.
- **Test Management**: High-fidelity results and instant tracking.
- **Attendance Tracking**: Automated logs for zero-miss attendance.
- **Fee Management**: Transparent finance and automated reminders.
- **Solutions Hub**: Public library of textbook solutions, searchable by board/class/subject, grouped into playlists.
- **Admin Panel** (`/admin`): ID+password gated dashboard to deploy/edit/delete solutions, including AI-assisted solution generation.

## Tech Stack
- **Frontend**: HTML5, Vanilla CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB (via Mongoose) — stores Solutions
- **File Storage**: Cloudinary — stores uploaded PDFs
- **AI**: Google Gemini — generates HTML textbook solutions from a prompt
- **Integrations**: Nodemailer for automated contact/lead emails

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- A MongoDB connection string (e.g. MongoDB Atlas)
- A Cloudinary account (cloud name, API key, API secret)
- A Google Gemini API key
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
Create a `.env` file in the root directory based on `.env.example`:
```env
PORT=3000
ALLOWED_ORIGINS=https://your-domain.example,http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin-email@gmail.com

# Admin panel login (ID + password gate /api/admin/* and /admin)
ADMIN_USERNAME=choose_an_admin_id
ADMIN_SECRET_KEY=a_long_random_password_32_chars_plus

MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Cluster0

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GEMINI_API_KEY=your_gemini_api_key
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
The server will start at `http://localhost:3000`. The admin panel is available at `http://localhost:3000/admin` — log in with `ADMIN_USERNAME` / `ADMIN_SECRET_KEY`.

## Architecture
`server.js` serves the static pages in `/public` (landing page, Solutions Hub, admin panel, solution viewer) and exposes:
- `POST /api/contact` — sends demo-request lead emails via Nodemailer.
- `GET /api/solutions`, `GET /api/solutions/:id` — public read access to active solutions.
- `/api/admin/solutions` (GET/POST/PUT/DELETE), `/api/admin/playlists`, `/api/admin/generate-solution` — admin-only, gated by the `x-admin-user` / `x-admin-key` headers, backed by MongoDB via the `Solution` model. PDF uploads go to Cloudinary; AI-generated HTML is sanitized before storage and before render.
