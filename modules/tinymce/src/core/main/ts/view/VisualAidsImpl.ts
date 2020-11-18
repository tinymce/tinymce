/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Type } from '@ephox/katamari';
import Editor from '../api/Editor';
import * as Settings from '../api/Settings';

export const addVisualInternal = (editor: Editor, elm?: HTMLElement) => {
  const dom = editor.dom;
  const scope = Type.isNonNullable(elm) ? elm : editor.getBody();

  if (Type.isUndefined(editor.hasVisual)) {
    editor.hasVisual = Settings.isVisualAidsEnabled(editor);
  }

  Arr.each(dom.select('table,a', scope), (matchedElm) => {
    switch (matchedElm.nodeName) {
      case 'TABLE':
        const cls = Settings.getVisualAidsTableClass(editor);
        const value = dom.getAttrib(matchedElm, 'border');

        if ((!value || value === '0') && editor.hasVisual) {
          dom.addClass(matchedElm, cls);
        } else {
          dom.removeClass(matchedElm, cls);
        }

        break;

      case 'A':
        if (!dom.getAttrib(matchedElm, 'href')) {
          const value = dom.getAttrib(matchedElm, 'name') || matchedElm.id;
          const cls = Settings.getVisualAidsAnchorClass(editor);

          if (value && editor.hasVisual) {
            dom.addClass(matchedElm, cls);
          } else {
            dom.removeClass(matchedElm, cls);
          }
        }

        break;
    }
  });

  editor.fire('VisualAid', { element: elm, hasVisual: editor.hasVisual });
};
