/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional, Unicode } from '@ephox/katamari';
import { Insert, SugarElement } from '@ephox/sugar';

import * as NodeType from '../dom/NodeType';
import { CaretPosition } from './CaretPosition';
import { getElementFromPosition } from './CaretUtils';

const insertTextAtPosition = (text: string, pos: CaretPosition): Optional<CaretPosition> => {
  const container = pos.container();
  const offset = pos.offset();

  if (NodeType.isText(container)) {
    container.insertData(offset, text);
    return Optional.some(CaretPosition(container, offset + text.length));
  } else {
    return getElementFromPosition(pos).map((elm) => {
      const textNode = SugarElement.fromText(text);

      if (pos.isAtEnd()) {
        Insert.after(elm, textNode);
      } else {
        Insert.before(elm, textNode);
      }

      return CaretPosition(textNode.dom, text.length);
    });
  }
};

const insertNbspAtPosition = Fun.curry(insertTextAtPosition, Unicode.nbsp);
const insertSpaceAtPosition = Fun.curry(insertTextAtPosition, ' ');

export {
  insertTextAtPosition,
  insertNbspAtPosition,
  insertSpaceAtPosition
};
