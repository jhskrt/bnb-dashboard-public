# 🏠 BnB Dashboard

民宿管理儀表板 - 一個現代化的 Next.js 應用程式，用於管理民宿的日常營運。

## ✨ Features

| 功能 | 說明 |
|------|------|
| 📅 **入住管理** | 追蹤入住/退房日期、人數、房間數 |
| 💰 **收入記錄** | 管理訂房收入、額外費用等 |
| 💸 **支出追蹤** | 分類記錄各項開支（送洗、水電、維護等） |
| 🧺 **送洗管理** | 追蹤床單、毛巾等布品的送洗狀態 |
| 📊 **數據視覺化** | 使用 Recharts 顯示營運分析圖表 |
| 📆 **行事曆視圖** | FullCalendar 整合，直觀查看訂房狀態 |
| 🔐 **身份驗證** | NextAuth.js 安全登入系統 |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: PostgreSQL + [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Charts**: [Recharts](https://recharts.org/)
- **Calendar**: [FullCalendar](https://fullcalendar.io/)
- **Rate Limiting**: [Upstash Redis](https://upstash.com/)

---

## 🚀 Getting Started

> [!TIP]
> If ant questions, just ask AI。

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (推薦使用 [Supabase](https://supabase.com/))
- Upstash Redis account (用於 Rate Limiting)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jhskrt/bnb-dashboard-public.git
   cd bnb-dashboard-public
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example files
   cp .env.example .env
   cp .env.local.example .env.local
   ```

4. **Configure your `.env` file**
   ```env
   # Database (Supabase PostgreSQL)
   DATABASE_URL="postgresql://user:password@host:port/database"
   DIRECT_URL="postgresql://user:password@host:port/database"
   
   # NextAuth
   NEXTAUTH_SECRET=your-secret-here  # Generate with: openssl rand -hex 32
   NEXTAUTH_URL=http://localhost:3000
   
   # Upstash Redis
   UPSTASH_REDIS_REST_URL="https://your-url.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-token"
   ```

5. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
bnb-dashboard/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── import.ts        # CSV import script
├── src/
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── dashboard/   # Dashboard pages
│   │   └── login/       # Authentication
│   ├── components/      # Reusable components
│   └── lib/             # Utilities & helpers
└── public/              # Static assets
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run import:csv` | Import data from CSV files |

---

## 🗄️ Database Schema

主要資料模型：

- **CheckInRecord** - 入住記錄
- **Income** - 收入記錄
- **Expense** - 支出記錄
- **LaundryRecord** - 送洗記錄
- **User** - 使用者帳號

詳細 schema 請參考 [`prisma/schema.prisma`](./prisma/schema.prisma)

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | ✅ | PostgreSQL direct connection |
| `NEXTAUTH_SECRET` | ✅ | Secret for NextAuth.js |
| `NEXTAUTH_URL` | ✅ | Application URL |
| `UPSTASH_REDIS_REST_URL` | ✅ | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Upstash Redis token |
| `JWT_SECRET` | ⚠️ | JWT signing secret (in `.env.local`) |

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 🤝 Contributing

歡迎提交 Issue 和 Pull Request！
