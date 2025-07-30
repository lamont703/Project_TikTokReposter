# 📲 TikTok Video Reposter Dashboard

A comprehensive, responsive web interface for managing agentic automation workflows that fetch, download, and repost TikTok videos to alternative TikTok accounts, designed to run locally with a JavaScript-based tech stack.

## 🎯 Project Overview

This project provides a complete user interface for a TikTok video reposter system that automates content distribution to alternative TikTok accounts. Built with modern web technologies and designed with a mobile-first approach, it offers stakeholders a clear view of the automation workflow and system control capabilities.

### ✨ Key Features

- **Dashboard Monitoring**: Real-time overview of agent status, scheduled posts, and recent activities
- **Source Management**: Configure TikTok usernames, hashtags, and trending content monitoring
- **Repost Configuration**: TikTok account posting with custom scheduling and caption generation
- **Video Library**: Grid/list view management of scraped videos with status tracking
- **Agent Logs**: Comprehensive timeline of all system activities and error tracking
- **System Settings**: API keys, storage configuration, and notification management
- **Responsive Design**: Mobile-first UI that works seamlessly across all devices
- **Dark Mode Support**: Toggle between light and dark themes
- **Interactive Elements**: Real-time updates, progress indicators, and intuitive controls
- **Local Operation**: Designed to run entirely on local infrastructure

## 🏗️ Architecture

### Frontend Stack

- **HTML5**: Semantic markup with accessibility features
- **Tailwind CSS**: Utility-first styling with custom components
- **Vanilla JavaScript**: Interactive functionality and API integration
- **Lucide Icons**: Modern icon library for consistent UI elements

### Backend Stack

- **Node.js**: JavaScript runtime for backend services
- **Express.js**: Web framework for API endpoints
- **SQLite**: Local database for metadata and configuration
- **Puppeteer**: Custom scraping agents for TikTok content

### Infrastructure

- **Local File System**: Primary storage for downloaded videos
- **Azure Blob Storage**: Cloud backup with 7-day retention policy
- **SMTP Email**: Notification system for alerts and updates
- **TikTok APIs**: Content scraping and publishing integration

## 📁 Project Structure

```
TikTok Reposter Dashboard/
├── frontend/
│   ├── index.html              # Dashboard (Home Screen)
│   ├── sources.html            # Source Settings Page
│   ├── repost-config.html      # Repost Configuration Page
│   ├── video-library.html      # Video Library Management
│   ├── agent-logs.html         # Agent Activity Logs
│   ├── settings.html           # System Settings
│   ├── styles.css              # Custom CSS and component styles
│   └── script.js               # Interactive JavaScript functionality
├── backend/
│   ├── server.js               # Main Express server
│   ├── routes/                 # API route handlers
│   ├── services/               # Business logic services
│   ├── models/                 # Database models
│   └── utils/                  # Utility functions
├── config/
│   ├── database.js             # Database configuration
│   ├── azure.js                # Azure Blob Storage config
│   └── email.js                # Email notification config
├── storage/
│   ├── videos/                 # Local video storage
│   ├── thumbnails/             # Generated thumbnails
│   └── temp/                   # Temporary processing files
├── package.json                # Node.js dependencies
├── .env.example                # Environment variables template
├── README.md                   # Project documentation
├── component-breakdown.md      # Detailed component documentation
└── data-flow.md               # System data flow documentation
```

## 🎨 Design System

### Color Palette

- **Primary**: Indigo (600-700) for primary actions and navigation
- **Success**: Green (500-600) for positive states and confirmations
- **Warning**: Yellow/Amber (500-600) for cautions and pending states
- **Error**: Red (500-600) for errors and destructive actions
- **Neutral**: Gray (50-900) for text, borders, and backgrounds

### Typography

- **Headings**: Font weights 700-900 for hierarchy
- **Body Text**: Font weight 400-500 for readability
- **Captions**: Font weight 300-400 for secondary information

### Components

- **Cards**: Rounded corners (8px) with subtle shadows
- **Buttons**: Multiple variants (primary, secondary, danger)
- **Forms**: Consistent input styling with focus states
- **Navigation**: Responsive navigation with mobile menu
- **Status Badges**: Color-coded status indicators
- **Progress Bars**: Animated progress tracking

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 640px (1 column layouts)
- **Tablet**: 640px - 1024px (2 column layouts)
- **Desktop**: > 1024px (3-4 column layouts)

### Mobile-First Features

- **Touch-Friendly**: Large tap targets and gesture support
- **Collapsible Menu**: Hamburger navigation for mobile
- **Flexible Grids**: Content adapts to screen size
- **Readable Typography**: Optimized font sizes for mobile reading

## 🔧 Interactive Features

### Real-Time Updates

- **Agent Progress**: Live progress bars and status updates
- **Auto-Refresh**: Optional automatic log refresh
- **Status Indicators**: Real-time connection and system status
- **WebSocket Integration**: Live updates from backend services

### User Interactions

