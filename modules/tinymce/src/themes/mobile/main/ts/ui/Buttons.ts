/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Button, Toggling, Unselecting, SketchSpec, RawDomSchema, AlloyComponent } from '@ephox/alloy';
import { Merger, Option } from '@ephox/katamari';

import * as Receivers from '../channels/Receivers';
import * as Styles from '../style/Styles';
import * as UiDomFactory from '../util/UiDomFactory';
import Editor from 'tinymce/core/api/Editor';

const forToolbarCommand = (editor, command): SketchSpec => forToolbar(command, () => {
  editor.execCommand(command);
}, {}, editor);

const getToggleBehaviours = (command: string) => Behaviour.derive([
  Toggling.config({
    toggleClass: Styles.resolve('toolbar-button-selected'),
    toggleOnExecute: false,
    aria: {
      mode: 'pressed'
    }
  }),
  Receivers.format(command, (button, status) => {
    const toggle = status ? Toggling.on : Toggling.off;
    toggle(button);
  })
]);

const forToolbarStateCommand = (editor, command: string): SketchSpec => {
  const extraBehaviours = getToggleBehaviours(command);

  return forToolbar(command, () => {
    editor.execCommand(command);
  }, extraBehaviours, editor);
};

// The action is not just executing the same command
const forToolbarStateAction = (editor, clazz: string, command, action): SketchSpec => {
  const extraBehaviours = getToggleBehaviours(command);
  return forToolbar(clazz, action, extraBehaviours, editor);
};

const getToolbarIconButton = (clazz: string, editor: Editor): RawDomSchema => {
  const icons = editor.ui.registry.getAll().icons;
  const optOxideIcon = Option.from(icons[clazz]);

  return optOxideIcon.fold(
    () => UiDomFactory.dom('<span class="${prefix}-toolbar-button ${prefix}-toolbar-group-item ${prefix}-icon-' + clazz + ' ${prefix}-icon"></span>'),
    (icon) => UiDomFactory.dom('<span class="${prefix}-toolbar-button ${prefix}-toolbar-group-item">' + icon + '</span>')
  );
};

const forToolbar = (clazz: string, action: (c: AlloyComponent) => void, extraBehaviours, editor: Editor): SketchSpec =>
  Button.sketch({
    dom: getToolbarIconButton(clazz, editor),
    action,

    buttonBehaviours: Merger.deepMerge(
      Behaviour.derive([
        Unselecting.config({})
      ]),
      extraBehaviours
    )
  });

export {
  forToolbar,
  forToolbarCommand,
  forToolbarStateAction,
  forToolbarStateCommand,
  getToolbarIconButton
};
