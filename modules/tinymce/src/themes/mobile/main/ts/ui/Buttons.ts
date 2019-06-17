/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Button, Toggling, Unselecting, SketchSpec } from '@ephox/alloy';
import { Merger, Option } from '@ephox/katamari';

import Receivers from '../channels/Receivers';
import Styles from '../style/Styles';
import * as UiDomFactory from '../util/UiDomFactory';

const forToolbarCommand = function (editor, command) {
  return forToolbar(command, function () {
    editor.execCommand(command);
  }, { }, editor);
};

const getToggleBehaviours = function (command) {
  return Behaviour.derive([
    Toggling.config({
      toggleClass: Styles.resolve('toolbar-button-selected'),
      toggleOnExecute: false,
      aria: {
        mode: 'pressed'
      }
    }),
    Receivers.format(command, function (button, status) {
      const toggle = status ? Toggling.on : Toggling.off;
      toggle(button);
    })
  ]);
};

const forToolbarStateCommand = function (editor, command) {
  const extraBehaviours = getToggleBehaviours(command);

  return forToolbar(command, function () {
    editor.execCommand(command);
  }, extraBehaviours, editor);
};

// The action is not just executing the same command
const forToolbarStateAction = function (editor, clazz, command, action) {
  const extraBehaviours = getToggleBehaviours(command);
  return forToolbar(clazz, action, extraBehaviours, editor);
};

const getToolbarIconButton = (clazz, editor) => {
  const icons = editor.ui.registry.getAll().icons;
  const optOxideIcon = Option.from(icons[clazz]);

  return optOxideIcon.fold(
    () => UiDomFactory.dom('<span class="${prefix}-toolbar-button ${prefix}-toolbar-group-item ${prefix}-icon-' + clazz + ' ${prefix}-icon"></span>'),
    (icon) => UiDomFactory.dom('<span class="${prefix}-toolbar-button ${prefix}-toolbar-group-item">' + icon + '</span>')
  );
};

const forToolbar = function (clazz, action, extraBehaviours, editor): SketchSpec {
  return Button.sketch({
    dom: getToolbarIconButton(clazz, editor),
    action,

    buttonBehaviours: Merger.deepMerge(
      Behaviour.derive([
        Unselecting.config({ })
      ]),
      extraBehaviours
    )
  });
};

export default {
  forToolbar,
  forToolbarCommand,
  forToolbarStateAction,
  forToolbarStateCommand,
  getToolbarIconButton
};