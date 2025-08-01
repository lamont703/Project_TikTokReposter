# Privacy Policy - TikTok Reposter

**Effective Date:** December 2024  
**Last Updated:** December 2024

## 1. Introduction

This Privacy Policy describes how TikTok Reposter ("we," "our," "us," or "Service") handles information when you use our local automation software. We are committed to protecting your privacy and being transparent about our data practices.

## 2. Information We Collect

### 2.1 Information We DO NOT Collect
- **Personal Information:** We do not collect names, email addresses, or contact information
- **User Analytics:** No tracking, analytics, or usage statistics are collected
- **Browsing Data:** No cookies, browser data, or web tracking
- **Device Information:** No device fingerprinting or system information collection
- **Location Data:** No geographic or location-based information

### 2.2 Information Processed Locally
The following data is processed locally on your system but **not collected by us**:

#### Video Content Data
- TikTok video files downloaded for processing
- Video metadata (titles, authors, upload dates)
- Processed video files with enhancements
- Temporary thumbnails and preview images

#### Configuration Data
- TikTok API credentials (stored locally only)
- Azure Blob Storage connection strings
- Email SMTP configuration
- Video processing settings and preferences

#### Operational Data
- Rate limiting counters (stored in local JSON files)
- Processing logs (stored locally)
- Temporary file paths and processing status

## 3. How Information is Used

### 3.1 Local Processing Only
All information processing occurs on your local system:
- **Video Processing:** FFmpeg processes videos locally for quality enhancement
- **Content Management:** Videos are managed in your local file system
- **Configuration:** All settings stored in local environment variables
- **Logging:** All logs written to local files or console output

### 3.2 No Remote Data Processing
- We do not process your data on remote servers
- No data is transmitted to our systems
- All processing happens within your local environment

## 4. Data Storage and Security

### 4.1 Local Storage
- **Primary Storage:** Your local file system
- **Temporary Files:** Automatically cleaned up after processing
- **Configuration:** Environment variables and local configuration files
- **Logs:** Local log files managed by Winston logging system

### 4.2 Your Cloud Storage (Azure Blob)
- **Storage Location:** Your personal Azure Blob Storage account
- **Retention Policy:** Automatic 7-day deletion of video files
- **Access Control:** You control all access permissions and security
- **Encryption:** Azure provides encryption at rest and in transit

### 4.3 Data Security Measures
- **Local Processing:** Reduces data exposure by keeping processing local
- **Temporary Files:** Automatic cleanup prevents data accumulation
- **API Credentials:** Stored in environment variables (not hardcoded)
- **No Remote Access:** We cannot access your data or systems

## 5. Third-Party Services

### 5.1 TikTok API Integration
- **Purpose:** Video posting and account authentication
- **Data Shared:** Video content, captions, and posting metadata
- **TikTok's Privacy Policy:** https://tiktok.com/legal/privacy-policy
- **Your Control:** You manage TikTok API credentials and permissions

### 5.2 Azure Blob Storage
- **Purpose:** Temporary video backup and storage
- **Data Shared:** Processed video files and metadata
- **Microsoft's Privacy Policy:** https://privacy.microsoft.com/privacystatement
- **Your Control:** You own and control your Azure storage account

### 5.3 Video Download Services
- **Services Used:** SSSTik, TikMate, SnapTik (as fallback options)
- **Data Shared:** TikTok video URLs for download requests
- **Purpose:** Downloading publicly available TikTok content
- **No Personal Data:** Only video URLs are shared

### 5.4 Email Notifications (SMTP)
- **Purpose:** Sending success/error notifications
- **Data Shared:** Notification content and recipient addresses
- **Your Control:** You provide and control SMTP credentials
- **Provider Privacy:** Depends on your chosen SMTP provider (Gmail, etc.)

## 6. Data Retention

