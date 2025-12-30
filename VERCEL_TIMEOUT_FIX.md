# 🔧 Vercel Timeout Fix - Async Processing Implementation

## Problem
Virtual try-on generation was timing out on Vercel after 130 seconds because:
- Gemini API takes 2-5 minutes to generate images
- Vercel Hobby plan has 10-second timeout
- Vercel Pro plan has 60-second timeout (configurable up to 300s)

## Solution: Async Processing with Polling

Instead of waiting for the generation to complete, we now:
1. **Create a job** and return immediately
2. **Process in background** using `setImmediate()`
3. **Poll for status** from the frontend

---

## 📋 Changes Made

### 1. Backend Changes

#### **Updated `/tryon/generate` Endpoint**
- Now returns immediately with `status: "pending"`
- Processes generation in background
- Returns job ID for status polling

**Response:**
```json
{
  "success": true,
  "message": "Virtual try-on job created. Processing in background.",
  "generated_image_id": "uuid",
  "status": "pending",
  "note": "Poll /tryon/status/:id to check progress"
}
```

#### **New `/tryon/status/:imageId` Endpoint**
Check the status of a generation job.

**Request:**
```
GET /tryon/status/:imageId
Authorization: Bearer <token>
```

**Response (Pending):**
```json
{
  "id": "uuid",
  "status": "pending",
  "result_url": null,
  "error_message": null,
  "created_at": "2024-12-30T10:00:00Z",
  "updated_at": "2024-12-30T10:00:00Z"
}
```

**Response (Completed):**
```json
{
  "id": "uuid",
  "status": "completed",
  "result_url": "https://s3-signed-url...",
  "generation_time_ms": 125000,
  "created_at": "2024-12-30T10:00:00Z",
  "updated_at": "2024-12-30T10:02:05Z"
}
```

**Response (Failed):**
```json
{
  "id": "uuid",
  "status": "failed",
  "error_message": "Gemini API error: ...",
  "created_at": "2024-12-30T10:00:00Z",
  "updated_at": "2024-12-30T10:01:30Z"
}
```

#### **Updated `vercel.json`**
```json
{
  "functions": {
    "index.js": {
      "maxDuration": 300,
      "memory": 3008
    }
  }
}
```

---

### 2. Frontend Changes

#### **Updated Camera Screen**
Added polling logic to check job status every 5 seconds.

**Polling Function:**
```typescript
async function pollJobStatus(jobId: string, token: string): Promise<string> {
  const maxAttempts = 60; // 60 attempts = 5 minutes max
  const pollInterval = 5000; // 5 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const statusResponse = await fetch(`http://localhost:3000/tryon/status/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const statusData = await statusResponse.json();

    if (statusData.status === "completed") {
      return statusData.result_url;
    }

    if (statusData.status === "failed") {
      throw new Error(statusData.error_message || "Generation failed");
    }

    // Wait 5 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error("Job timed out. Please try again.");
}
```

---

## 🎯 How It Works

### Flow Diagram
```
User → Upload Images → Backend creates job → Returns job ID
                                ↓
                        Background processing starts
                                ↓
Frontend polls every 5s → Check status → Pending? → Keep polling
                                ↓
                            Completed? → Show result
                                ↓
                            Failed? → Show error
```

### Timeline
1. **0s**: User uploads images
2. **0.5s**: Backend creates job, returns job ID
3. **0.5s - 5m**: Background processing (Gemini API)
4. **Every 5s**: Frontend polls for status
5. **2-5m**: Job completes, frontend shows result

---

## ✅ Benefits

1. **No Timeouts**: Frontend doesn't wait for long-running process
2. **Better UX**: User sees "Processing..." state with polling
3. **Scalable**: Can handle multiple concurrent jobs
4. **Vercel Compatible**: Works on Hobby and Pro plans
5. **Error Handling**: Failed jobs are tracked in database

---

## 🚀 Deployment

### For Vercel Pro/Enterprise
- Set `maxDuration: 300` (5 minutes)
- Set `memory: 3008` (3GB)
- Background processing will complete within timeout

### For Vercel Hobby
- Background processing may be killed after 10s
- Consider using external queue (AWS SQS, Redis Queue)
- Or deploy backend separately (Railway, Render, AWS)

---

## 📊 Database Status Flow

```
pending → processing → completed
                    ↓
                  failed
```

- **pending**: Job created, waiting to start
- **processing**: Gemini API is generating
- **completed**: Result ready, URL available
- **failed**: Error occurred, message stored

---

## 🔍 Testing

1. **Create a job**: POST /tryon/generate
2. **Check status**: GET /tryon/status/:id
3. **Verify polling**: Frontend should poll every 5s
4. **Check result**: Should show image when completed

---

## 📝 Notes

- Polling interval: 5 seconds
- Max polling time: 5 minutes (60 attempts)
- Background processing uses `setImmediate()` for non-blocking execution
- All jobs are tracked in `generated_images` table
- Failed jobs store error messages for debugging

