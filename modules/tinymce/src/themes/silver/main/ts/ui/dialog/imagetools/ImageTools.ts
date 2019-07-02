/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour,
  AlloyComponent,
  AlloyEvents,
  AlloyTriggers,
  Behaviour,
  CustomEvent,
  Disabling,
  Representing,
  SimpleSpec,
  SimulatedEvent,
} from '@ephox/alloy';
import { Blob, console } from '@ephox/dom-globals';
import { ImageResult, ResultConversions } from '@ephox/imagetools';
import { Fun, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { ComposingConfigs } from 'tinymce/themes/silver/ui/alien/ComposingConfigs';

import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';
import * as EditPanel from './EditPanel';
import * as ImagePanel from './ImagePanel';
import * as ImageToolsEvents from './ImageToolsEvents';
import * as SideBar from './SideBar';
import * as ImageToolsState from './state/ImageToolsState';
import { Types } from '@ephox/bridge';
import { Omit } from '../../Omit';

type ImageToolsSpec = Omit<Types.ImageTools.ImageTools, 'type'>;

export const renderImageTools = (detail: ImageToolsSpec, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {
  const state = ImageToolsState.makeState(detail.currentState);

  const zoom = (anyInSystem: AlloyComponent, simulatedEvent: SimulatedEvent<CustomEvent>): void => {
    const direction = simulatedEvent.event().direction();
    imagePanel.zoom(anyInSystem, direction);
  };

  const updateButtonUndoStates = (anyInSystem: AlloyComponent): void => {
    const historyStates = state.getHistoryStates();
    sideBar.updateButtonUndoStates(anyInSystem, historyStates.undoEnabled, historyStates.redoEnabled);
    // Used to update the dialog save button state
    AlloyTriggers.emitWith(anyInSystem, ImageToolsEvents.external.formActionEvent, { name: ImageToolsEvents.external.saveState(), value: historyStates.undoEnabled });
  };

  const disableUndoRedo = (anyInSystem: AlloyComponent): void => {
    sideBar.updateButtonUndoStates(anyInSystem, false, false);
  };

  const undo = (anyInSystem: AlloyComponent, _simulatedEvent: SimulatedEvent<CustomEvent>): void => {
    const url = state.undo();
    updateSrc(anyInSystem, url).then((oImg) => {
      unblock(anyInSystem);
      updateButtonUndoStates(anyInSystem);
    });
  };

  const redo = (anyInSystem: AlloyComponent, _simulatedEvent: SimulatedEvent<CustomEvent>): void => {
    const url = state.redo();
    updateSrc(anyInSystem, url).then((oImg) => {
      unblock(anyInSystem);
      updateButtonUndoStates(anyInSystem);
    });
  };

  const imageResultToBlob = (ir: ImageResult): Promise<Blob> => {
    return ir.toBlob();
  };

  const block = (anyInSystem: AlloyComponent): void => {
    AlloyTriggers.emitWith(anyInSystem, ImageToolsEvents.external.formActionEvent, { name: ImageToolsEvents.external.disable(), value: { } });
  };

  const unblock = (anyInSystem: AlloyComponent): void => {
    editPanel.getApplyButton(anyInSystem).each((applyButton) => {
      Disabling.enable(applyButton);
    });
    AlloyTriggers.emitWith(anyInSystem, ImageToolsEvents.external.formActionEvent, { name: ImageToolsEvents.external.enable(), value: { } });
  };

  const updateSrc = (anyInSystem: AlloyComponent, src: string): Promise<Option<Element>> => {
    block(anyInSystem);
    return imagePanel.updateSrc(anyInSystem, src);
  };

  const blobManipulate = (anyInSystem: AlloyComponent, blob: Blob, filter: (ir: ImageResult) => ImageResult | PromiseLike<ImageResult>, action: (blob: Blob) => string, swap: () => void): Promise<Option<Element>> => {
    block(anyInSystem);
    return ResultConversions.blobToImageResult(blob).
      then(filter).
      then(imageResultToBlob).
      then(action).
      then((url) => {
        return updateSrc(anyInSystem, url).then((oImg) => {
          updateButtonUndoStates(anyInSystem);
          swap();
          unblock(anyInSystem);
          return oImg;
        });
      }).catch((err) => {
        console.log(err); // TODO: Notify the user?
        unblock(anyInSystem);
        return err;
      });
  };

  const manipulate = (anyInSystem: AlloyComponent, filter: (ir: ImageResult) => ImageResult | PromiseLike<ImageResult>, swap: () => void): void => {
    const blob = state.getBlobState().blob;
    const action = (blob) => state.updateTempState(blob);
    blobManipulate(anyInSystem, blob, filter, action, swap);
  };

  const tempManipulate = (anyInSystem: AlloyComponent, filter: (ir: ImageResult) => ImageResult | PromiseLike<ImageResult>): void => {
    const blob = state.getTempState().blob;
    const action = (blob) => state.addTempState(blob);
    blobManipulate(anyInSystem, blob, filter, action, Fun.noop);
  };

  const manipulateApply = (anyInSystem: AlloyComponent, filter: (ir: ImageResult) => ImageResult | PromiseLike<ImageResult>, swap: () => void): void => {
    const blob = state.getBlobState().blob;
    const action = (blob) => {
      const url = state.addBlobState(blob);
      destroyTempState(anyInSystem);
      return url;
    };
    blobManipulate(anyInSystem, blob, filter, action, swap);
  };

  const apply = (anyInSystem: AlloyComponent, simulatedEvent: SimulatedEvent<CustomEvent>): void => {
    const postApply = () => {
      destroyTempState(anyInSystem);
      const swap = simulatedEvent.event().swap();
      swap();
    };
    state.applyTempState(postApply);
  };

  const destroyTempState = (anyInSystem: AlloyComponent): string => {
    const currentUrl = state.getBlobState().url;
    state.destroyTempState();
    updateButtonUndoStates(anyInSystem);
    return currentUrl;
  };

  const cancel = (anyInSystem: AlloyComponent): void => {
    const currentUrl = destroyTempState(anyInSystem);
    updateSrc(anyInSystem, currentUrl).then((oImg) => {
      unblock(anyInSystem);
    });
  };

  const back = (anyInSystem: AlloyComponent, simulatedEvent: SimulatedEvent<CustomEvent>): void => {
    cancel(anyInSystem);
    const swap = simulatedEvent.event().swap();
    swap();
    imagePanel.hideCrop();
  };

  const transform = (anyInSystem: AlloyComponent, simulatedEvent: SimulatedEvent<CustomEvent>): void => manipulate(anyInSystem, simulatedEvent.event().transform(), Fun.noop);
  const tempTransform = (anyInSystem: AlloyComponent, simulatedEvent: SimulatedEvent<CustomEvent>): void => tempManipulate(anyInSystem, simulatedEvent.event().transform());
  const transformApply = (anyInSystem: AlloyComponent, simulatedEvent: SimulatedEvent<CustomEvent>): void => manipulateApply(anyInSystem, simulatedEvent.event().transform(), simulatedEvent.event().swap());

  const imagePanel = ImagePanel.renderImagePanel(detail.currentState.url);
  const sideBar = SideBar.renderSideBar(providersBackstage);
  const editPanel = EditPanel.renderEditPanel(imagePanel, providersBackstage);

  const swap = (anyInSystem: AlloyComponent, simulatedEvent: SimulatedEvent<CustomEvent>): void => {
    disableUndoRedo(anyInSystem);
    const transform = simulatedEvent.event().transform();
    const swap = simulatedEvent.event().swap();
    transform.fold(() => {
      swap();
    }, (transform) => {
      manipulate(anyInSystem, transform, swap);
    });
  };

  return {
    dom: {
      tag: 'div',
      attributes: {
        role: 'presentation'
      }
    },
    components: [
      editPanel.memContainer.asSpec(),
      imagePanel.memContainer.asSpec(),
      sideBar.container
    ],
    behaviours: Behaviour.derive([
      Representing.config({
        store: {
          mode: 'manual',
          getValue: () => {
            return state.getBlobState();
          }
        }
      }),
      AddEventsBehaviour.config('image-tools-events', [
        AlloyEvents.run(ImageToolsEvents.internal.undo(), undo),
        AlloyEvents.run(ImageToolsEvents.internal.redo(), redo),
        AlloyEvents.run(ImageToolsEvents.internal.zoom(), zoom),

        AlloyEvents.run(ImageToolsEvents.internal.back(), back),
        AlloyEvents.run(ImageToolsEvents.internal.apply(), apply),

        AlloyEvents.run(ImageToolsEvents.internal.transform(), transform),
        AlloyEvents.run(ImageToolsEvents.internal.tempTransform(), tempTransform),
        AlloyEvents.run(ImageToolsEvents.internal.transformApply(), transformApply),
        AlloyEvents.run(ImageToolsEvents.internal.swap(), swap)
      ]),
      ComposingConfigs.self()
    ])
  };
};