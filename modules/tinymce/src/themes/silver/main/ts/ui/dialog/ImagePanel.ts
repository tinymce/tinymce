/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Behaviour, Representing, SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Cell } from '@ephox/katamari';
import { Attribute, Css, SugarElement, Traverse } from '@ephox/sugar';

import { ComposingConfigs } from '../alien/ComposingConfigs';

type ImagePanelSpec = Omit<Dialog.ImagePanel, 'type'>;

interface ImagePanelData {
  url: string;
  width: number;
  height: number;
}

export const renderImagePanel = (spec: ImagePanelSpec): SimpleSpec => {
  const cachedValue = Cell(null);

  // TODO: how to set the image URL?
  const setValue = (frameComponent: AlloyComponent, data: ImagePanelData) => {
    const [ background, foreground ] = Traverse.children(frameComponent.element) as SugarElement[];
    Attribute.set(foreground, 'src', data.url);
    const position = {
      top: '50px',
      left: '50px',
      width: data.width + 'px',
      height: data.height + 'px'
    };
    Css.setAll(foreground, position);
    Css.setAll(background, position);
    cachedValue.set(data);
  };
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-imagepanel' ],
      attributes: {
        role: 'presentation'
      }
    },
    components: [
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-imagepanel__bg' ],
          attributes: {
            role: 'presentation'
          }
        },
        name: spec.name + '-background'
      },
      {
        dom: {
          tag: 'img',
          classes: [ 'tox-imagepanel__image' ],
        },
      }
    ],
    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Representing.config({
        store: {
          mode: 'manual',
          getValue: () => cachedValue.get(),
          setValue
        }
      }),
    ])
  };
};
