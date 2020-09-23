/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, Behaviour, Keying, Replacing, SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Optional } from '@ephox/katamari';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';

type LabelSpec = Omit<Dialog.Label, 'type'>;

export const renderLabel = (spec: LabelSpec, backstageShared: UiFactoryBackstageShared): SimpleSpec => {
  const label = {
    dom: {
      tag: 'label',
      innerHtml: backstageShared.providers.translate(spec.label),
      classes: [ 'tox-label' ]
    }
  } as AlloySpec;
  const comps = Arr.map(spec.items, backstageShared.interpreter);
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-form__group' ]
    },
    components: [
      label
    ].concat(comps),
    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Replacing.config({}),
      RepresentingConfigs.domHtml(Optional.none()),
      Keying.config({
        mode: 'acyclic'
      })
    ])
  };
};
