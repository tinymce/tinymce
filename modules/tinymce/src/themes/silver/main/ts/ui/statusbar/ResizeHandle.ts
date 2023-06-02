import { Dragging, Focusing, Keying, SimpleSpec, Tabstopping } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../../api/Options';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as Icons from '../icons/Icons';
import { resize, ResizeTypes } from '../sizing/Resize';

const getResizeType = (editor: Editor): ResizeTypes => {
  const resize = Options.getResize(editor);
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

  const resizeLabel = resizeType === ResizeTypes.Both
    ? 'Press the arrow keys to resize the editor.'
    : 'Press the Up and Down arrow keys to resize the editor.';

  return Optional.some(Icons.render('resize-handle', {
    tag: 'div',
    classes: [ 'tox-statusbar__resize-handle' ],
    attributes: {
      'title': providersBackstage.translate('Resize'), // TODO: tooltips AP-213
      'aria-label': providersBackstage.translate(resizeLabel),
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
