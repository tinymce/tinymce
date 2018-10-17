import { AlloyComponent, AlloyTriggers, Container, Disabling, Memento, SketchSpec } from '@ephox/alloy';
import { Option } from '@ephox/katamari';

import { UiFactoryBackstageShared } from '../../../backstage/Backstage';
import { renderIconButton } from '../../general/Button';
import * as ImageToolsEvents from './ImageToolsEvents';

const createButton = (innerHtml: string, disabled: boolean, action: (button: AlloyComponent) => void, sharedBackstage: UiFactoryBackstageShared): SketchSpec => {
  return renderIconButton({
    name: innerHtml,
    icon: Option.some(innerHtml),
    disabled,
    tooltip: Option.some(innerHtml)
  }, action, sharedBackstage);
};

const setButtonEnabled = (button: AlloyComponent, enabled: boolean): void => {
  if (enabled) {
    Disabling.enable(button);
  } else {
    Disabling.disable(button);
  }
};

const renderSideBar = (sharedBackstage: UiFactoryBackstageShared) => {
  const updateButtonUndoStates = (anyInSystem: AlloyComponent, undoEnabled: boolean, redoEnabled: boolean): void => {
    memUndo.getOpt(anyInSystem).each((undo) => {
      setButtonEnabled(undo, undoEnabled);
    });
    memRedo.getOpt(anyInSystem).each((redo) => {
      setButtonEnabled(redo, redoEnabled);
    });
  };

  const memUndo = Memento.record(
    createButton('undo', true, (button) => {
      AlloyTriggers.emitWith(button, ImageToolsEvents.internal.undo(), {
        direction: 1
      });
    }, sharedBackstage)
  );

  const memRedo = Memento.record(
    createButton('redo', true, (button) => {
      AlloyTriggers.emitWith(button, ImageToolsEvents.internal.redo(), {
        direction: 1
      });
    }, sharedBackstage)
  );

  const container = Container.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-image-tools__toolbar', 'tox-image-tools__sidebar']
    },
    components: [
      memUndo.asSpec(),
      memRedo.asSpec(),
      createButton('zoom-in', false, (button) => {
        AlloyTriggers.emitWith(button, ImageToolsEvents.internal.zoom(), {
          direction: 1
        });
      }, sharedBackstage),
      createButton('zoom-out', false, (button) => {
        AlloyTriggers.emitWith(button, ImageToolsEvents.internal.zoom(), {
          direction: -1
        });
      }, sharedBackstage)
    ]
  });

  return {
    container,
    updateButtonUndoStates
  };
};

export {
  renderSideBar
};