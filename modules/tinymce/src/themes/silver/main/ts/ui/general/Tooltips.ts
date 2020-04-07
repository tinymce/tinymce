/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Tooltipping } from '@ephox/alloy';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

// TODO: Consider using this once we fix the delayed attempt to appear after it's gone problem.

// TODO: Make the arrow configurable.
const upConfig = (item, sharedBackstage: UiFactoryBackstageShared) => Tooltipping.config({
  delay: 200,
  exclusive: true,
  lazySink: sharedBackstage.getSink,
  /*
    <div class="tox-tooltip tox-tooltip--down">
<div class="tox-tooltip__body">Are you hanging on the edge of your seat? </div>
<i class="tox-tooltip__arrow"></i>
</div>*/
  tooltipDom: {
    tag: 'div',
    classes: [ 'tox-tooltip', 'tox-tooltip--up' ]
  },
  tooltipComponents: [
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-tooltip__body' ],
        innerHtml: item.text
      }
    },
    {
      dom: {
        tag: 'i',
        classes: [ 'tox-tooltip__arrow' ]
      }
    }
  ]
});

export {
  upConfig
};