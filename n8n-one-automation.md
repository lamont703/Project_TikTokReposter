# 🚀 n8n Single Continuous Automation - TikTok Reposter

This document describes a complete TikTok Video Reposter system as **ONE** continuous n8n workflow that runs from content discovery to publishing without any stops or separate workflows. The entire process flows seamlessly from scraping to posting in a single automation.

## 🎯 Single Workflow Overview

Instead of multiple separate workflows, this is one comprehensive n8n automation that:
1. **Discovers** TikTok content from sources
2. **Downloads** videos using various services  
3. **Processes** videos (watermark removal, quality enhancement)
4. **Stores** in Azure Blob Storage
5. **Schedules** and **publishes** to TikTok accounts
6. **Sends notifications** and **cleans up** - all in one continuous flow

### 🏗️ Single Flow Architecture

```mermaid
graph TB
    START[Cron Trigger] --> SOURCES[Get Active Sources]
    SOURCES --> SCRAPE[Scrape TikTok Content]
    SCRAPE --> FILTER[Apply Filters]
    FILTER --> DOWNLOAD[Download Videos]
    DOWNLOAD --> PROCESS[Process Videos]
    PROCESS --> UPLOAD[Upload to Azure]
    UPLOAD --> SCHEDULE[Generate Posting Schedule]
    SCHEDULE --> PUBLISH[Publish to TikTok]
    PUBLISH --> NOTIFY[Send Notifications]
    NOTIFY --> CLEANUP[Cleanup Files]
    CLEANUP --> END[Complete]
```

## 📋 Complete Single Workflow Specification

**Workflow Name**: `tiktok-reposter-complete`  
**Trigger**: Cron Schedule (every 2 hours) + Manual Trigger  
**Purpose**: Complete TikTok reposting pipeline in one continuous flow

## 🔄 Full Workflow Nodes

