/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Dragging, Focusing, Keying, SimpleSpec, Tabstopping } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as Icons from '../icons/Icons';
import { resize, ResizeTypes } from '../sizing/Resize';

const getResizeType = (editor: Editor): ResizeTypes => {
  // If autoresize is enabled, disable resize
  const fallback = !editor.hasPlugin('autoresize');
  const resize = editor.getParam('resize', fallback);
  if (resize === false) {
    return ResizeTypes.None;
  } else if (resize === 'both') {
    return ResizeTypes.Both;
  } else {
    return ResizeTypes.Vertical;
  }
};

const keyboardHandler = (editor: Editor, resizeType: ResizeTypes, x: number, y: number): Optional<boolean> => {
  const scale = 20;
  const delta = SugarPosition(x * scale, y * scale);
  resize(editor, delta, resizeType);
  return Optional.some(true);
};

export const renderResizeHandler = (editor: Editor, providersBackstage: UiFactoryBackstageProviders): Optional<SimpleSpec> => {
  const resizeType = getResizeType(editor);
  if (resizeType === ResizeTypes.None) {
    return Optional.none();
  }

  return Optional.some(Icons.render('resize-handle', {
    tag: 'div',
    classes: [ 'tox-statusbar__resize-handle' ],
    attributes: {
      title: providersBackstage.translate('Resize'), // TODO: tooltips AP-213
    },
    behaviours: [
      Dragging.config({
        mode: 'mouse',
        repositionTarget: false,
        onDrag: (_comp, _target, delta) => resize(editor, delta, resizeType),
        blockerClass: 'tox-blocker'
      }),
      Keying.config({
        mode: 'special',
        onLeft: () => keyboardHandler(editor, resizeType, -1, 0),
        onRight: () => keyboardHandler(editor, resizeType, 1, 0),
        onUp: () => keyboardHandler(editor, resizeType, 0, -1),
        onDown: () => keyboardHandler(editor, resizeType, 0, 1),
      }),
      Tabstopping.config({}),
      Focusing.config({})
    ]
  }, providersBackstage.icons));
};
