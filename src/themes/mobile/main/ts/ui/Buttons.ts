import { Behaviour } from '@ephox/alloy';
import { Toggling } from '@ephox/alloy';
import { Unselecting } from '@ephox/alloy';
import { Button } from '@ephox/alloy';
import { Merger } from '@ephox/katamari';
import Receivers from '../channels/Receivers';
import Styles from '../style/Styles';
import UiDomFactory from '../util/UiDomFactory';

var forToolbarCommand = function (editor, command) {
  return forToolbar(command, function () {
    editor.execCommand(command);
  }, { });
};

var getToggleBehaviours = function (command) {
  return Behaviour.derive([
    Toggling.config({
      toggleClass: Styles.resolve('toolbar-button-selected'),
      toggleOnExecute: false,
      aria: {
        mode: 'pressed'
      }
    }),
    Receivers.format(command, function (button, status) {
      var toggle = status ? Toggling.on : Toggling.off;
      toggle(button);
    })
  ]);
};

var forToolbarStateCommand = function (editor, command) {
  var extraBehaviours = getToggleBehaviours(command);

  return forToolbar(command, function () {
    editor.execCommand(command);
  }, extraBehaviours);
};

// The action is not just executing the same command
var forToolbarStateAction = function (editor, clazz, command, action) {
  var extraBehaviours = getToggleBehaviours(command);
  return forToolbar(clazz, action, extraBehaviours);
};

var forToolbar = function (clazz, action, extraBehaviours) {
  return Button.sketch({
    dom: UiDomFactory.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-' + clazz + ' ${prefix}-icon"></span>'),
    action: action,

    buttonBehaviours: Merger.deepMerge(
      Behaviour.derive([
        Unselecting.config({ })
      ]),
      extraBehaviours
    )
  });
};

export default <any> {
  forToolbar: forToolbar,
  forToolbarCommand: forToolbarCommand,
  forToolbarStateAction: forToolbarStateAction,
  forToolbarStateCommand: forToolbarStateCommand
};