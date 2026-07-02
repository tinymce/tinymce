export interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

const getImageSize = (url: string): Promise<ImageDimensions> => new Promise((resolve, reject) => {
  const img = document.createElement('img');

  img.addEventListener('load', () => {
    resolve({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  });

  img.addEventListener('error', () => {
    reject(`Failed to get image dimensions for: ${url}`);
  });

  img.src = url;
});

export {
  getImageSize
};
