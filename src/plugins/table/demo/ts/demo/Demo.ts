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
  selector: 'div.tinymce',
  // theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  // plugins: 'table code contextmenu paste',
  toolbar: 'table code',
  // media_dimensions: false,
  // selection_toolbar: 'talfontselect talfontsizeselect | bold italic underline dotted | forecolor backcolor | alignleft aligncenter alignright alignjustify  | outdent indent | removeformat',
  // media_live_embeds: false,
  // media_url_resolver: function (data, resolve) {
  // resolve({
  //   html: '<iframe src="' + data.url + '" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>'});
  // },
  height: 600,
  theme: 'inlite',
  language_url: 'https://static.speiyou.com/tinymce/4.7.13/langs/zh_CN.js',
  plugins: 'image media table paste contextmenu textpattern textcolor',
  insert_toolbar: '',
  selection_toolbar: 'talfontselect talfontsizeselect | bold italic underline dotted | forecolor backcolor | alignleft aligncenter alignright alignjustify  | outdent indent | removeformat',
  paste_data_images: true,
  paste_webkit_styles: 'color font font-size background font-family',
  inline: true,
  extended_valid_elements: 'svg[*],defs[*],path[*],g[*],use[*],text[*],rect[*],tspan[*],line[*],circle[*],ellipse[*]',
});

export {};