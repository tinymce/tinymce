/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloyTriggers, Container, Disabling, Memento, SketchSpec } from '@ephox/alloy';
import { Option } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';
import { renderIconButton } from '../../general/Button';
import * as ImageToolsEvents from './ImageToolsEvents';

const createButton = (innerHtml: string, icon: string, disabled: boolean, action: (button: AlloyComponent) => void, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  return renderIconButton({
    name: innerHtml,
    icon: Option.some(icon),
    disabled,
    tooltip: Option.some(innerHtml),
    primary: false,
    borderless: false
  }, action, providersBackstage);
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
    createButton('Undo', 'undo', true, (button) => {
      AlloyTriggers.emitWith(button, ImageToolsEvents.internal.undo(), {
        direction: 1
      });
    }, providersBackstage)
  );

  const memRedo = Memento.record(
    createButton('Redo', 'redo', true, (button) => {
      AlloyTriggers.emitWith(button, ImageToolsEvents.internal.redo(), {
        direction: 1
      });
    }, providersBackstage)
  );

  const container = Container.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-image-tools__toolbar', 'tox-image-tools__sidebar']
    },
    components: [
      memUndo.asSpec(),
      memRedo.asSpec(),
      createButton('Zoom in', 'zoom-in', false, (button) => {
        AlloyTriggers.emitWith(button, ImageToolsEvents.internal.zoom(), {
          direction: 1
        });
      }, providersBackstage),
      createButton('Zoom out', 'zoom-out', false, (button) => {
        AlloyTriggers.emitWith(button, ImageToolsEvents.internal.zoom(), {
          direction: -1
        });
      }, providersBackstage)
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