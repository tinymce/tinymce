/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Buttons from './Buttons';
import { SketchSpec } from '@ephox/alloy';
import { MobileRealm } from './IosRealm';

const button = (realm: MobileRealm, clazz: string, makeItems, editor): SketchSpec => Buttons.forToolbar(clazz, () => {
  const items = makeItems();
  realm.setContextToolbar([
    {
      // FIX: I18n
      label: clazz + ' group',
      items
    }
  ]);
}, {}, editor);

export {
  button
};
