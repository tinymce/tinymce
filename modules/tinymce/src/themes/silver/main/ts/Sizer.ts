/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  GuiFactory, Attachment
} from '@ephox/alloy';
import Editor from 'tinymce/core/api/Editor';
import { renderSizer } from './ui/sizing/Sizer';
import { showSizerEvent } from './ui/sizing/SizerEvents';

const register = (editor: Editor, sink, extras) => {
  const topLeft = GuiFactory.build(renderSizer({}, extras.backstage));

  editor.on(showSizerEvent, (e) => {

  });

  editor.on('init', () => {
    Attachment.attach(sink, topLeft);
    // editor.on('ScrollContent ScrollWindow', hideOrRepositionIfNecessary);

    // FIX: Make it go away when the action makes it go away. E.g. deleting a column deletes the table.
    // editor.on('click keyup SetContent ObjectResized ResizeEditor', (e) => {

    // });

    // editor.on('focusout', (e) => {
    //   Delay.setEditorTimeout(editor, () => {
    //     if (Focus.search(sink.element()).isNone() && Focus.search(contextbar.element()).isNone()) {
    //       InlineView.hide(contextbar);
    //     }
    //   }, 0);
    // });

    // editor.on('SwitchMode', () => {
    //   if (editor.readonly) {
    //     InlineView.hide(contextbar);
    //   }
    // });

    // editor.on('NodeChange', (e) => {
    //   Focus.search(contextbar.element()).fold(
    //     () => {
    //       resetTimer(
    //         Delay.setEditorTimeout(editor, launchContextToolbar, 0)
    //       );
    //     },
    //     (_) => {

    //     }
    //   );
    // });
  });
};

export default {
  register
};
