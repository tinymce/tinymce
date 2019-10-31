/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';

export interface RangeLikeObject {
  startContainer: Node;
  startOffset: number;
  endContainer: Node;
  endOffset: number;
}
