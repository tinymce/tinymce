/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';

const unbindNoop = Fun.constant({ unbind: Fun.noop });

export default ValueSchema.objOf([
  FieldSchema.strictObjOf('editor', [
    // Maybe have frame as a method, but I doubt it ... I think we pretty much need a frame
    FieldSchema.strict('getFrame'),
    FieldSchema.option('getBody'),
    FieldSchema.option('getDoc'),
    FieldSchema.option('getWin'),
    FieldSchema.option('getSelection'),
    FieldSchema.option('setSelection'),
    FieldSchema.option('clearSelection'),

    FieldSchema.option('cursorSaver'),

    FieldSchema.option('onKeyup'),
    FieldSchema.option('onNodeChanged'),
    FieldSchema.option('getCursorBox'),

    FieldSchema.strict('onDomChanged'),

    FieldSchema.defaulted('onTouchContent', Fun.noop),
    FieldSchema.defaulted('onTapContent', Fun.noop),
    FieldSchema.defaulted('onTouchToolstrip', Fun.noop),

    FieldSchema.defaulted('onScrollToCursor', unbindNoop),
    FieldSchema.defaulted('onScrollToElement', unbindNoop),
    FieldSchema.defaulted('onToEditing', unbindNoop),
    FieldSchema.defaulted('onToReading', unbindNoop),
    FieldSchema.defaulted('onToolbarScrollStart', Fun.identity)
  ]),

  FieldSchema.strict('socket'),
  FieldSchema.strict('toolstrip'),
  FieldSchema.strict('dropup'),
  FieldSchema.strict('toolbar'),
  FieldSchema.strict('container'),
  FieldSchema.strict('alloy'),
  FieldSchema.state('win', (spec) => {
    return Traverse.owner(spec.socket).dom.defaultView;
  }),
  FieldSchema.state('body', (spec) => {
    return SugarElement.fromDom(
      spec.socket.dom.ownerDocument.body
    );
  }),
  FieldSchema.defaulted('translate', Fun.identity),
  FieldSchema.defaulted('setReadOnly', Fun.noop),
  FieldSchema.defaulted('readOnlyOnInit', Fun.always)
]);
