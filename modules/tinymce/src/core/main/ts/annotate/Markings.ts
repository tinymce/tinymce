/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';

const annotation = Fun.constant('mce-annotation');

const dataAnnotation = Fun.constant('data-mce-annotation');
const dataAnnotationId = Fun.constant('data-mce-annotation-uid');

export {
  annotation,
  dataAnnotation,
  dataAnnotationId
};