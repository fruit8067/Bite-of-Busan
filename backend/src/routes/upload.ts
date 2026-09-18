import { Router } from 'express';
import { del } from '@vercel/blob';
import { handleUpload } from '@vercel/blob/client';

const router = Router();

// 1. 클라이언트 직접 업로드를 위한 토큰 발급/인증 라우트
router.post('/blob-upload', async (req, res) => {
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // (선택 사항) 여기에 사용자 인증 로직을 추가하여 로그인한 유저만 업로드하게 할 수 있습니다.
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          tokenPayload: JSON.stringify({
            // 필요하다면 업로드 완료 시 전달받을 메타데이터를 여기에 넣습니다.
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Vercel Blob에 업로드가 완료된 후 Vercel 서버가 백엔드로 보내는 콜백입니다.
        // 여기서 DB에 이미지 URL(blob.url)을 저장하는 로직을 추가할 수 있습니다.
        console.log('업로드 완료:', blob.url);
      },
    });

    res.status(200).json(jsonResponse);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 2. 이미지 삭제 라우트
router.delete('/blob-delete', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: '삭제할 이미지의 URL이 필요합니다.' });
    }

    // Vercel Blob에서 파일 삭제
    await del(url);
    
    res.status(200).json({ success: true, message: '성공적으로 삭제되었습니다.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;