- **Form Validation**: Client-side validation with visual feedback
- **Toggle Switches**: Custom toggle components for settings
- **Modal Dialogs**: Confirmation dialogs for destructive actions
- **Notifications**: Toast notifications for user feedback
- **Search & Filter**: Dynamic content filtering capabilities

## 🔌 Integration Points

### Video Scraping Services

- **SSSTik**: Primary video download service
- **TikMate**: Backup download service
- **SnapTik**: Tertiary download option
- **Custom Puppeteer**: Direct TikTok scraping agents

### TikTok API Integration

- **TikTok Business API**: For alternative account posting
- **TikTok Web API**: For scraping and content discovery
- **Authentication**: OAuth 2.0 flow for account access

### Storage Solutions

- **Local File System**: Primary storage for videos and data
- **Azure Blob Storage**: Cloud backup with automatic deletion after 7 days
- **SQLite Database**: Metadata, configuration, and scheduling data

### Notification System

- **SMTP Email**: Primary notification channel for alerts and updates
- **Configurable Recipients**: Multiple email addresses for different notification types
- **Email Templates**: HTML-formatted notifications with system status

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**: JavaScript runtime environment
- **npm or yarn**: Package manager
- **Modern web browser**: Chrome, Firefox, Safari, Edge
- **TikTok Account**: For API access and posting
- **Azure Account**: For Blob Storage (optional)
- **SMTP Server**: For email notifications

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd TikTok-Reposter
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Initialize database**

```bash
npm run db:init
```

5. **Start the application**

```bash
npm run dev
```

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_PATH=./storage/database.sqlite

# TikTok API
TIKTOK_CLIENT_ID=your_client_id
TIKTOK_CLIENT_SECRET=your_client_secret

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_CONTAINER_NAME=tiktok-videos

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_TO=notifications@yourdomain.com

# Storage Configuration
LOCAL_STORAGE_PATH=./storage/videos
TEMP_STORAGE_PATH=./storage/temp
RETENTION_DAYS=7
```

## 🎮 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run database migrations
npm run db:migrate

# Run tests
npm test

# Build for production
npm run build

# Clean temporary files
npm run clean
```

### Local Development

The application runs entirely locally with the following services:

1. **Frontend Server**: Serves static files and UI
2. **API Server**: Handles backend logic and database operations
3. **Agent Services**: Background processes for scraping and processing
4. **File Storage**: Local file system for video storage
5. **Database**: SQLite for configuration and metadata

Visit `http://localhost:3000` to access the dashboard.

## 🔐 Security Considerations

### API Keys

- **Environment Variables**: Store sensitive credentials in `.env` file
- **Masked Display**: API keys shown with asterisks in UI
- **Secure Storage**: Keys encrypted in database
- **Rotation Support**: Easy credential updating

### Data Privacy

- **Local Processing**: All video processing happens locally
- **Temporary Storage**: Automatic cleanup of temporary files
- **7-Day Retention**: Automatic deletion from Azure after 7 days
- **Access Control**: Local-only access by default

## 📊 Performance Optimization

### Local Performance

- **SQLite Optimization**: Indexed queries for fast lookups
- **File System Caching**: Efficient local file management
- **Background Processing**: Non-blocking video processing
- **Memory Management**: Efficient handling of large video files

### Azure Integration

- **Async Uploads**: Non-blocking cloud backups
- **Lifecycle Management**: Automatic 7-day deletion
- **Retry Logic**: Robust error handling for cloud operations
- **Bandwidth Optimization**: Compressed uploads when possible

## 🧪 Testing

### Manual Testing

- **Cross-Platform**: Test on Windows, macOS, and Linux
- **Cross-Browser**: Test in multiple browsers
- **Responsive**: Test on various screen sizes
- **Performance**: Test with large video files

### Automated Testing

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

## 📈 Future Enhancements

### Planned Features

- **Analytics Dashboard**: Detailed performance metrics and insights
- **Bulk Operations**: Batch processing of multiple videos
- **Custom Workflows**: User-defined automation workflows
- **AI Content Analysis**: Automated content classification and filtering
- **Advanced Scheduling**: Complex scheduling rules and conditions
- **Content Optimization**: Automatic video enhancement and optimization

### Technical Improvements

- **Docker Support**: Containerized deployment option
- **TypeScript Migration**: Type safety for better development experience
- **React/Vue Frontend**: Modern frontend framework migration
- **Real-Time WebSocket**: Live updates without polling
- **Progressive Web App**: PWA capabilities for mobile installation

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
3. **Install dependencies**: `npm install`
4. **Run tests**: `npm test`
5. **Submit a pull request**

### Code Standards

- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **JSDoc**: Function documentation
- **Conventional Commits**: Commit message format

## 📄 License

This project is created for personal/educational purposes. Please ensure compliance with TikTok's Terms of Service and copyright laws when implementing video downloading and reposting functionality.

## 🔗 Related Documentation

- [Component Breakdown](component-breakdown.md) - Detailed breakdown of all UI components
- [Data Flow Documentation](data-flow.md) - System architecture and data flow
- [Setup Guide](SETUP.md) - Detailed installation and configuration guide

---

**Built with ❤️ for local TikTok automation workflows**
