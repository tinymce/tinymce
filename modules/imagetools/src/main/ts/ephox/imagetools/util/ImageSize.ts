const getWidth = (image: HTMLImageElement | HTMLCanvasElement): number => {
  return (image as HTMLImageElement).naturalWidth || image.width;
};

const getHeight = (image: HTMLImageElement | HTMLCanvasElement): number => {
  return (image as HTMLImageElement).naturalHeight || image.height;
};

export {
  getWidth,
  getHeight
};
