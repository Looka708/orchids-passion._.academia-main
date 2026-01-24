<div align="center">

# 🎓 Passion Academia

### *Empowering Students Through AI-Powered Learning*

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

---

### 🚀 Quick Navigation

[![Get Started](https://img.shields.io/badge/🚀_Get_Started-4CAF50?style=for-the-badge)](#-installation)
[![Features](https://img.shields.io/badge/✨_Features-2196F3?style=for-the-badge)](#-features)
[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-FF9800?style=for-the-badge)](http://localhost:9002)
[![Documentation](https://img.shields.io/badge/📚_Documentation-9C27B0?style=for-the-badge)](#-project-structure)
[![Contributing](https://img.shields.io/badge/🤝_Contributing-E91E63?style=for-the-badge)](#-contributing)

---

</div>

## 📖 About

**Passion Academia** is a cutting-edge, full-featured e-learning platform designed to revolutionize online education. Built with modern web technologies and powered by AI, it provides comprehensive tutoring and test preparation for students from Grade 6-12 and specialized entrance exams.

Developed by **Muhammad Umer**, this platform combines intuitive design with powerful features to create an engaging learning experience that adapts to each student's needs.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 **Authentication & Security**
- Secure user authentication via Supabase
- Role-based access control (Student/Admin)
- Protected routes and session management
- Password recovery and email verification

</td>
<td width="50%">

### 📚 **Dynamic Course Management**
- Academic classes (Grade 6-12)
- Special courses (AFNS, PAF, Navy, MCJ, MCM)
- Dynamic subject and chapter organization
- Flexible content structure

</td>
</tr>
<tr>
<td width="50%">

### 📝 **Interactive Testing System**
- Chapter-based MCQ tests
- Instant feedback and scoring
- Progress tracking and analytics
- Timed assessments

</td>
<td width="50%">

### 🤖 **AI-Powered Features**
- AI exam generation (MCQs, Short & Long Questions)
- Intelligent content recommendations
- Automated question generation
- Smart learning paths

</td>
</tr>
<tr>
<td width="50%">

### 👨‍💼 **Admin Dashboard**
- Complete MCQ management (CRUD operations)
- Bulk upload via CSV/Excel
- Subject and chapter management
- Class and course administration
- User management and analytics

</td>
<td width="50%">

### 🎨 **Modern UI/UX**
- Beautiful, responsive design
- Dark mode support
- Smooth animations and transitions
- Mobile-first approach
- Accessible components (ShadCN UI)

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **UI Components** | ShadCN UI, Radix UI, Lucide Icons |
| **Backend** | Next.js API Routes, Supabase |
| **Database** | PostgreSQL (via Supabase) |
| **Authentication** | Supabase Auth |
| **AI Integration** | OpenRouter API, Google Genkit (planned) |
| **Deployment** | Vercel (recommended) |

</div>

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Step-by-Step Setup

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Looka708/passion-academia.git
cd passion-academia
```

#### 2️⃣ Install Dependencies

```bash
npm install
# or
yarn install
```

#### 3️⃣ Environment Configuration

Create a `.env.local` file in the root directory and add your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# YouTube Data API (Optional)
NEXT_PUBLIC_YOUTUBE_API_KEY=your-youtube-api-key

# OpenRouter API (for AI Exam Generation)
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL_MCQS=your-preferred-model
OPENROUTER_MODEL_SHORT=your-preferred-model
OPENROUTER_MODEL_LONG=your-preferred-model
```

#### 4️⃣ Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the database migrations (SQL scripts in `/database` folder)
3. Update your `.env.local` with Supabase credentials

#### 5️⃣ Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

---

## 📂 Project Structure

```
passion-academia/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard pages
│   │   │   ├── mcqs/          # MCQ management
│   │   │   ├── subjects/      # Subject management
│   │   │   └── classes/       # Class management
│   │   ├── api/               # API routes
│   │   │   ├── mcqs/          # MCQ endpoints
│   │   │   ├── subjects/      # Subject endpoints
│   │   │   ├── classes/       # Class endpoints
│   │   │   └── courses/       # Course endpoints
│   │   ├── classes/           # Academic class pages
│   │   ├── [courseSlug]/      # Dynamic course pages
│   │   └── auth/              # Authentication pages
│   ├── components/            # Reusable React components
│   │   ├── ui/                # ShadCN UI components
│   │   ├── header.tsx         # Navigation header
│   │   ├── footer.tsx         # Footer component
│   │   └── protected-route.tsx # Auth wrapper
│   ├── hooks/                 # Custom React hooks
│   │   └── useAuth.ts         # Authentication hook
│   ├── lib/                   # Core utilities
│   │   ├── supabase/          # Supabase client
│   │   ├── types.ts           # TypeScript types
│   │   └── utils.ts           # Helper functions
│   └── styles/                # Global styles
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

---

## 🎯 Key Features Explained

### 🔄 Dynamic Routing System

The platform uses Next.js dynamic routes to automatically generate pages for any class, subject, or chapter:

- `/classes/[grade]` - Academic class pages (e.g., `/classes/10`)
- `/[courseSlug]` - Special course pages (e.g., `/afns`, `/navy`)
- `/[courseSlug]/[subject]` - Subject pages with chapters
- `/[courseSlug]/[subject]/[chapter]` - Individual test pages

### 📊 Admin Panel Capabilities

The comprehensive admin dashboard allows you to:

1. **MCQ Management**
   - Add individual MCQs with rich text support
   - Bulk upload via CSV/Excel files
   - Edit and delete questions
   - Filter by course, subject, and chapter
   - Bulk selection and deletion

2. **Subject Management**
   - Create and organize subjects
   - Assign icons and descriptions
   - Link subjects to courses
   - Manage subject metadata

3. **Class Management**
   - Add new academic or special classes
   - Configure class properties
   - Set visibility and access rules

### 🤖 AI Exam Generation

Generate complete exam papers with three question types:

- **MCQs** - Multiple choice questions with 4 options
- **Short Questions** - Brief answer questions
- **Long Questions** - Detailed essay-type questions

The system uses OpenRouter API to generate contextually relevant questions based on your subject and chapter content.

---

## 🔧 Configuration

### Customizing the Application

#### Adding a New Class

1. Navigate to Admin Dashboard → Classes
2. Click "Add New Class"
3. Fill in class details (name, category, icon)
4. Save and the class will appear in navigation automatically

#### Bulk Uploading MCQs

1. Prepare a CSV/Excel file with columns: `question`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `chapter`
2. Go to Admin → MCQs → Bulk Upload
3. Select course, subject, and upload file
4. Review and confirm upload

#### Configuring AI Models

Edit `.env.local` to specify which OpenRouter models to use:

```env
OPENROUTER_MODEL_MCQS=anthropic/claude-2.1
OPENROUTER_MODEL_SHORT=mistralai/mistral-7b
OPENROUTER_MODEL_LONG=cohere/command-r
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Looka708/passion-academia)

1. Click the "Deploy" button above
2. Connect your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 📱 Screenshots

<div align="center">

### Home Page
*Beautiful landing page with course navigation*

### Admin Dashboard
*Comprehensive management interface*

### Test Interface
*Interactive MCQ testing system*

### Subject Management
*Easy-to-use subject organization*

</div>

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs** - Open an issue with detailed information
- 💡 **Suggest Features** - Share your ideas for improvements
- 📝 **Improve Documentation** - Help make our docs better
- 💻 **Submit Pull Requests** - Contribute code improvements

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Muhammad Umer**

- GitHub: [@Looka708](https://github.com/Looka708)
- Email: [m.umer.looka@gmail.com](mailto:m.umer.looka@gmail.com)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [ShadCN UI](https://ui.shadcn.com/) - Beautiful UI Components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide Icons](https://lucide.dev/) - Beautiful Icons
- [OpenRouter](https://openrouter.ai/) - AI Model Access

---

## 📞 Support

Need help? Have questions?

[![Documentation](https://img.shields.io/badge/📚_Read_Docs-4CAF50?style=for-the-badge)](#-project-structure)
[![Issues](https://img.shields.io/badge/🐛_Report_Issue-E91E63?style=for-the-badge)](https://github.com/Looka708/passion-academia/issues)
[![Discussions](https://img.shields.io/badge/💬_Discussions-2196F3?style=for-the-badge)](https://github.com/Looka708/passion-academia/discussions)

---

## 🗺️ Roadmap

- [x] User authentication and authorization
- [x] Dynamic course and subject management
- [x] MCQ testing system
- [x] Admin dashboard
- [x] Bulk upload functionality
- [ ] AI exam generation
- [ ] Student progress analytics
- [ ] Mobile application
- [ ] Video lecture integration
- [ ] Live chat support
- [ ] Gamification features
- [ ] Certificate generation

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

Made with ❤️ by Muhammad Umer

[![GitHub stars]([https://img.shields.io/github/stars/Looka708/orchids-passion._.academia-main](https://github.com/Looka708/orchids-passion._.academia-main)?style=social)](https://github.com/Looka708/orchids-passion._.academia-main/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Looka708/orchids-passion._.academia-main?style=social)](https://github.com/Looka708/orchids-passion._.academia-main/network/members)

</div>