### 6.1 Local Data Retention
- **Video Files:** Automatically deleted after successful processing
- **Logs:** Managed by Winston with configurable retention periods
- **Rate Limits:** JSON file data persists until manually cleared
- **Configuration:** Remains until you uninstall or modify

### 6.2 Cloud Data Retention
- **Azure Blob Storage:** 7-day automatic deletion policy
- **TikTok Platform:** Content remains according to TikTok's retention policies
- **Email Notifications:** Retained according to your email provider's policies

## 7. Your Rights and Choices

### 7.1 Data Control
- **Full Control:** You have complete control over all data processing
- **Local Access:** All data is accessible on your local system
- **Deletion Rights:** You can delete any local data at any time
- **Configuration Control:** Modify or remove configuration as needed

### 7.2 Service Control
- **Usage Control:** Start, stop, or modify the service at any time
- **API Permissions:** Revoke TikTok API access through your developer account
- **Cloud Storage:** Manage or delete Azure storage independently
- **Uninstallation:** Complete removal deletes all local data

### 7.3 No Data Portability Issues
Since all data is stored locally or in your own cloud accounts:
- **Local Files:** Directly accessible on your system
- **Azure Storage:** Downloadable through Azure portal
- **No Vendor Lock-in:** All data remains under your control

## 8. Children's Privacy

- This Service is not intended for use by children under 13
- We do not knowingly collect information from children
- Parents should supervise any use of automation tools
- If you believe a child has used this Service, please contact us

## 9. International Data Transfers

### 9.1 Local Processing
- Primary data processing occurs locally on your system
- No international data transfers by our Service

### 9.2 Third-Party Transfers
- **TikTok API:** May involve international transfers per TikTok's policies
- **Azure Storage:** Data location depends on your chosen Azure region
- **Email Services:** Depends on your SMTP provider's infrastructure

## 10. Privacy Policy Changes

### 10.1 Notification of Changes
- Privacy Policy updates will be posted in the GitHub repository
- Material changes will be highlighted in release notes
- Continued use constitutes acceptance of updated terms

### 10.2 Version Control
- All policy versions are tracked in the GitHub repository
- Previous versions remain accessible for reference
- Change history is documented in commit messages

## 11. Data Breach Response

### 11.1 Local System Security
- You are responsible for securing your local system
- Use appropriate antivirus and security software
- Keep operating system and dependencies updated

### 11.2 Third-Party Breaches
- Monitor Azure and TikTok security notifications
- We will communicate any relevant security information
- Update API credentials if compromised

## 12. Compliance and Regulations

### 12.1 GDPR Compliance (EU Users)
- Minimal data processing reduces GDPR obligations
- Local processing supports data minimization principles
- You maintain control over personal data

### 12.2 CCPA Compliance (California Users)
- No personal information is collected or sold
- Local processing supports privacy rights
- You have full control over any personal data

### 12.3 Other Jurisdictions
- Compliance approach adapts to local data protection laws
- Local processing model supports various privacy frameworks
- Contact us for jurisdiction-specific questions

## 13. Contact Information

For privacy-related questions or concerns:

**Project TikTok Reposter**  
**Privacy Contact:** [your-email@domain.com]  
**GitHub Issues:** https://github.com/lamont703/Project_TikTokReposter/issues  
**Repository:** https://github.com/lamont703/Project_TikTokReposter

### Response Time
- We aim to respond to privacy inquiries within 7 business days
- Complex requests may require additional time for proper investigation
- GitHub issues provide transparent communication for technical questions

## 14. Privacy by Design

This Service implements privacy by design principles:
- **Data Minimization:** Only processes necessary data
- **Local Processing:** Reduces data exposure
- **User Control:** You maintain full control over all data
- **Transparency:** Open source code allows full inspection
- **Security:** Multiple layers of protection through local processing

---

**This Privacy Policy reflects our commitment to protecting your privacy while providing powerful TikTok automation capabilities. By using the Service, you acknowledge that you have read and understood this Privacy Policy.** 