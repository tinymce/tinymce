import { Behaviour, Button, Container, GuiFactory, Replacing, Swapping, ComponentApi } from '@ephox/alloy';

import * as UiDomFactory from '../util/UiDomFactory';

const makeEditSwitch = function (webapp): ComponentApi.AlloyComponent {
  return GuiFactory.build(
    Button.sketch({
      dom: UiDomFactory.dom('<div class="${prefix}-mask-edit-icon ${prefix}-icon"></div>'),
      action () {
        webapp.run(function (w) {
          w.setReadOnly(false);
        });
      }
    })
  );
};

const makeSocket = function () {
  return GuiFactory.build(
    Container.sketch({
      dom: UiDomFactory.dom('<div class="${prefix}-editor-socket"></div>'),
      components: [ ],
      containerBehaviours: Behaviour.derive([
        Replacing.config({ })
      ])
    })
  );
};

const showEdit = function (socket, switchToEdit) {
  Replacing.append(socket, GuiFactory.premade(switchToEdit));
};

const hideEdit = function (socket, switchToEdit) {
  Replacing.remove(socket, switchToEdit);
};

const updateMode = function (socket, switchToEdit, readOnly, root) {
  const swap = (readOnly === true) ? Swapping.toAlpha : Swapping.toOmega;
  swap(root);

  const f = readOnly ? showEdit : hideEdit;
  f(socket, switchToEdit);
};

export default {
  makeEditSwitch,
  makeSocket,
  updateMode
};