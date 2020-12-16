/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { GuiFactory } from '@ephox/alloy';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Css } from '@ephox/sugar';
import * as IosMode from '../ios/core/IosMode';
import * as TapToEditMask from '../touch/view/TapToEditMask';
import MobileSchema from './MobileSchema';

export interface MobileWebApp {
  setReadOnly(): void;
  refreshStructure(): void;
  enter(): void;
  exit(): void;
  destroy(): void;
}

const produce = (raw: {any}): MobileWebApp => {
  const mobile = ValueSchema.asRawOrDie(
    'Getting IosWebapp schema',
    MobileSchema,
    raw
  );

  /* Make the toolbar */
  Css.set(mobile.toolstrip, 'width', '100%');
  Css.set(mobile.container, 'position', 'relative');

  const onView = () => {
    mobile.setReadOnly(mobile.readOnlyOnInit());
    mode.enter();
  };

  const mask = GuiFactory.build(
    TapToEditMask.sketch(onView, mobile.translate)
  );

  mobile.alloy.add(mask);
  const maskApi = {
    show: () => {
      mobile.alloy.add(mask);
    },
    hide: () => {
      mobile.alloy.remove(mask);
    }
  };

  const mode = IosMode.create(mobile, maskApi);

  return {
    setReadOnly: mobile.setReadOnly,
    refreshStructure: mode.refreshStructure,
    enter: mode.enter,
    exit: mode.exit,
    destroy: Fun.noop  // TODO: lifecycle hookup
  };
};

export {
  produce
};
