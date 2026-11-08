import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fast client-side image compression and downscaling to prevent slow uploads and crashes
export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<{ file: File; dataUrl: string }> {
  if (file.type.startsWith('video/')) {
    const objectUrl = URL.createObjectURL(file);
    return { file, dataUrl: objectUrl };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const fallbackUrl = e.target?.result as string;
          resolve({ file, dataUrl: fallbackUrl });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve({ file: compressedFile, dataUrl });
            } else {
              resolve({ file, dataUrl });
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        resolve({ file, dataUrl: URL.createObjectURL(file) });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve({ file, dataUrl: URL.createObjectURL(file) });
    };
    reader.readAsDataURL(file);
  });
}
