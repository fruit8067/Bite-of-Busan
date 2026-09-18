// frontend/src/api/uploadApi.ts
import { upload } from '@vercel/blob/client';
import { API_BASE_URL } from './config';

// Vercel Blob 직접 업로드 함수
export const uploadImageToBlob = async (uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const filename = (uri.split('/').pop() || `upload-${Date.now()}.jpg`).split('?')[0];

  const newBlob = await upload(filename, blob, {
    access: 'public',
    handleUploadUrl: `${API_BASE_URL}/api/upload/blob-upload`,
  });

  return newBlob.url;
};

// 업로드된 이미지 삭제 함수
export const deleteImageFromBlob = async (imageUrl: string) => {
  const response = await fetch(`${API_BASE_URL}/api/upload/blob-delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!response.ok) {
    throw new Error('삭제 요청 실패');
  }
  return true;
};