import { UiFactoryBackstageProviders } from '../../../backstage/Backstage';
import { AlloyComponent, Container, AlloyTriggers, Memento, Disabling, SketchSpec } from '@ephox/alloy';
import * as ImageToolsEvents from './ImageToolsEvents';
import { renderIconButton } from '../../general/Button';
import { Option } from '@ephox/katamari';
import { IconProvider } from '../../icons/Icons';

const createButton = (innerHtml: string, disabled: boolean, action: (button: AlloyComponent) => void, icons: IconProvider): SketchSpec => {
  return renderIconButton({
    name: innerHtml,
    icon: Option.some(innerHtml),
    disabled,
    tooltip: Option.some(innerHtml)
  }, action, icons);
};

const setButtonEnabled = (button: AlloyComponent, enabled: boolean): void => {
  if (enabled) {
    Disabling.enable(button);
  } else {
    Disabling.disable(button);
  }
};

const renderSideBar = (providersBackstage: UiFactoryBackstageProviders) => {
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
    }, providersBackstage.icons)
  );

  const memRedo = Memento.record(
    createButton('redo', true, (button) => {
      AlloyTriggers.emitWith(button, ImageToolsEvents.internal.redo(), {
        direction: 1
      });
    }, providersBackstage.icons)
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
      }, providersBackstage.icons),
      createButton('zoom-out', false, (button) => {
        AlloyTriggers.emitWith(button, ImageToolsEvents.internal.zoom(), {
          direction: -1
        });
      }, providersBackstage.icons)
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