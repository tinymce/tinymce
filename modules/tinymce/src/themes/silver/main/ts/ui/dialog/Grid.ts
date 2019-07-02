/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { SimpleSpec } from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Arr } from '@ephox/katamari';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import { Omit } from '../Omit';

type GridSpec = Omit<Types.Grid.Grid, 'type'>;

export const renderGrid = (spec: GridSpec, backstage: UiFactoryBackstageShared): SimpleSpec => {
  return {
    dom: {
      tag: 'div',
      classes: ['tox-form__grid', `tox-form__grid--${spec.columns}col`]
    },
    components: Arr.map(spec.items, backstage.interpreter)
  };
};