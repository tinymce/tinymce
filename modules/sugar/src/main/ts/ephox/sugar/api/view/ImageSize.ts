export interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

const getNaturalSize = (img: HTMLImageElement): ImageDimensions => ({
  width: img.naturalWidth,
  height: img.naturalHeight
});

const waitForImageSize = (img: HTMLImageElement, errorMessage: string): Promise<ImageDimensions> => new Promise((resolve, reject) => {
  const resolveSize = () => {
    resolve(getNaturalSize(img));
  };

  if (img.complete) {
    resolveSize();
  } else {
    const onLoad = () => {
      img.removeEventListener('error', onError);
      resolveSize();
    };

    const onError = () => {
      img.removeEventListener('load', onLoad);
      reject(new Error(errorMessage));
    };

    img.addEventListener('load', onLoad, { once: true });
    img.addEventListener('error', onError, { once: true });
  }
});

const getImageSizeFromImg = (img: HTMLImageElement): Promise<ImageDimensions> =>
  waitForImageSize(img, `Failed to get image dimensions for: ${img.src}`);

const getImageSizeFromUrl = (url: string): Promise<ImageDimensions> => {
  const img = document.createElement('img');
  img.src = url;
  return getImageSizeFromImg(img);
};

export {
  getImageSizeFromImg,
  getImageSizeFromUrl
};
