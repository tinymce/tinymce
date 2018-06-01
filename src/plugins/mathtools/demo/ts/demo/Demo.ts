/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

// tslint:disable:no-console

declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'mathtools imagetools code',
  add_unload_trigger: false,
  automatic_uploads: false,
  images_reuse_filename: true,
  paste_data_images: true,
  image_caption: true,
  height: 600,
  extended_valid_elements: 'span[*],svg[*],defs[*],path[*],g[*],use[*],text[*],rect[*],tspan[*],line[*],circle[*],ellipse[*]',
  toolbar1: 'undo redo | styleselect | alignleft aligncenter alignright alignjustify | link image | media | emoticons',
 
});

export {};