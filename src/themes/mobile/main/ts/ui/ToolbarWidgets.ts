/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Buttons from './Buttons';
import { SketchSpec } from '@ephox/alloy';

const button = function (realm, clazz, makeItems): SketchSpec {
  return Buttons.forToolbar(clazz, function () {
    const items = makeItems();
    realm.setContextToolbar([
      {
        // FIX: I18n
        label: clazz + ' group',
        items
      }
    ]);
  }, { });
};

export {
  button
};