function getWidth(image) {
  return image.naturalWidth || image.width;
}

function getHeight(image) {
  return image.naturalHeight || image.height;
}

export default <any> {
  getWidth,
  getHeight
};