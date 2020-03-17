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

type BarSpec = Omit<Types.Bar.Bar, 'type'>;

export const renderBar = (spec: BarSpec, backstage: UiFactoryBackstageShared): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-bar', 'tox-form__controls-h-stack' ]
  },
  components: Arr.map(spec.items, backstage.interpreter)
});
