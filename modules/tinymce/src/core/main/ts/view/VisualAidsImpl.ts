/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import Editor from '../api/Editor';
import * as Settings from '../api/Settings';

export const addVisualInternal = (editor: Editor, elm?: HTMLElement) => {
  const dom = editor.dom;
  elm = elm || editor.getBody();

  if (editor.hasVisual === undefined) {
    editor.hasVisual = Settings.isVisualAidsEnabled(editor);
  }

  Arr.each(dom.select('table,a', elm), (elm) => {
    switch (elm.nodeName) {
      case 'TABLE':
        const cls = Settings.getVisualAidsTableClass(editor);
        const value = dom.getAttrib(elm, 'border');

        if ((!value || value === '0') && editor.hasVisual) {
          dom.addClass(elm, cls);
        } else {
          dom.removeClass(elm, cls);
        }

        break;

      case 'A':
        if (!dom.getAttrib(elm, 'href')) {
          const value = dom.getAttrib(elm, 'name') || elm.id;
          const cls = Settings.getVisualAidsAnchorClass(editor);

          if (value && editor.hasVisual) {
            dom.addClass(elm, cls);
          } else {
            dom.removeClass(elm, cls);
          }
        }

        break;
    }
  });

  editor.fire('VisualAid', { element: elm, hasVisual: editor.hasVisual });
};
