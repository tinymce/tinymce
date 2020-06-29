/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getNumberStyles = (editor: Editor) => {
  const styles = editor.getParam('advlist_number_styles', 'default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman');
  return styles ? styles.split(/[ ,]/) : [];
};

const getBulletStyles = (editor: Editor) => {
  const styles = editor.getParam('advlist_bullet_styles', 'default,circle,square');
  return styles ? styles.split(/[ ,]/) : [];
};

export {
  getNumberStyles,
  getBulletStyles
};
