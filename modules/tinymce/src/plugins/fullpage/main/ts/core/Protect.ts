/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';

declare const escape: any;
declare const unescape: any;

const protectHtml = (protect: RegExp[] | undefined, html: string): string => {
  Tools.each(protect, (pattern) => {
    html = html.replace(pattern, (str) => {
      return '<!--mce:protected ' + escape(str) + '-->';
    });
  });

  return html;
};

const unprotectHtml = (html: string): string => {
  return html.replace(/<!--mce:protected ([\s\S]*?)-->/g, (a, m) => {
    return unescape(m);
  });
};

export {
  protectHtml,
  unprotectHtml
};
