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
// 实例化成功回调
const initInstanceCallback = function (editor) {
  const container = editor.getBody();
  // 更新内容
  const updateContent = function () {
  };
  // 表格调整行、列宽度监听
  editor.on('change', function (e) {
  });
  editor.on('objectResized', function (e) {
  });
  // 失去焦点监听
  editor.on('blur', function (e) {
  });
  // 注册快捷键
  // FIXME: mac下快捷键使用command也注册不上，临时先兼容windows
  editor.shortcuts.add(`ctrl+alt+z`, 'A New Way To Redo', 'Redo');
};
tinymce.init({
  selector: 'div.tinymce',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  toolbar: 'table code',
  theme: 'inlite',
  language_url: 'https://static.speiyou.com/tinymce/4.7.13/langs/zh_CN.js',
  plugins: 'image media table paste contextmenu textpattern textcolor',
  insert_toolbar: '',
  selection_toolbar: 'talfontselect talfontsizeselect | bold italic underline dotted | forecolor backcolor | alignleft aligncenter alignright alignjustify  | outdent indent | removeformat',
  paste_data_images: true,
  paste_webkit_styles: 'color font font-size background font-family',
  inline: true,
  extended_valid_elements: 'svg[*],defs[*],path[*],g[*],use[*],text[*],rect[*],tspan[*],line[*],circle[*],ellipse[*]',
  contextmenu: 'inserttable | pagebreak | cell row column deletetable',
  table_responsive_width: false,
  init_instance_callback: initInstanceCallback
});

export {};