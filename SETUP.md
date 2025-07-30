# 🚀 TikTok Reposter Setup Guide

This guide will walk you through setting up the TikTok Video Reposter Dashboard on your local machine.

## 📋 Prerequisites

### Required Software

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **npm or yarn** - Comes with Node.js
3. **Git** - [Download here](https://git-scm.com/)

### Required Accounts

1. **TikTok Developer Account** - For API access
2. **Azure Account** - For blob storage (optional but recommended)
3. **Email Account** - For SMTP notifications (Gmail recommended)

## 🔧 Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd TikTok-Reposter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create your environment file:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# TikTok API Configuration
TIKTOK_CLIENT_ID=your_actual_client_id
TIKTOK_CLIENT_SECRET=your_actual_client_secret

# Azure Blob Storage (Optional)
AZURE_STORAGE_CONNECTION_STRING=your_azure_connection_string
AZURE_CONTAINER_NAME=tiktok-videos

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=TikTok Reposter <your_email@gmail.com>
EMAIL_TO_ADMIN=admin@yourdomain.com
```

### 4. Initialize Database

```bash
npm run db:init
```

### 5. Start the Application

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## 🔑 API Configuration

### TikTok Developer Setup

1. **Create TikTok Developer Account**
   - Visit [TikTok for Developers](https://developers.tiktok.com/)
   - Create an account and verify your identity
   - Create a new app

2. **Configure App Settings**
   - Set redirect URI: `http://localhost:3000/auth/tiktok/callback`
   - Request necessary permissions:
     - `user.info.basic`
     - `video.list`
     - `video.upload`

3. **Get API Credentials**
   - Copy Client ID and Client Secret
   - Add to your `.env` file

### Azure Blob Storage Setup (Optional)

1. **Create Storage Account**
   - Go to [Azure Portal](https://portal.azure.com/)
   - Create a new Storage Account
   - Choose "Standard" performance tier

2. **Get Connection String**
   - Go to "Access keys" in your storage account
   - Copy the connection string
   - Add to your `.env` file

3. **Configure Lifecycle Management**
   - Go to "Lifecycle management"
   - Create a rule to delete blobs after 7 days

### Email Configuration

#### Using Gmail

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Enable 2FA

2. **Generate App Password**
   - Go to "App passwords" in your Google Account
   - Generate a password for "Mail"
   - Use this password in your `.env` file

#### Using Other SMTP Providers

Update your `.env` file with the appropriate settings:

```env
# For Outlook/Hotmail
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587

# For Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587

# For Custom SMTP
SMTP_HOST=your.smtp.server
SMTP_PORT=587
```

## 📁 Directory Structure Setup

The application will automatically create the following directories:

```
storage/
├── videos/          # Downloaded videos
├── thumbnails/      # Generated thumbnails
├── temp/           # Temporary files
└── database.sqlite # SQLite database

logs/               # System logs
```

## ✅ Verification Steps

### 1. Test Database Connection

```bash
npm run db:init
```

Should show: "Database tables created successfully"

### 2. Test Azure Connection (Optional)

```bash
npm run azure:test
```

Should show: "Azure connection successful"

### 3. Test Email Configuration

```bash
npm run email:test
```

Should show: "Email connection successful"

### 4. Access Dashboard

Visit `http://localhost:3000` and verify:
- Dashboard loads without errors
- Navigation works
- Settings page shows your configuration

## 🔧 Common Issues & Solutions

### Node.js Version Issues

**Problem**: Application won't start due to Node.js version

**Solution**:
```bash
# Check your Node.js version
node --version

# Should be 18.0.0 or higher
# If not, download and install the latest LTS version
```

### Database Initialization Fails

**Problem**: SQLite database creation fails

**Solution**:
```bash
# Ensure storage directory exists and is writable
mkdir -p storage
chmod 755 storage

# Re-run database initialization
npm run db:init
```

### Email Authentication Fails

**Problem**: SMTP authentication errors

**Solution**:
- For Gmail: Use App Password, not regular password
- Ensure 2FA is enabled on your account
- Check SMTP settings for your provider

### Azure Connection Issues

**Problem**: Azure Blob Storage connection fails

**Solution**:
- Verify connection string format
- Ensure storage account has Blob service enabled
- Check firewall/network restrictions

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**:
```bash
# Change port in .env file
PORT=3001

# Or kill process using port 3000
lsof -ti:3000
kill -9 <PID>
```

## 🚀 Production Deployment

### Environment Variables

Update your `.env` for production:

```env
NODE_ENV=production
DEBUG_MODE=false
LOG_LEVEL=warn
```

### Security Considerations

1. **Generate Secure Secrets**
   ```bash
   # Generate random secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **File Permissions**
   ```bash
   chmod 600 .env
   chmod 755 storage/
   ```

3. **Firewall Configuration**
   - Only expose necessary ports
   - Use HTTPS in production
   - Consider using a reverse proxy (nginx)

### Process Management

Use PM2 for production:

```bash
npm install -g pm2
pm2 start backend/server.js --name "tiktok-reposter"
pm2 startup
pm2 save
```

### Backup Strategy

1. **Database Backup**
   ```bash
   # Daily backup of SQLite database
   cp storage/database.sqlite backup/database-$(date +%Y%m%d).sqlite
   ```

2. **Configuration Backup**
   ```bash
   # Backup environment file (without secrets)
   cp .env.example backup/
   ```

## 📊 Monitoring & Maintenance

### Log Files

Monitor system logs:

```bash
# View real-time logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log
```

### Storage Management

Monitor disk usage:

```bash
# Check storage usage
du -sh storage/

# Clean temporary files
npm run clean
```

### Health Checks

The application provides health check endpoints:

- `GET /api/health` - System health
- `GET /api/health/database` - Database status
- `GET /api/health/azure` - Azure connectivity
- `GET /api/health/email` - Email service status

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `logs/app.log` and `logs/error.log`
2. Verify environment configuration
3. Test individual components using npm scripts
4. Check the [Issues](https://github.com/yourusername/tiktok-reposter/issues) page

## 📈 Next Steps

After successful setup:

1. **Configure Sources**: Add TikTok accounts or hashtags to monitor
2. **Setup Scheduling**: Configure posting schedules
3. **Test Workflow**: Try downloading and posting a test video
4. **Monitor System**: Check logs and email notifications

---

**🎉 Congratulations! Your TikTok Reposter is now ready to use.** 