/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Keying, Replacing, SimpleSpec, AlloySpec } from '@ephox/alloy';
import { Option, Arr } from '@ephox/katamari';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { Types } from '@ephox/bridge';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import { Omit } from '../Omit';

type LabelSpec = Omit<Types.Label.Label, 'type'>;

export const renderLabel = (spec: LabelSpec, backstageShared: UiFactoryBackstageShared): SimpleSpec => {
  const label = {
    dom: {
      tag: 'label',
      innerHtml: backstageShared.providers.translate(spec.label),
      classes: ['tox-label']
    }
  } as AlloySpec;
  const comps = Arr.map(spec.items, backstageShared.interpreter);
  return {
    dom: {
      tag: 'div',
      classes: ['tox-form__group']
    },
    components: [
      label
    ].concat(comps),
    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Replacing.config({}),
      RepresentingConfigs.domHtml(Option.none()),
      Keying.config({
        mode: 'acyclic'
      }),
    ])
  };
};