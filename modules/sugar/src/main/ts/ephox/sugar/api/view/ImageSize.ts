export interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

const getImageSize = (url: string): Promise<ImageDimensions> => new Promise((resolve, reject) => {
  const img = document.createElement('img');

  const cleanUp = (): void => {
    if (img.parentNode) {
      img.parentNode.removeChild(img);
    }
  };

  img.addEventListener('load', () => {
    cleanUp();
    resolve({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  });

  img.addEventListener('error', () => {
    cleanUp();
    reject(`Failed to get image dimensions for: ${url}`);
  });

  document.body.appendChild(img);
  img.src = url;
});

export {
  getImageSize
};
