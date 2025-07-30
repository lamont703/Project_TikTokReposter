const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

let transporter = null;

const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

const EMAIL_ADDRESSES = {
  from: process.env.EMAIL_FROM || 'TikTok Reposter <noreply@localhost>',
  admin: process.env.EMAIL_TO_ADMIN || 'admin@localhost',
  notifications: process.env.EMAIL_TO_NOTIFICATIONS || 'notifications@localhost',
  errors: process.env.EMAIL_TO_ERRORS || 'errors@localhost'
};

function initializeEmail() {
  try {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      logger.warn('Email credentials not provided. Email notifications disabled.');
      return false;
    }

    transporter = nodemailer.createTransporter(EMAIL_CONFIG);
    logger.info('Email service initialized successfully');
    return true;
  } catch (error) {
    logger.error('Failed to initialize email service:', error);
    return false;
  }
}

async function sendEmail({ to, subject, html, text, attachments = [] }) {
  try {
    if (!transporter) {
      logger.warn('Email service not initialized, skipping email');
      return false;
    }

    const mailOptions = {
      from: EMAIL_ADDRESSES.from,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || stripHtml(html),
      attachments
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${mailOptions.to}: ${subject}`);
    return result;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '');
}

function generateEmailTemplate(type, data) {
  const templates = {
    success: (data) => ({
      subject: `✅ Video Posted Successfully - ${data.videoTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ Video Posted Successfully</h2>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${data.videoTitle}</h3>
            <p><strong>Author:</strong> ${data.author}</p>
            <p><strong>TikTok Account:</strong> ${data.tiktokAccount}</p>
            <p><strong>Posted At:</strong> ${new Date(data.postedAt).toLocaleString()}</p>
            <p><strong>Post ID:</strong> ${data.postId}</p>
          </div>
          <p>The video has been successfully posted to TikTok!</p>
        </div>
      `
    }),

    error: (data) => ({
      subject: `❌ Error in TikTok Reposter - ${data.error}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">❌ System Error</h2>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3>${data.error}</h3>
            <p><strong>Component:</strong> ${data.component}</p>
            <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
            ${data.videoId ? `<p><strong>Video ID:</strong> ${data.videoId}</p>` : ''}
            ${data.details ? `<div style="background: #ffffff; padding: 10px; border-radius: 4px; margin-top: 10px;"><pre style="white-space: pre-wrap; font-size: 12px;">${data.details}</pre></div>` : ''}
          </div>
          <p>Please check the system logs for more details.</p>
        </div>
      `
    }),

    daily_summary: (data) => ({
      subject: `📊 Daily Summary - ${new Date().toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">📊 Daily Summary</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
              <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
                <h3 style="margin: 0; color: #10b981;">${data.videosDownloaded}</h3>
                <p style="margin: 5px 0; color: #64748b;">Videos Downloaded</p>
              </div>
              <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
                <h3 style="margin: 0; color: #3b82f6;">${data.videosPosted}</h3>
                <p style="margin: 5px 0; color: #64748b;">Videos Posted</p>
              </div>
              <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
                <h3 style="margin: 0; color: #f59e0b;">${data.queuedVideos}</h3>
                <p style="margin: 5px 0; color: #64748b;">Queued Videos</p>
              </div>
              <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
                <h3 style="margin: 0; color: ${data.errors > 0 ? '#ef4444' : '#10b981'};">${data.errors}</h3>
                <p style="margin: 5px 0; color: #64748b;">Errors</p>
              </div>
            </div>
          </div>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          ${data.topSources ? `<p><strong>Top Sources:</strong> ${data.topSources.join(', ')}</p>` : ''}
        </div>
      `
    }),

    system_status: (data) => ({
      subject: `🚀 TikTok Reposter System Status - ${data.status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${data.status === 'online' ? '#10b981' : '#ef4444'};">
            ${data.status === 'online' ? '🚀' : '🔴'} System ${data.status === 'online' ? 'Online' : 'Offline'}
          </h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Status:</strong> ${data.status}</p>
            <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
            ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
          </div>
        </div>
      `
    })
  };

  const template = templates[type];
  if (!template) {
    throw new Error(`Email template '${type}' not found`);
  }

  return template(data);
}

async function sendSuccessNotification(videoData) {
  const { subject, html } = generateEmailTemplate('success', videoData);
  return sendEmail({
    to: EMAIL_ADDRESSES.notifications,
    subject,
    html
  });
}

async function sendErrorNotification(errorData) {
  const { subject, html } = generateEmailTemplate('error', errorData);
  return sendEmail({
    to: EMAIL_ADDRESSES.errors,
    subject,
    html
  });
}

async function sendDailySummary(summaryData) {
  const { subject, html } = generateEmailTemplate('daily_summary', summaryData);
  return sendEmail({
    to: EMAIL_ADDRESSES.admin,
    subject,
    html
  });
}

async function sendSystemStatus(statusData) {
  const { subject, html } = generateEmailTemplate('system_status', statusData);
  return sendEmail({
    to: EMAIL_ADDRESSES.admin,
    subject,
    html
  });
}

async function testConnection() {
  try {
    if (!transporter) {
      return { success: false, error: 'Email service not initialized' };
    }

    await transporter.verify();
    return { success: true, message: 'Email connection successful' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  initializeEmail,
  sendEmail,
  sendSuccessNotification,
  sendErrorNotification,
  sendDailySummary,
  sendSystemStatus,
  testConnection,
  EMAIL_ADDRESSES
}; 