/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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