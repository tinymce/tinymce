export interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

// TODO: Figure out if these would ever be something other than numbers. This was added in: #TINY-1350
const parseIntAndGetMax = (val1: any, val2: any): number =>
  Math.max(parseInt(val1, 10), parseInt(val2, 10));

const getImageSize = (url: string): Promise<ImageDimensions> => new Promise((resolve, reject) => {
  const img = document.createElement('img');

  const cleanUp = (): void => {
    if (img.parentNode) {
      img.parentNode.removeChild(img);
    }
  };

  img.addEventListener('load', () => {
    const width = parseIntAndGetMax(img.width || img.naturalWidth, img.clientWidth);
    const height = parseIntAndGetMax(img.height || img.naturalHeight, img.clientHeight);
    const dimensions = { width, height };
    cleanUp();
    resolve(dimensions);
  });

  img.addEventListener('error', () => {
    cleanUp();
    reject(`Failed to get image dimensions for: ${url}`);
  });

  const style = img.style;
  style.visibility = 'hidden';
  style.position = 'fixed';
  style.bottom = style.left = '0px';
  style.width = style.height = 'auto';

  document.body.appendChild(img);
  img.src = url;
});

export {
  getImageSize
};
