/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Disabling, SimpleSpec } from '@ephox/alloy';

import { ComposingConfigs } from '../alien/ComposingConfigs';

export const renderSpacer = (): SimpleSpec => {
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-spacer' ]
    },
    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Disabling.config({ }),
    ])
  };
};
