import { AddEventsBehaviour, type AlloyComponent, AlloyEvents, Dragging, Focusing, Keying, type SimpleSpec, SystemEvents, Tabstopping, Tooltipping } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { Attribute, SugarPosition } from '@ephox/sugar';

import type Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';

import * as Options from '../../api/Options';
import type { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as Icons from '../icons/Icons';
import * as Resize from '../sizing/Resize';

const keyboardResizeStepInPx = 20;

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

const getAriaValuetext = (dimensions: Resize.ResizeEditorDimensions, resizeType: Resize.ResizeTypes): string => {
  return resizeType === Resize.ResizeTypes.Both
    ? I18n.translate([ `Editor's height: {0} pixels, Editor's width: {1} pixels`, dimensions.height, dimensions.width ])
    : I18n.translate([ `Editor's height: {0} pixels`, dimensions.height ]);
};

const setAriaDimensions = (comp: AlloyComponent, dimensions: Resize.ResizeEditorDimensions, resizeType: Resize.ResizeTypes, minHeight: Optional<number>, maxHeight: Optional<number>) => {
  Attribute.set(comp.element, 'aria-valuetext', getAriaValuetext(dimensions, resizeType));
  // aria-valuenow/valuemin/valuemax are single numeric values, so they can only
  // meaningfully represent one dimension. In 'both' mode the handle resizes both
  // width and height, which has no sensible single-value representation, so we only
  // set these attributes for vertical resizing and rely on aria-valuetext otherwise.
  if (resizeType === Resize.ResizeTypes.Vertical) {
    Attribute.set(comp.element, 'aria-valuenow', dimensions.height);
    Attribute.set(comp.element, 'aria-valuemin', minHeight.getOr(0));
    Attribute.set(comp.element, 'aria-valuemax', maxHeight.getOr(dimensions.height + keyboardResizeStepInPx));
  }
};

const keyboardHandler = (editor: Editor, comp: AlloyComponent, resizeType: Resize.ResizeTypes, x: number, y: number, minHeight: Optional<number>, maxHeight: Optional<number>): Optional<boolean> => {
  const delta = SugarPosition(x * keyboardResizeStepInPx, y * keyboardResizeStepInPx);

  const newDimentions = Resize.resize(editor, delta, resizeType);
  setAriaDimensions(comp, newDimentions, resizeType, minHeight, maxHeight);

  return Optional.some(true);
};

export const renderResizeHandler = (editor: Editor, providersBackstage: UiFactoryBackstageProviders): Optional<SimpleSpec> => {
  const resizeType = getResizeType(editor);
  if (resizeType === Resize.ResizeTypes.None) {
    return Optional.none();
  }

  const minHeight = Options.getMinHeightOption(editor);
  const maxHeight = Options.getMaxHeightOption(editor);

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
        mode: 'pointer',
        repositionTarget: false,
        onDragStart: (comp) => {
          Tooltipping.immediateOpenClose(comp, false);
          Tooltipping.setEnabled(comp, false);
        },
        onDrag: (comp, _target, delta) => {
          const newDimentions = Resize.resize(editor, delta, resizeType);
          setAriaDimensions(comp, newDimentions, resizeType, minHeight, maxHeight);
        },
        onDrop: (comp) => {
          Tooltipping.setEnabled(comp, true);
        },
      }),
      Keying.config({
        mode: 'special',
        onLeft: (comp) => keyboardHandler(editor, comp, resizeType, -1, 0, minHeight, maxHeight),
        onRight: (comp) => keyboardHandler(editor, comp, resizeType, 1, 0, minHeight, maxHeight),
        onUp: (comp) => keyboardHandler(editor, comp, resizeType, 0, -1, minHeight, maxHeight),
        onDown: (comp) => keyboardHandler(editor, comp, resizeType, 0, 1, minHeight, maxHeight),
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
            setAriaDimensions(comp, Resize.getOriginalDimensions(editor), resizeType, minHeight, maxHeight);
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
