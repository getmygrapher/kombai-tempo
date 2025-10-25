# Supabase Storage Setup Guide
## Portfolio & Profile Images Configuration

This guide explains how to set up Supabase Storage buckets for the Profile Management system.

---

## 📦 Required Storage Buckets

### 1. **Portfolio Images** (`portfolio-images`)
Stores professional portfolio items uploaded by users.

**Configuration:**
```typescript
// Bucket Settings
{
  name: "portfolio-images",
  public: true,  // Public read access
  fileSizeLimit: 5242880,  // 5MB max
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ]
}
```

**Folder Structure:**
```
portfolio-images/
├── {user_id}/
│   ├── original/
│   │   └── {timestamp}_{filename}.jpg
│   ├── thumbnails/
│   │   └── {timestamp}_{filename}_thumb.jpg
│   └── medium/
│       └── {timestamp}_{filename}_medium.jpg
```

### 2. **Profile Avatars** (`profile-avatars`)
Stores user profile photos.

**Configuration:**
```typescript
{
  name: "profile-avatars",
  public: true,
  fileSizeLimit: 2097152,  // 2MB max
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png"
  ]
}
```

### 3. **Review Media** (`review-media`)
Stores photos attached to reviews.

**Configuration:**
```typescript
{
  name: "review-media",
  public: true,
  fileSizeLimit: 3145728,  // 3MB max per image
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png"
  ]
}
```

---

## 🔒 Row Level Security (RLS) Policies

### Portfolio Images Policies

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own images
CREATE POLICY "Users can update own portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read access
CREATE POLICY "Public can view portfolio images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-images');
```

### Profile Avatars Policies

```sql
-- Allow authenticated users to upload avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read access
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-avatars');
```

### Review Media Policies

```sql
-- Allow authenticated users to upload review media
CREATE POLICY "Users can upload review media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-media'
);

-- Public read access
CREATE POLICY "Public can view review media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-media');
```

---

## 📝 Setup Instructions

### Step 1: Create Buckets via Supabase Dashboard

1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Create each bucket with settings above
4. Enable **Public bucket** for all three

### Step 2: Apply RLS Policies

Run the SQL policies above in **SQL Editor**:

```sql
-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Then run all the CREATE POLICY statements
```

### Step 3: Test Upload Functionality

Use the provided service functions to test:

```typescript
import { uploadPortfolioImage } from './services/storageService';

// Test upload
const file = new File(['...'], 'test.jpg', { type: 'image/jpeg' });
const result = await uploadPortfolioImage(file);
console.log('Uploaded:', result.publicUrl);
```

---

## 🔧 Image Processing Pipeline

### On Upload:
1. **Validate** file type and size
2. **Extract EXIF** data (if available)
3. **Upload original** to `original/` folder
4. **Generate thumbnail** (300x300px)
5. **Generate medium** size (800x600px)
6. **Save URLs** to database

### Example Implementation:

```typescript
import { supabase } from './supabaseClient';
import { extractEXIF } from './exifService';

export async function uploadPortfolioImage(
  file: File,
  userId: string
): Promise<{
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  exifData: any;
}> {
  // 1. Validate
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large (max 5MB)');
  }
  
  if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Invalid file type');
  }

  // 2. Extract EXIF
  const exifData = await extractEXIF(file);

  // 3. Generate unique filename
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const originalPath = `${userId}/original/${fileName}`;

  // 4. Upload original
  const { data: originalData, error: originalError } = await supabase.storage
    .from('portfolio-images')
    .upload(originalPath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (originalError) throw originalError;

  // 5. Get public URL
  const { data: { publicUrl: originalUrl } } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(originalPath);

  // 6. TODO: Generate thumbnails (use image processing service or Edge Function)
  // For now, return original URL for all sizes
  const thumbnailUrl = originalUrl;
  const mediumUrl = originalUrl;

  return {
    originalUrl,
    thumbnailUrl,
    mediumUrl,
    exifData
  };
}
```

---

## 🚀 Production Considerations

### Image Optimization
- **Use Supabase Image Transformations** (Pro plan) or
- **Implement Edge Function** for on-the-fly resizing
- **Use imgix or Cloudinary** for advanced processing

### CDN Configuration
- Enable **Cloudflare CDN** for faster image delivery
- Set appropriate **cache headers**
- Use **WebP format** with fallbacks

### Monitoring
- Track **storage usage** (Supabase dashboard)
- Monitor **bandwidth** consumption
- Set up **alerts** for quota limits

### Cost Optimization
- Implement **image compression** before upload
- Use **lazy loading** for portfolio galleries
- Consider **archiving** old unused images

---

## 📊 Usage Tracking

Create a helper function to track storage metrics:

```typescript
export async function getStorageUsage(): Promise<{
  portfolioImages: { count: number; sizeBytes: number };
  profileAvatars: { count: number; sizeBytes: number };
  reviewMedia: { count: number; sizeBytes: number };
}> {
  const uid = await getCurrentUserId();

  // Query storage for user's files
  const { data: portfolioFiles } = await supabase.storage
    .from('portfolio-images')
    .list(uid, { limit: 1000 });

  const portfolioSize = portfolioFiles?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0;

  return {
    portfolioImages: {
      count: portfolioFiles?.length || 0,
      sizeBytes: portfolioSize
    },
    profileAvatars: { count: 0, sizeBytes: 0 },
    reviewMedia: { count: 0, sizeBytes: 0 }
  };
}
```

---

## 🔐 Security Best Practices

1. **Validate** file types on both client and server
2. **Scan** uploads for malware (consider integration)
3. **Rate limit** uploads per user
4. **Watermark** portfolio images (optional, for Pro tier)
5. **Monitor** for abuse and inappropriate content

---

## 📱 Client-Side Upload Example

```typescript
import { portfolioService } from './services/profileManagementService';
import { uploadPortfolioImage } from './services/storageService';

async function handlePortfolioUpload(file: File) {
  try {
    // 1. Upload to storage
    const uploadResult = await uploadPortfolioImage(file, userId);

    // 2. Save to database
    const { itemId } = await portfolioService.addPortfolioItem({
      title: 'New Portfolio Item',
      imageUrl: uploadResult.originalUrl,
      thumbnailUrl: uploadResult.thumbnailUrl,
      exifData: uploadResult.exifData
    });

    console.log('Portfolio item created:', itemId);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Buckets created in Supabase Dashboard
- [ ] Public access enabled for all buckets
- [ ] RLS policies applied and working
- [ ] Test upload from client succeeds
- [ ] Public URLs are accessible
- [ ] File size limits are enforced
- [ ] MIME type validation works
- [ ] User can only access their own files (write)
- [ ] Anyone can view files (read)

---

**Next Steps:**
1. Create the storage service implementation (`/src/services/storageService.ts`)
2. Integrate with portfolio components
3. Implement image optimization (thumbnails)
4. Add progress indicators for uploads
5. Test with various file types and sizes
