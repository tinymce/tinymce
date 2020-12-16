/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Representing, SketchSpec } from '@ephox/alloy';
import { Optional, Thunk } from '@ephox/katamari';

import * as LinkBridge from '../bridge/LinkBridge';
import * as RangePreserver from '../util/RangePreserver';
import * as Buttons from './Buttons';
import * as Inputs from './Inputs';
import * as SerialisedDialog from './SerialisedDialog';

const getGroups = Thunk.cached((realm, editor) => {
  return [
    {
      label: 'the link group',
      items: [
        SerialisedDialog.sketch({
          fields: [
            Inputs.field('url', 'Type or paste URL'),
            Inputs.field('text', 'Link text'),
            Inputs.field('title', 'Link title'),
            Inputs.field('target', 'Link target'),
            Inputs.hidden('link')
          ],

          // Do not include link
          maxFieldIndex: [ 'url', 'text', 'title', 'target' ].length - 1,
          getInitialValue: (/* dialog */) => {
            return Optional.some(
              LinkBridge.getInfo(editor)
            );
          },

          onExecute: (dialog, _simulatedEvent) => {
            const info = Representing.getValue(dialog);
            LinkBridge.applyInfo(editor, info);
            realm.restoreToolbar();
            editor.focus();
          }
        })
      ]
    }
  ];
});

const sketch = (realm, editor): SketchSpec => {
  return Buttons.forToolbarStateAction(editor, 'link', 'link', () => {
    const groups = getGroups(realm, editor);

    realm.setContextToolbar(groups);
    // Focus inside
    // On Android, there is a bug where if you position the cursor (collapsed) within a
    // word, and you blur the editor (by focusing an input), the selection moves to the
    // end of the word (http://fiddle.tinymce.com/xNfaab/3 or 4). This is actually dependent
    // on your keyboard (Google Keyboard) and is probably considered a feature. It does
    // not happen on Samsung (for example).
    RangePreserver.forAndroid(editor, () => {
      realm.focusToolbar();
    });

    LinkBridge.query(editor).each((link) => {
      editor.selection.select(link.dom);
    });
  });
};

export {
  sketch
};
