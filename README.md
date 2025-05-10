# Multilingual Chat System Frontend

The frontend application for the Multilingual Chat System project.

## Project Structure

```
src/
├── assets/            # Static assets (images, fonts, etc.)
├── components/        # Reusable components
│   ├── auth/          # Authentication related components
│   ├── chat/          # Chat related components
│   ├── layout/        # Layout components (Sidebar, TopNav, etc.)
│   ├── modals/        # Modal components
│   └── ui/            # Reusable UI components (Button, Input, Card, etc.)
├── pages/             # Page components
│   ├── admin/         # Admin-specific pages
│   ├── agent/         # Agent-specific pages
│   ├── common/        # Common pages (Login, Signup, etc.)
│   └── superadmin/    # Superadmin-specific pages
├── redux/             # Redux store and slices
│   ├── user/          # User authentication and management
│   ├── client/        # Client management
│   ├── message/       # Message management
│   ├── chatbot/       # Chatbot configurations
│   └── dashboard/     # Dashboard data
├── utils/             # Utility functions
│   ├── api/           # API client and related utilities
│   └── helpers/       # Helper functions (auth, formatting, validation, etc.)
├── App.jsx            # Main App component with routing
└── main.jsx           # Entry point
```

## Available Scripts

- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## Technologies Used

- React
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- Socket.io Client
- React Hot Toast
- Recharts (for charts/graphs)
- Lucide React (for icons)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Access the application at http://localhost:5173
