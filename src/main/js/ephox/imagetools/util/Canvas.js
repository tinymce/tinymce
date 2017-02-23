define(
  'ephox.imagetools.util.Canvas',
  [
  ],
  function () {
    function create(width, height) {
      return resize(document.createElement('canvas'), width, height);
    }

    function clone(canvas) {
      var tCanvas, ctx;
      tCanvas = create(canvas.width, canvas.height);
      ctx = get2dContext(tCanvas);
      ctx.drawImage(canvas, 0, 0);
      return tCanvas;
    }

    function get2dContext(canvas) {
      return canvas.getContext("2d");
    }

    function get3dContext(canvas) {
      var gl = null;
      try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      }
      catch (e) { }

      if (!gl) { // it seems that sometimes it doesn't throw exception, but still fails to get context
        gl = null;
      }
      return gl;
    }

    function resize(canvas, width, height) {
      canvas.width = width;
      canvas.height = height;

      return canvas;
    }

    return {
      create: create,
      clone: clone,
      resize: resize,
      get2dContext: get2dContext,
      get3dContext: get3dContext
    };
  });