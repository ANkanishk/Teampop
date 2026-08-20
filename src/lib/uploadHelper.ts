/**
 * Upload helper for images and assets to avoid large Base64 blobs in state / localStorage
 */
export async function uploadImageToServer(file: File, folder: string = 'images'): Promise<string> {
  const reader = new FileReader();
  const fileData = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  try {
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: fileData,
        fileName: file.name,
        folder,
      }),
    });
    const data = await res.json();
    if (data.success && data.url) {
      return data.url;
    }
  } catch (err) {
    console.warn('Image upload to server failed, falling back to data URL', err);
  }

  return fileData;
}
