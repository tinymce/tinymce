/**
 * Sizzle.jQuery.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global jQuery:true */

/*
 * Fake Sizzle using jQuery.
 */
define(
  'tinymce.core.dom.Sizzle',
  [
  ],
  function () {
    // Detect if jQuery is loaded
    if (!window.jQuery) {
      throw new Error("Load jQuery first");
    }

    return jQuery.find;
  }
);
