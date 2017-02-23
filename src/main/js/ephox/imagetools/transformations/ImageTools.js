define(
  'ephox.imagetools.transformations.ImageTools',
  [
    'ephox.imagetools.util.Canvas',
    'ephox.imagetools.util.ImageResult',
    'ephox.imagetools.transformations.ImageResizerCanvas'
  ],
  function (Canvas, ImageResult, ImageResizerCanvas) {
    function rotate(ir, angle) {
      var image = ir.toCanvas();
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

      return ImageResult.fromCanvas(canvas, ir.getType());
    }

    function flip(ir, axis) {
      var image = ir.toCanvas();
      var canvas = Canvas.create(image.width, image.height);
      var context = Canvas.get2dContext(canvas);

      if (axis == 'v') {
        context.scale(1, -1);
        context.drawImage(image, 0, -canvas.height);
      } else {
        context.scale(-1, 1);
        context.drawImage(image, -canvas.width, 0);
      }

      return ImageResult.fromCanvas(canvas, ir.getType());
    }

    function crop(ir, x, y, w, h) {
      var image = ir.toCanvas();
      var canvas = Canvas.create(w, h);
      var context = Canvas.get2dContext(canvas);

      context.drawImage(image, -x, -y);

      return ImageResult.fromCanvas(canvas, ir.getType());
    }


    function resize(ir, w, h) {
      return ImageResizerCanvas.scale(ir.toCanvas(), w, h)
        .then(function (canvas) {
          return ImageResult.fromCanvas(canvas, ir.getType());
        });
    }

    return {
      rotate: rotate,
      flip: flip,
      crop: crop,
      resize: resize
    };
  });
