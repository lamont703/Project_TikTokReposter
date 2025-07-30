const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

let blobServiceClient = null;
let containerClient = null;

const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME || 'tiktok-videos';
const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS) || 7;

function initializeAzure() {
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    
    if (!connectionString) {
      logger.warn('Azure Storage connection string not provided. Azure backup disabled.');
      return false;
    }

    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    
    logger.info('Azure Blob Storage initialized successfully');
    return true;
  } catch (error) {
    logger.error('Failed to initialize Azure Blob Storage:', error);
    return false;
  }
}

async function ensureContainer() {
  try {
    if (!containerClient) {
      throw new Error('Azure not initialized');
    }

    const exists = await containerClient.exists();
    if (!exists) {
      await containerClient.create();
      logger.info(`Container ${CONTAINER_NAME} created`);
    }
    return true;
  } catch (error) {
    logger.error('Error ensuring container exists:', error);
    return false;
  }
}

async function uploadVideo(localPath, blobName) {
  try {
    if (!containerClient) {
      logger.warn('Azure not initialized, skipping upload');
      return null;
    }

    await ensureContainer();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Check if file exists locally
    if (!fs.existsSync(localPath)) {
      throw new Error(`Local file not found: ${localPath}`);
    }

    const uploadBlobResponse = await blockBlobClient.uploadFile(localPath, {
      metadata: {
        originalPath: localPath,
        uploadDate: new Date().toISOString(),
        retentionDate: new Date(Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
      }
    });

    logger.info(`Video uploaded to Azure: ${blobName}`);
    return uploadBlobResponse;
  } catch (error) {
    logger.error('Error uploading video to Azure:', error);
    throw error;
  }
}

async function downloadVideo(blobName, localPath) {
  try {
    if (!containerClient) {
      throw new Error('Azure not initialized');
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Ensure local directory exists
    const localDir = path.dirname(localPath);
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    await blockBlobClient.downloadToFile(localPath);
    logger.info(`Video downloaded from Azure: ${blobName} -> ${localPath}`);
    return true;
  } catch (error) {
    logger.error('Error downloading video from Azure:', error);
    throw error;
  }
}

async function deleteVideo(blobName) {
  try {
    if (!containerClient) {
      throw new Error('Azure not initialized');
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    logger.info(`Video deleted from Azure: ${blobName}`);
    return true;
  } catch (error) {
    logger.error('Error deleting video from Azure:', error);
    throw error;
  }
}

async function listExpiredVideos() {
  try {
    if (!containerClient) {
      return [];
    }

    const expiredVideos = [];
    const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

    for await (const blob of containerClient.listBlobsFlat({ includeMetadata: true })) {
      const uploadDate = blob.metadata?.uploadDate ? new Date(blob.metadata.uploadDate) : blob.properties.createdOn;
      
      if (uploadDate < cutoffDate) {
        expiredVideos.push({
          name: blob.name,
          uploadDate: uploadDate,
          size: blob.properties.contentLength
        });
      }
    }

    return expiredVideos;
  } catch (error) {
    logger.error('Error listing expired videos:', error);
    return [];
  }
}

async function cleanupExpiredVideos() {
  try {
    if (!containerClient) {
      logger.warn('Azure not initialized, skipping cleanup');
      return { deleted: 0, errors: 0 };
    }

    const expiredVideos = await listExpiredVideos();
    let deleted = 0;
    let errors = 0;

    logger.info(`Found ${expiredVideos.length} expired videos to delete`);

    for (const video of expiredVideos) {
      try {
        await deleteVideo(video.name);
        deleted++;
      } catch (error) {
        logger.error(`Failed to delete expired video ${video.name}:`, error);
        errors++;
      }
    }

    logger.info(`Azure cleanup completed: ${deleted} deleted, ${errors} errors`);
    return { deleted, errors, total: expiredVideos.length };
  } catch (error) {
    logger.error('Error during Azure cleanup:', error);
    return { deleted: 0, errors: 1 };
  }
}

async function getStorageStats() {
  try {
    if (!containerClient) {
      return { enabled: false };
    }

    let totalSize = 0;
    let totalFiles = 0;

    for await (const blob of containerClient.listBlobsFlat()) {
      totalSize += blob.properties.contentLength || 0;
      totalFiles++;
    }

    return {
      enabled: true,
      totalFiles,
      totalSize,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      containerName: CONTAINER_NAME,
      retentionDays: RETENTION_DAYS
    };
  } catch (error) {
    logger.error('Error getting Azure storage stats:', error);
    return { enabled: false, error: error.message };
  }
}

async function testConnection() {
  try {
    if (!blobServiceClient) {
      return { success: false, error: 'Azure not initialized' };
    }

    await blobServiceClient.getAccountInfo();
    return { success: true, message: 'Azure connection successful' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  initializeAzure,
  uploadVideo,
  downloadVideo,
  deleteVideo,
  cleanupExpiredVideos,
  getStorageStats,
  testConnection,
  listExpiredVideos
}; 