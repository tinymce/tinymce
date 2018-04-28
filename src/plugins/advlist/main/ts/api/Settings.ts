/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const getNumberStyles = function (editor) {
  const styles = editor.getParam('advlist_number_styles', 'default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman');
  return styles ? styles.split(/[ ,]/) : [];
};

const getBulletStyles = function (editor) {
  const styles = editor.getParam('advlist_bullet_styles', 'default,circle,disc,square');
  return styles ? styles.split(/[ ,]/) : [];
};

export default {
  getNumberStyles,
  getBulletStyles
};