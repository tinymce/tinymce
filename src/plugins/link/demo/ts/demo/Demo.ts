/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'link code',
  toolbar: 'link code',
  link_data_list: [
    { title: 'Mobile URL', slug: 'mobile_url' },
    { title: 'Short URL', slug: 'short_url' },
  ],
  height: 600
});

export {};
