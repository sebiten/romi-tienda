export async function convertImageToWebP(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();
  
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          image.src = reader.result;
        }
      };
  
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
  
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No canvas context');
  
        ctx.drawImage(image, 0, 0);
  
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject('Conversion failed');
            }
          },
          'image/webp',
          0.8 // calidad (puedes ajustarla entre 0 y 1)
        );
      };
  
      reader.readAsDataURL(file);
    });
  }
  