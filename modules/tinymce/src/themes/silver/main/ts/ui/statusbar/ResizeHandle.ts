import { AddEventsBehaviour, AlloyComponent, AlloyEvents, Dragging, Focusing, Keying, SimpleSpec, SystemEvents, Tabstopping, Tooltipping } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { Attribute, SugarPosition } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';

import * as Options from '../../api/Options';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as Icons from '../icons/Icons';
import * as Resize from '../sizing/Resize';

const getResizeType = (editor: Editor): Resize.ResizeTypes => {
  const resize = Options.getResize(editor);
  if (resize === false) {
    return Resize.ResizeTypes.None;
  } else if (resize === 'both') {
    return Resize.ResizeTypes.Both;
  } else {
    return Resize.ResizeTypes.Vertical;
  }
};

const getAriaValuetext = (dimensions: Resize.EditorDimensions, resizeType: Resize.ResizeTypes): string => {
  return resizeType === Resize.ResizeTypes.Both
    ? I18n.translate([ `Editor's height: {0} pixels, Editor's width: {1} pixels`, dimensions.height, dimensions.width ])
    : I18n.translate([ `Editor's height: {0} pixels`, dimensions.height ]);
};

const setAriaValuetext = (comp: AlloyComponent, dimensions: Resize.EditorDimensions, resizeType: Resize.ResizeTypes) => {
  Attribute.set(comp.element, 'aria-valuetext', getAriaValuetext(dimensions, resizeType));
};

const keyboardHandler = (editor: Editor, comp: AlloyComponent, resizeType: Resize.ResizeTypes, x: number, y: number): Optional<boolean> => {
  const scale = 20;
  const delta = SugarPosition(x * scale, y * scale);

  const newDimentions = Resize.resize(editor, delta, resizeType);
  setAriaValuetext(comp, newDimentions, resizeType);

  return Optional.some(true);
};

export const renderResizeHandler = (editor: Editor, providersBackstage: UiFactoryBackstageProviders): Optional<SimpleSpec> => {
  const resizeType = getResizeType(editor);
  if (resizeType === Resize.ResizeTypes.None) {
    return Optional.none();
  }

  const resizeLabel = resizeType === Resize.ResizeTypes.Both
    ? I18n.translate('Press the arrow keys to resize the editor.')
    : I18n.translate('Press the Up and Down arrow keys to resize the editor.');

  const cursorClass = resizeType === Resize.ResizeTypes.Both
    ? 'tox-statusbar__resize-cursor-both'
    : 'tox-statusbar__resize-cursor-default';

  return Optional.some(Icons.render('resize-handle', {
    tag: 'div',
    classes: [ 'tox-statusbar__resize-handle', cursorClass ],
    attributes: {
      'aria-label': providersBackstage.translate(resizeLabel),
      'data-mce-name': 'resize-handle',
      'role': 'separator'
    },
    behaviours: [
      Dragging.config({
        mode: 'mouse',
        repositionTarget: false,
        onDrag: (comp, _target, delta) => {
          const newDimentions = Resize.resize(editor, delta, resizeType);
          setAriaValuetext(comp, newDimentions, resizeType);
        },
        blockerClass: 'tox-blocker'
      }),
      Keying.config({
        mode: 'special',
        onLeft: (comp) => keyboardHandler(editor, comp, resizeType, -1, 0),
        onRight: (comp) => keyboardHandler(editor, comp, resizeType, 1, 0),
        onUp: (comp) => keyboardHandler(editor, comp, resizeType, 0, -1),
        onDown: (comp) => keyboardHandler(editor, comp, resizeType, 0, 1),
      }),
      Tabstopping.config({}),
      Focusing.config({}),
      Tooltipping.config(
        providersBackstage.tooltips.getConfig({
          tooltipText: providersBackstage.translate('Resize')
        })
      ),
      AddEventsBehaviour.config('set-aria-valuetext', [
        AlloyEvents.runOnAttached((comp) => {
          const setInitialValuetext = () => {
            setAriaValuetext(comp, Resize.getOriginalDimensions(editor), resizeType);
          };
          if (editor._skinLoaded) {
            setInitialValuetext();
          } else {
            editor.once('SkinLoaded', setInitialValuetext);
          }
        })
      ])
    ],
    eventOrder: {
      [SystemEvents.attachedToDom()]: [ 'add-focusable', 'set-aria-valuetext' ]
    }
  }, providersBackstage.icons));
};