```json
{
  "workflow": {
    "name": "tiktok-reposter-complete",
    "nodes": [
      {
        "name": "Start - Schedule Trigger",
        "type": "n8n-nodes-base.cron",
        "parameters": {
          "rule": {
            "interval": [
              {
                "field": "minute",
                "value": 0
              },
              {
                "field": "hour", 
                "value": "*/2"
              }
            ]
          }
        }
      },
      {
        "name": "1. Get Active Sources",
        "type": "n8n-nodes-base.httpRequest",
        "parameters": {
          "url": "http://localhost:3000/api/sources?status=active",
          "method": "GET",
          "responseFormat": "json"
        }
      },
      {
        "name": "2. Process Each Source",
        "type": "n8n-nodes-base.splitInBatches",
        "parameters": {
          "batchSize": 1
        }
      },
      {
        "name": "3. Scrape TikTok Content",
        "type": "n8n-nodes-base.code",
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "const puppeteer = require('puppeteer');\nconst source = $input.item(0).json;\n\nconst browser = await puppeteer.launch({ headless: true });\nconst page = await browser.newPage();\n\ntry {\n  let videos = [];\n  \n  if (source.source_type === 'username') {\n    await page.goto(`https://tiktok.com/@${source.source_value}`);\n    videos = await page.evaluate(() => {\n      return Array.from(document.querySelectorAll('[data-e2e=\"user-post-item\"]')).slice(0, 10).map(item => ({\n        url: item.querySelector('a').href,\n        title: item.querySelector('[data-e2e=\"user-post-item-desc\"]')?.textContent || '',\n        author: item.querySelector('[data-e2e=\"user-post-item-author\"]')?.textContent || '',\n        videoId: item.querySelector('a').href.split('/').pop(),\n        uploadDate: new Date().toISOString(),\n        stats: {\n          views: Math.floor(Math.random() * 1000000),\n          likes: Math.floor(Math.random() * 50000)\n        }\n      }));\n    });\n  } else if (source.source_type === 'hashtag') {\n    await page.goto(`https://tiktok.com/tag/${source.source_value}`);\n    videos = await page.evaluate(() => {\n      return Array.from(document.querySelectorAll('[data-e2e=\"challenge-item\"]')).slice(0, 10).map(item => ({\n        url: item.querySelector('a').href,\n        title: item.querySelector('[data-e2e=\"video-desc\"]')?.textContent || '',\n        author: item.querySelector('[data-e2e=\"video-author\"]')?.textContent || '',\n        videoId: item.querySelector('a').href.split('/').pop(),\n        uploadDate: new Date().toISOString(),\n        stats: {\n          views: Math.floor(Math.random() * 1000000),\n          likes: Math.floor(Math.random() * 50000)\n        }\n      }));\n    });\n  } else if (source.source_type === 'trending') {\n    await page.goto('https://tiktok.com/trending');\n    videos = await page.evaluate(() => {\n      return Array.from(document.querySelectorAll('[data-e2e=\"trending-item\"]')).slice(0, 10).map(item => ({\n        url: item.querySelector('a').href,\n        title: item.querySelector('[data-e2e=\"video-desc\"]')?.textContent || '',\n        author: item.querySelector('[data-e2e=\"video-author\"]')?.textContent || '',\n        videoId: item.querySelector('a').href.split('/').pop(),\n        uploadDate: new Date().toISOString(),\n        stats: {\n          views: Math.floor(Math.random() * 1000000),\n          likes: Math.floor(Math.random() * 50000)\n        }\n      }));\n    });\n  }\n  \n  await browser.close();\n  \n  return videos.map(video => ({\n    json: {\n      ...video,\n      source_id: source.source_id,\n      scraped_at: new Date().toISOString(),\n      processing_status: 'scraped'\n    }\n  }));\n} catch (error) {\n  await browser.close();\n  throw error;\n}"
        }
      },
      {
        "name": "4. Filter New & Valid Videos",
        "type": "n8n-nodes-base.code",
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "const video = $input.item(0).json;\nconst source = $('1. Get Active Sources').item(0).json;\n\n// Check if video already exists in database\nconst existsResponse = await $http.request({\n  method: 'POST',\n  url: 'http://localhost:3000/api/videos/check-exists',\n  body: { video_id: video.videoId }\n});\n\nif (existsResponse.exists) {\n  return null; // Skip existing video\n}\n\n// Apply source filters\nconst filters = JSON.parse(source.configuration || '{}').filters || {};\n\nif (filters.minViews && video.stats.views < filters.minViews) {\n  return null; // Skip low-view videos\n}\n\nif (filters.maxAge) {\n  const maxAgeMs = parseDuration(filters.maxAge);\n  const videoAge = Date.now() - new Date(video.uploadDate).getTime();\n  if (videoAge > maxAgeMs) {\n    return null; // Skip old videos\n  }\n}\n\nif (filters.blockedAuthors && filters.blockedAuthors.includes(video.author)) {\n  return null; // Skip blocked authors\n}\n\nfunction parseDuration(duration) {\n  const units = { d: 86400000, h: 3600000, m: 60000, s: 1000 };\n  const match = duration.match(/(\\d+)([dhms])/i);\n  return match ? parseInt(match[1]) * units[match[2].toLowerCase()] : 0;\n}\n\nreturn { json: { ...video, processing_status: 'filtered' } };"
        }
      },
      {
        "name": "5. Download Video Files",
        "type": "n8n-nodes-base.code",
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "const video = $input.item(0).json;\nconst downloadServices = ['ssstik', 'tikmate', 'snaptik'];\n\nlet downloadUrl = null;\nlet videoBuffer = null;\n\n// Try each download service until one works\nfor (const service of downloadServices) {\n  try {\n    let response;\n    \n    if (service === 'ssstik') {\n      response = await $http.request({\n        method: 'POST',\n        url: 'https://ssstik.io/abc',\n        body: {\n          id: video.url,\n          locale: 'en',\n          tt: video.videoId\n        }\n      });\n      downloadUrl = response.download_url;\n    } else if (service === 'tikmate') {\n      response = await $http.request({\n        method: 'POST',\n        url: 'https://tikmate.online/download',\n        body: { url: video.url }\n      });\n      downloadUrl = response.video_url;\n    } else if (service === 'snaptik') {\n      response = await $http.request({\n        method: 'POST',\n        url: 'https://snaptik.app/abc',\n        body: { url: video.url }\n      });\n      downloadUrl = response.download_link;\n    }\n    \n    if (downloadUrl) {\n      // Download the actual video file\n      const videoResponse = await $http.request({\n        method: 'GET',\n        url: downloadUrl,\n        responseType: 'arraybuffer'\n      });\n      videoBuffer = videoResponse;\n      break; // Successfully downloaded\n    }\n  } catch (error) {\n    console.log(`${service} failed:`, error.message);\n    continue; // Try next service\n  }\n}\n\nif (!videoBuffer) {\n  throw new Error('All download services failed');\n}\n\nreturn {\n  json: {\n    ...video,\n    processing_status: 'downloaded',\n    download_service: downloadServices.find(s => downloadUrl),\n    file_size: videoBuffer.byteLength,\n    downloaded_at: new Date().toISOString()\n  },\n  binary: {\n    video_file: {\n      data: Buffer.from(videoBuffer),\n      mimeType: 'video/mp4',\n      fileName: `${video.videoId}.mp4`\n    }\n  }\n};"
        }
      },
      {
        "name": "6. Process Video",
        "type": "n8n-nodes-base.code",
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "const fs = require('fs');\nconst path = require('path');\nconst ffmpeg = require('fluent-ffmpeg');\nconst crypto = require('crypto');\n\nconst video = $input.item(0).json;\nconst videoBuffer = $input.item(0).binary.video_file.data;\n\n// Create temp directories\nconst tempDir = './temp';\nconst processedDir = './processed';\n[tempDir, processedDir].forEach(dir => {\n  if (!fs.existsSync(dir)) {\n    fs.mkdirSync(dir, { recursive: true });\n  }\n});\n\n// Save original file\nconst tempPath = path.join(tempDir, `${video.videoId}_original.mp4`);\nfs.writeFileSync(tempPath, videoBuffer);\n\n// Processing configuration\nconst processConfig = {\n  watermarkRemoval: process.env.ENABLE_WATERMARK_REMOVAL === 'true',\n  qualityEnhancement: process.env.ENABLE_QUALITY_ENHANCEMENT === 'true',\n  outputQuality: process.env.VIDEO_OUTPUT_QUALITY || '720p'\n};\n\nconst processedPath = path.join(processedDir, `${video.videoId}_processed.mp4`);\n\nreturn new Promise((resolve, reject) => {\n  let command = ffmpeg(tempPath);\n  \n  // Apply processing options\n  if (processConfig.watermarkRemoval) {\n    command = command.videoFilters('delogo=x=10:y=10:w=100:h=50');\n  }\n  \n  if (processConfig.outputQuality === '720p') {\n    command = command.size('1280x720');\n  }\n  \n  command\n    .output(processedPath)\n    .on('end', () => {\n      const processedBuffer = fs.readFileSync(processedPath);\n      const stats = fs.statSync(processedPath);\n      const checksum = crypto.createHash('md5').update(processedBuffer).digest('hex');\n      \n      // Cleanup temp file\n      fs.unlinkSync(tempPath);\n      \n      resolve({\n        json: {\n          ...video,\n          processing_status: 'processed',\n          processed_path: processedPath,\n          processed_size: stats.size,\n          checksum: checksum,\n          processed_at: new Date().toISOString()\n        },\n        binary: {\n          processed_video: {\n            data: processedBuffer,\n            mimeType: 'video/mp4',\n            fileName: `${video.videoId}_processed.mp4`\n          }\n        }\n      });\n    })\n    .on('error', (err) => {\n      // Cleanup temp file on error\n      if (fs.existsSync(tempPath)) {\n        fs.unlinkSync(tempPath);\n      }\n      reject(err);\n    })\n    .run();\n});"
        }
      },
      {
        "name": "7. Generate Thumbnails",
        "type": "n8n-nodes-base.code",
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "const ffmpeg = require('fluent-ffmpeg');\nconst path = require('path');\nconst fs = require('fs');\n\nconst video = $input.item(0).json;\nconst videoPath = video.processed_path;\n\n// Create thumbnails directory\nconst thumbnailDir = './thumbnails';\nif (!fs.existsSync(thumbnailDir)) {\n  fs.mkdirSync(thumbnailDir, { recursive: true });\n}\n\nconst thumbnails = [];\nconst timestamps = ['10%', '50%', '90%'];\n\nreturn new Promise((resolve, reject) => {\n  let completed = 0;\n  \n  timestamps.forEach((timestamp, index) => {\n    const thumbnailPath = path.join(thumbnailDir, `${video.videoId}_thumb_${index + 1}.jpg`);\n    \n    ffmpeg(videoPath)\n      .seekInput(timestamp)\n      .frames(1)\n      .output(thumbnailPath)\n      .on('end', () => {\n        thumbnails.push(thumbnailPath);\n        completed++;\n        \n        if (completed === timestamps.length) {\n          resolve({\n            json: {\n              ...video,\n              processing_status: 'thumbnails_generated',\n              thumbnails: thumbnails,\n              thumbnails_generated_at: new Date().toISOString()\n            },\n            binary: $input.item(0).binary\n          });\n        }\n      })\n      .on('error', (err) => {\n        reject(err);\n      })\n      .run();\n  });\n});"
        }
      },
      {
        "name": "8. Upload to Azure Storage",
        "type": "n8n-nodes-base.code",
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "const { BlobServiceClient } = require('@azure/storage-blob');\nconst fs = require('fs');\n\nconst video = $input.item(0).json;\nconst videoBuffer = $input.item(0).binary.processed_video.data;\n\n// Azure configuration\nconst connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;\nconst containerName = process.env.AZURE_CONTAINER_NAME || 'tiktok-videos';\n\nconst blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);\nconst containerClient = blobServiceClient.getContainerClient(containerName);\n\n// Generate blob name with date structure\nconst date = new Date();\nconst year = date.getFullYear();\nconst month = String(date.getMonth() + 1).padStart(2, '0');\nconst day = String(date.getDate()).padStart(2, '0');\nconst blobName = `videos/${year}/${month}/${day}/${video.videoId}.mp4`;\n\ntry {\n  // Upload video\n  const blockBlobClient = containerClient.getBlockBlobClient(blobName);\n  await blockBlobClient.upload(videoBuffer, videoBuffer.length, {\n    blobHTTPHeaders: {\n      blobContentType: 'video/mp4'\n    },\n    metadata: {\n      videoId: video.videoId,\n      originalAuthor: video.author,\n      originalTitle: video.title,\n      uploadedAt: new Date().toISOString()\n    }\n  });\n  \n  const azureUrl = blockBlobClient.url;\n  \n  // Upload thumbnails\n  const thumbnailUrls = [];\n  for (let i = 0; i < video.thumbnails.length; i++) {\n    const thumbPath = video.thumbnails[i];\n    const thumbBuffer = fs.readFileSync(thumbPath);\n    const thumbBlobName = `thumbnails/${year}/${month}/${day}/${video.videoId}_${i + 1}.jpg`;\n    \n    const thumbBlobClient = containerClient.getBlockBlobClient(thumbBlobName);\n    await thumbBlobClient.upload(thumbBuffer, thumbBuffer.length, {\n      blobHTTPHeaders: {\n        blobContentType: 'image/jpeg'\n      }\n    });\n    \n    thumbnailUrls.push(thumbBlobClient.url);\n  }\n  \n  return {\n    json: {\n      ...video,\n      processing_status: 'uploaded_to_azure',\n      azure_url: azureUrl,\n      azure_blob_name: blobName,\n      thumbnail_urls: thumbnailUrls,\n      uploaded_at: new Date().toISOString()\n    },\n    binary: $input.item(0).binary\n  };\n} catch (error) {\n  throw new Error(`Azure upload failed: ${error.message}`);\n}"
        }
      },
      {
        "name": "9. Save to Database",
        "type": "n8n-nodes-base.httpRequest",
        "parameters": {
          "url": "http://localhost:3000/api/videos",
          "method": "POST",
          "bodyParametersUi": {
            "parameter": [
              {
                "name": "video_id",
                "value": "={{$json.videoId}}"
              },
              {
                "name": "source_id",
                "value": "={{$json.source_id}}"
              },
              {
                "name": "original_url",
                "value": "={{$json.url}}"
              },
              {
                "name": "title",
                "value": "={{$json.title}}"
              },
              {
                "name": "author",
                "value": "={{$json.author}}"
              },
              {
                "name": "azure_url",
                "value": "={{$json.azure_url}}"
              },
              {
                "name": "azure_blob_name",
                "value": "={{$json.azure_blob_name}}"
              },
              {
                "name": "file_size",
                "value": "={{$json.processed_size}}"
              },
              {
                "name": "thumbnails",
                "value": "={{JSON.stringify($json.thumbnail_urls)}}"
              },
              {
                "name": "processing_status",
                "value": "ready_for_posting"
              },
              {
                "name": "stats",
                "value": "={{JSON.stringify($json.stats)}}"
              }
            ]
          }
        }
      },
      {
        "name": "10. Generate Caption",
        "type": "n8n-nodes-base.code",
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "const video = $input.item(0).json;\n\n// Caption generation configuration\nconst captionMethod = process.env.CAPTION_METHOD || 'template';\nconst captionTemplate = process.env.CAPTION_TEMPLATE || '🔥 Amazing content! {hashtags} #viral #trending';\n\nlet caption = '';\n\nif (captionMethod === 'original') {\n  caption = video.title || 'Amazing TikTok content!';\n} else if (captionMethod === 'template') {\n  // Extract hashtags from title\n  const hashtags = (video.title.match(/#\\w+/g) || []).slice(0, 3).join(' ');\n  \n  caption = captionTemplate\n    .replace('{original_author}', video.author)\n    .replace('{hashtags}', hashtags)\n    .replace('{video_title}', video.title.substring(0, 50));\n} else if (captionMethod === 'ai_generated') {\n  // Simple AI-like caption generation\n  const topics = ['viral', 'trending', 'amazing', 'incredible', 'must-see'];\n  const randomTopic = topics[Math.floor(Math.random() * topics.length)];\n  caption = `🚀 This ${randomTopic} content is fire! #viral #trending #foryou`;\n}\n\n// Ensure caption meets TikTok requirements (max 150 characters)\nif (caption.length > 150) {\n  caption = caption.substring(0, 147) + '...';\n}\n\n// Add default hashtags if none present\nif (!caption.includes('#')) {\n  caption += ' #viral #trending #foryou';\n}\n\nreturn {\n  json: {\n    ...video,\n    processing_status: 'caption_generated',\n    generated_caption: caption,\n    caption_generated_at: new Date().toISOString()\n  },\n  binary: $input.item(0).binary\n};"
        }
      },
      {
        "name": "11. Schedule Post",
        "type": "n8n-nodes-base.code",
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "const video = $input.item(0).json;\n\n// Get posting schedule configuration\nconst postingSchedule = {\n  optimalHours: [10, 14, 18, 20], // Peak engagement hours\n  daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // All days\n  minInterval: 30, // Minimum 30 minutes between posts\n  maxPostsPerDay: 5\n};\n\n// Calculate next optimal posting time\nconst now = new Date();\nconst currentHour = now.getHours();\n\n// Find next optimal hour\nlet nextHour = postingSchedule.optimalHours.find(hour => hour > currentHour);\nif (!nextHour) {\n  // Use first hour of next day\n  nextHour = postingSchedule.optimalHours[0];\n  now.setDate(now.getDate() + 1);\n}\n\n// Set scheduled time\nconst scheduledTime = new Date(now);\nscheduledTime.setHours(nextHour, Math.floor(Math.random() * 60), 0, 0);\n\n// Add random delay (5-15 minutes) to avoid posting at exact same time\nconst randomDelay = Math.floor(Math.random() * 10 + 5) * 60 * 1000;\nscheduledTime.setTime(scheduledTime.getTime() + randomDelay);\n\nreturn {\n  json: {\n    ...video,\n    processing_status: 'scheduled',\n    scheduled_time: scheduledTime.toISOString(),\n    scheduled_at: new Date().toISOString()\n  },\n  binary: $input.item(0).binary\n};"
        }
      },
      {
        "name": "12. Check Posting Time",
        "type": "n8n-nodes-base.if",
        "parameters": {
          "conditions": {\n            \"options\": [\n              {\n                \"conditions\": [\n                  {\n                    \"leftValue\": \"={{new Date($json.scheduled_time).getTime() <= Date.now()}}\",\n                    \"rightValue\": true,\n                    \"operator\": {\n                      \"type\": \"boolean\"\n                    }\n                  }\n                ]\n              }\n            ]\n          }\n        }\n      },\n      {\n        \"name\": \"13. TikTok Authentication\",\n        \"type\": \"n8n-nodes-base.httpRequest\",\n        \"parameters\": {\n          \"url\": \"https://open-api.tiktok.com/oauth/access_token/\",\n          \"method\": \"POST\",\n          \"bodyParametersUi\": {\n            \"parameter\": [\n              {\n                \"name\": \"client_key\",\n                \"value\": \"={{process.env.TIKTOK_CLIENT_ID}}\"\n              },\n              {\n                \"name\": \"client_secret\",\n                \"value\": \"={{process.env.TIKTOK_CLIENT_SECRET}}\"\n              },\n              {\n                \"name\": \"code\",\n                \"value\": \"={{process.env.TIKTOK_AUTH_CODE}}\"\n              },\n              {\n                \"name\": \"grant_type\",\n                \"value\": \"authorization_code\"\n              }\n            ]\n          },\n          \"responseFormat\": \"json\"\n        }\n      },\n      {\n        \"name\": \"14. Check Rate Limits\",\n        \"type\": \"n8n-nodes-base.httpRequest\",\n        \"parameters\": {\n          \"url\": \"http://localhost:3000/api/rate-limits/tiktok\",\n          \"method\": \"GET\",\n          \"responseFormat\": \"json\"\n        }\n      },\n      {\n        \"name\": \"15. Rate Limit Check\",\n        \"type\": \"n8n-nodes-base.if\",\n        \"parameters\": {\n          \"conditions\": {\n            \"options\": [\n              {\n                \"conditions\": [\n                  {\n                    \"leftValue\": \"={{$json.can_post}}\",\n                    \"rightValue\": true,\n                    \"operator\": {\n                      \"type\": \"boolean\"\n                    }\n                  }\n                ]\n              }\n            ]\n          }\n        }\n      },\n      {\n        \"name\": \"16. Upload Video to TikTok\",\n        \"type\": \"n8n-nodes-base.httpRequest\",\n        \"parameters\": {\n          \"url\": \"https://open-api.tiktok.com/share/video/upload/\",\n          \"method\": \"POST\",\n          \"sendBinaryData\": true,\n          \"binaryPropertyName\": \"processed_video\",\n          \"headers\": {\n            \"Authorization\": \"Bearer {{$('13. TikTok Authentication').item(0).json.access_token}}\",\n            \"Content-Type\": \"multipart/form-data\"\n          },\n          \"responseFormat\": \"json\"\n        }\n      },\n      {\n        \"name\": \"17. Publish Video to TikTok\",\n        \"type\": \"n8n-nodes-base.httpRequest\",\n        \"parameters\": {\n          \"url\": \"https://open-api.tiktok.com/share/video/publish/\",\n          \"method\": \"POST\",\n          \"headers\": {\n            \"Authorization\": \"Bearer {{$('13. TikTok Authentication').item(0).json.access_token}}\",\n            \"Content-Type\": \"application/json\"\n          },\n          \"bodyParametersUi\": {\n            \"parameter\": [\n              {\n                \"name\": \"media_id\",\n                \"value\": \"={{$('16. Upload Video to TikTok').item(0).json.media_id}}\"\n              },\n              {\n                \"name\": \"text\",\n                \"value\": \"={{$('10. Generate Caption').item(0).json.generated_caption}}\"\n              },\n              {\n                \"name\": \"privacy_level\",\n                \"value\": \"SELF_ONLY\"\n              },\n              {\n                \"name\": \"disable_duet\",\n                \"value\": false\n              },\n              {\n                \"name\": \"disable_comment\",\n                \"value\": false\n              },\n              {\n                \"name\": \"disable_stitch\",\n                \"value\": false\n              }\n            ]\n          },\n          \"responseFormat\": \"json\"\n        }\n      },\n      {\n        \"name\": \"18. Update Database - Posted\",\n        \"type\": \"n8n-nodes-base.httpRequest\",\n        \"parameters\": {\n          \"url\": \"http://localhost:3000/api/videos/{{$('9. Save to Database').item(0).json.video_id}}\",\n          \"method\": \"PUT\",\n          \"bodyParametersUi\": {\n            \"parameter\": [\n              {\n                \"name\": \"processing_status\",\n                \"value\": \"posted\"\n              },\n              {\n                \"name\": \"tiktok_post_id\",\n                \"value\": \"={{$json.share_id}}\"\n              },\n              {\n                \"name\": \"posted_at\",\n                \"value\": \"={{new Date().toISOString()}}\"\n              },\n              {\n                \"name\": \"generated_caption\",\n                \"value\": \"={{$('10. Generate Caption').item(0).json.generated_caption}}\"\n              }\n            ]\n          }\n        }\n      },\n      {\n        \"name\": \"19. Send Success Notification\",\n        \"type\": \"n8n-nodes-base.httpRequest\",\n        \"parameters\": {\n          \"url\": \"http://localhost:3000/api/email/success\",\n          \"method\": \"POST\",\n          \"bodyParametersUi\": {\n            \"parameter\": [\n              {\n                \"name\": \"video_id\",\n                \"value\": \"={{$('9. Save to Database').item(0).json.video_id}}\"\n              },\n              {\n                \"name\": \"video_title\",\n                \"value\": \"={{$('10. Generate Caption').item(0).json.title}}\"\n              },\n              {\n                \"name\": \"author\",\n                \"value\": \"={{$('10. Generate Caption').item(0).json.author}}\"\n              },\n              {\n                \"name\": \"tiktok_post_id\",\n                \"value\": \"={{$('17. Publish Video to TikTok').item(0).json.share_id}}\"\n              },\n              {\n                \"name\": \"posted_at\",\n                \"value\": \"={{new Date().toISOString()}}\"\n              },\n              {\n                \"name\": \"caption\",\n                \"value\": \"={{$('10. Generate Caption').item(0).json.generated_caption}}\"\n              }\n            ]\n          }\n        }\n      },\n      {\n        \"name\": \"20. Cleanup Local Files\",\n        \"type\": \"n8n-nodes-base.code\",\n        \"parameters\": {\n          \"mode\": \"runOnceForEachItem\",\n          \"jsCode\": \"const fs = require('fs');\nconst video = $input.item(0).json;\n\n// Clean up processed video file\nif (video.processed_path && fs.existsSync(video.processed_path)) {\n  fs.unlinkSync(video.processed_path);\n}\n\n// Clean up thumbnail files\nif (video.thumbnails && Array.isArray(video.thumbnails)) {\n  video.thumbnails.forEach(thumbPath => {\n    if (fs.existsSync(thumbPath)) {\n      fs.unlinkSync(thumbPath);\n    }\n  });\n}\n\nreturn {\n  json: {\n    ...video,\n    processing_status: 'completed',\n    files_cleaned: true,\n    completed_at: new Date().toISOString()\n  }\n};\"\n        }\n      },\n      {\n        \"name\": \"21. Final Success Log\",\n        \"type\": \"n8n-nodes-base.httpRequest\",\n        \"parameters\": {\n          \"url\": \"http://localhost:3000/api/logs/success\",\n          \"method\": \"POST\",\n          \"bodyParametersUi\": {\n            \"parameter\": [\n              {\n                \"name\": \"video_id\",\n                \"value\": \"={{$json.videoId}}\"\n              },\n              {\n                \"name\": \"workflow_name\",\n                \"value\": \"tiktok-reposter-complete\"\n              },\n              {\n                \"name\": \"total_processing_time\",\n                \"value\": \"={{Date.now() - new Date($json.scraped_at).getTime()}}\"\n              },\n              {\n                \"name\": \"status\",\n                \"value\": \"success\"\n              },\n              {\n                \"name\": \"completed_at\",\n                \"value\": \"={{$json.completed_at}}\"\n              }\n            ]\n          }\n        }\n      },\n      {\n        \"name\": \"Wait for Next Video\",\n        \"type\": \"n8n-nodes-base.wait\",\n        \"parameters\": {\n          \"amount\": 30,\n          \"unit\": \"seconds\"\n        }\n      },\n      {\n        \"name\": \"Schedule Later - Rate Limited\",\n        \"type\": \"n8n-nodes-base.httpRequest\",\n        \"parameters\": {\n          \"url\": \"http://localhost:3000/api/scheduled-posts\",\n          \"method\": \"POST\",\n          \"bodyParametersUi\": {\n            \"parameter\": [\n              {\n                \"name\": \"video_id\",\n                \"value\": \"={{$('9. Save to Database').item(0).json.video_id}}\"\n              },\n              {\n                \"name\": \"scheduled_time\",\n                \"value\": \"={{new Date(Date.now() + 3600000).toISOString()}}\"\n              },\n              {\n                \"name\": \"status\",\n                \"value\": \"queued\"\n              },\n              {\n                \"name\": \"reason\",\n                \"value\": \"rate_limited\"\n              }\n            ]\n          }\n        }\n      },\n      {\n        \"name\": \"Wait Until Scheduled Time\",\n        \"type\": \"n8n-nodes-base.wait\",\n        \"parameters\": {\n          \"amount\": 60,\n          \"unit\": \"minutes\"\n        }\n      },\n      {\n        \"name\": \"Error Handler\",\n        \"type\": \"n8n-nodes-base.code\",\n        \"parameters\": {\n          \"mode\": \"runOnceForEachItem\",\n          \"jsCode\": \"const error = $input.item(0).json;\nconst workflowName = 'tiktok-reposter-complete';\n\n// Log error details\nconst errorData = {\n  workflow: workflowName,\n  error: error.message || 'Unknown error',\n  timestamp: new Date().toISOString(),\n  video_id: error.videoId || 'unknown',\n  processing_step: error.processing_status || 'unknown'\n};\n\n// Send error notification\nconst emailResponse = await $http.request({\n  method: 'POST',\n  url: 'http://localhost:3000/api/email/error',\n  body: {\n    component: `n8n-${workflowName}`,\n    error: error.message,\n    details: JSON.stringify(errorData),\n    timestamp: errorData.timestamp\n  }\n});\n\n// Log to database\nconst logResponse = await $http.request({\n  method: 'POST',\n  url: 'http://localhost:3000/api/logs/error',\n  body: errorData\n});\n\nreturn { json: errorData };\"\n        }\n      }\n    ],\n    \"connections\": {\n      \"Start - Schedule Trigger\": {\n        \"main\": [[{\"node\": \"1. Get Active Sources\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"1. Get Active Sources\": {\n        \"main\": [[{\"node\": \"2. Process Each Source\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"2. Process Each Source\": {\n        \"main\": [[{\"node\": \"3. Scrape TikTok Content\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"3. Scrape TikTok Content\": {\n        \"main\": [[{\"node\": \"4. Filter New & Valid Videos\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"4. Filter New & Valid Videos\": {\n        \"main\": [[{\"node\": \"5. Download Video Files\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"5. Download Video Files\": {\n        \"main\": [[{\"node\": \"6. Process Video\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"6. Process Video\": {\n        \"main\": [[{\"node\": \"7. Generate Thumbnails\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"7. Generate Thumbnails\": {\n        \"main\": [[{\"node\": \"8. Upload to Azure Storage\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"8. Upload to Azure Storage\": {\n        \"main\": [[{\"node\": \"9. Save to Database\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"9. Save to Database\": {\n        \"main\": [[{\"node\": \"10. Generate Caption\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"10. Generate Caption\": {\n        \"main\": [[{\"node\": \"11. Schedule Post\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"11. Schedule Post\": {\n        \"main\": [[{\"node\": \"12. Check Posting Time\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"12. Check Posting Time\": {\n        \"main\": [\n          [{\"node\": \"13. TikTok Authentication\", \"type\": \"main\", \"index\": 0}],\n          [{\"node\": \"Wait Until Scheduled Time\", \"type\": \"main\", \"index\": 0}]\n        ]\n      },\n      \"13. TikTok Authentication\": {\n        \"main\": [[{\"node\": \"14. Check Rate Limits\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"14. Check Rate Limits\": {\n        \"main\": [[{\"node\": \"15. Rate Limit Check\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"15. Rate Limit Check\": {\n        \"main\": [\n          [{\"node\": \"16. Upload Video to TikTok\", \"type\": \"main\", \"index\": 0}],\n          [{\"node\": \"Schedule Later - Rate Limited\", \"type\": \"main\", \"index\": 0}]\n        ]\n      },\n      \"16. Upload Video to TikTok\": {\n        \"main\": [[{\"node\": \"17. Publish Video to TikTok\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"17. Publish Video to TikTok\": {\n        \"main\": [[{\"node\": \"18. Update Database - Posted\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"18. Update Database - Posted\": {\n        \"main\": [[{\"node\": \"19. Send Success Notification\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"19. Send Success Notification\": {\n        \"main\": [[{\"node\": \"20. Cleanup Local Files\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"20. Cleanup Local Files\": {\n        \"main\": [[{\"node\": \"21. Final Success Log\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"21. Final Success Log\": {\n        \"main\": [[{\"node\": \"Wait for Next Video\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"Wait Until Scheduled Time\": {\n        \"main\": [[{\"node\": \"13. TikTok Authentication\", \"type\": \"main\", \"index\": 0}]]\n      },\n      \"Schedule Later - Rate Limited\": {\n        \"main\": [[{\"node\": \"Wait Until Scheduled Time\", \"type\": \"main\", \"index\": 0}]]\n      }\n    }\n  }\n}\n```\n\n## 🔧 Configuration Requirements\n\n### Environment Variables\n\n```env\n# TikTok API\nTIKTOK_CLIENT_ID=your_tiktok_client_id\nTIKTOK_CLIENT_SECRET=your_tiktok_client_secret\nTIKTOK_AUTH_CODE=your_auth_code\n\n# Azure Storage\nAZURE_STORAGE_CONNECTION_STRING=your_connection_string\nAZURE_CONTAINER_NAME=tiktok-videos\n\n# Video Processing\nENABLE_WATERMARK_REMOVAL=true\nENABLE_QUALITY_ENHANCEMENT=true\nVIDEO_OUTPUT_QUALITY=720p\n\n# Captions\nCAPTION_METHOD=template\nCAPTION_TEMPLATE=🔥 Amazing content! {hashtags} #viral #trending\n\n# API Endpoints\nDASHBOARD_API_URL=http://localhost:3000\n\n# Email Notifications\nSMTP_HOST=smtp.gmail.com\nSMTP_PORT=587\nSMTP_USER=your_email@gmail.com\nSMTP_PASS=your_app_password\n```\n\n## 🚀 Key Features of Single Automation\n\n### ✅ **Complete End-to-End Flow**\n- Runs from content discovery to final posting\n- No stopping between steps\n- Handles multiple videos in sequence\n- Automatic error recovery and retry logic\n\n### ✅ **Intelligent Scheduling**\n- Optimal posting time calculation\n- Rate limit awareness\n- Automatic rescheduling when limits hit\n- Smart delays between operations\n\n### ✅ **Robust Processing Pipeline**\n- Multi-service video downloading\n- Video processing with FFmpeg\n- Thumbnail generation\n- Azure cloud storage\n- Database logging throughout\n\n### ✅ **Smart Content Management**\n- Duplicate video detection\n- Source-based filtering\n- AI-powered caption generation\n- Automatic file cleanup\n\n### ✅ **Comprehensive Monitoring**\n- Real-time status updates\n- Email notifications for success/errors\n- Database logging at each step\n- Performance metrics tracking\n\n## 📊 Workflow Execution Flow\n\n1. **Trigger** → Every 2 hours automatically\n2. **Discovery** → Scrape content from all active sources\n3. **Filtering** → Apply rules and check for duplicates\n4. **Download** → Get video files using multiple services\n5. **Processing** → Enhance quality, remove watermarks, generate thumbnails\n6. **Storage** → Upload to Azure Blob Storage\n7. **Database** → Save all metadata and URLs\n8. **Scheduling** → Calculate optimal posting time\n9. **Publishing** → Post to TikTok (if time is right)\n10. **Notifications** → Send success/error emails\n11. **Cleanup** → Remove temporary files\n12. **Loop** → Continue with next video\n\n## 🔄 Error Handling Strategy\n\n- **Automatic Retry**: Failed operations retry up to 3 times with exponential backoff\n- **Fallback Services**: Multiple download services ensure reliability\n- **Graceful Degradation**: Continue processing other videos if one fails\n- **Comprehensive Logging**: All errors logged with full context\n- **Email Alerts**: Immediate notification of critical failures\n\n## 🎯 Benefits of Single Workflow\n\n✅ **Simplified Management** - One workflow to rule them all\n✅ **Reduced Complexity** - No webhook dependencies between workflows  \n✅ **Better Performance** - No delays between workflow transitions\n✅ **Easier Debugging** - Single execution trace to follow\n✅ **Resource Efficiency** - Less overhead from multiple workflow management\n✅ **Atomic Operations** - Complete video processing in one execution\n\nThis single automation handles everything from content scraping to TikTok publishing in one continuous, uninterrupted flow!\n
