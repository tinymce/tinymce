/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyEvents, Behaviour, Dragging, Focusing, NativeEvents, SimpleSpec, SimulatedEvent, Tabstopping } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { EventArgs, SugarPosition } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { get as getIcon } from '../icons/Icons';
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

const keyboardHandler = (editor: Editor, resizeType: ResizeTypes, event: SimulatedEvent<EventArgs<KeyboardEvent>>) => {
  const scale = 3;
  let left = 0, top = 0;
  switch (event.event.raw.keyCode) {
    case VK.LEFT:
      left -= scale;
      break;
    case VK.RIGHT:
      left += scale;
      break;
    case VK.UP:
      top -= scale;
      break;
    case VK.DOWN:
      top += scale;
      break;
    default:
      return;
  }

  const delta = SugarPosition(left, top);
  event.stop();
  resize(editor, delta, resizeType);
};

export const renderResizeHandler = (editor: Editor, providersBackstage: UiFactoryBackstageProviders): Optional<SimpleSpec> => {
  const resizeType = getResizeType(editor);
  if (resizeType === ResizeTypes.None) {
    return Optional.none();
  }

  return Optional.some({
    dom: {
      tag: 'div',
      classes: [ 'tox-statusbar__resize-handle' ],
      attributes: {
        'title': providersBackstage.translate('Resize'), // TODO: tooltips AP-213
        'aria-hidden': 'true'
      },
      innerHtml: getIcon('resize-handle', providersBackstage.icons)
    },
    events: AlloyEvents.derive([
      AlloyEvents.run<EventArgs<KeyboardEvent>>(NativeEvents.keydown(), (_comp, event) => keyboardHandler(editor, resizeType, event))
    ]),
    behaviours: Behaviour.derive([
      Dragging.config({
        mode: 'mouse',
        repositionTarget: false,
        onDrag: (_comp, _target, delta) => resize(editor, delta, resizeType),
        blockerClass: 'tox-blocker'
      }),
      Tabstopping.config({}),
      Focusing.config({})
    ])
  });
};
