/**
 * Canvas.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains various canvas functions.
 */
define("ephox/imagetools/util/Canvas", [], function() {
  function create(width, height) {
    return resize(document.createElement('canvas'), width, height);
  }

  function get2dContext(canvas) {
    return canvas.getContext("2d");
  }

  function get3dContext(canvas) {
      var gl = null;
      try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      }
      catch(e) {}

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
    resize: resize,
    get2dContext: get2dContext,
    get3dContext: get3dContext
  };
});