import Canvas from '../util/Canvas';
import ImageResult from '../util/ImageResult';
import ImageResizerCanvas from './ImageResizerCanvas';

function rotate(ir, angle) {
  return ir.toCanvas().then(function (canvas) {
    return applyRotate(canvas, ir.getType(), angle);
  });
}
function applyRotate(image, type, angle) {
  var canvas = Canvas.create(image.width, image.height);
  var context = Canvas.get2dContext(canvas);
  var translateX = 0, translateY = 0;

  angle = angle < 0 ? 360 + angle : angle;

  if (angle == 90 || angle == 270) {
    Canvas.resize(canvas, canvas.height, canvas.width);
  }

  if (angle == 90 || angle == 180) {
    translateX = canvas.width;
  }

  if (angle == 270 || angle == 180) {
    translateY = canvas.height;
  }

  context.translate(translateX, translateY);
  context.rotate(angle * Math.PI / 180);
  context.drawImage(image, 0, 0);

  return ImageResult.fromCanvas(canvas, type);
}

function flip(ir, axis) {
  return ir.toCanvas().then(function (canvas) {
    return applyFlip(canvas, ir.getType(), axis);
  });
}
function applyFlip(image, type, axis) {
  var canvas = Canvas.create(image.width, image.height);
  var context = Canvas.get2dContext(canvas);

  if (axis == 'v') {
    context.scale(1, -1);
    context.drawImage(image, 0, -canvas.height);
  } else {
    context.scale(-1, 1);
    context.drawImage(image, -canvas.width, 0);
  }

  return ImageResult.fromCanvas(canvas, type);
}

function crop(ir, x, y, w, h) {
  return ir.toCanvas().then(function (canvas) {
    return applyCrop(canvas, ir.getType(), x, y, w, h);
  });
}
function applyCrop(image, type, x, y, w, h) {
  var canvas = Canvas.create(w, h);
  var context = Canvas.get2dContext(canvas);

  context.drawImage(image, -x, -y);

  return ImageResult.fromCanvas(canvas, type);
}


function resize(ir, w, h) {
  return ir.toCanvas().then(function (canvas) {
    return ImageResizerCanvas.scale(canvas, w, h)
      .then(function (newCanvas) {
        return ImageResult.fromCanvas(newCanvas, ir.getType());
      });
  });
}

export default <any> {
  rotate,
  flip,
  crop,
  resize
};