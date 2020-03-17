/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Composing, MementoRecord, AlloyComponent } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

// TODO: Move this to alloy if the concept works out
const self = () => Composing.config({
  find: Option.some
});

const memento = (mem: MementoRecord) => Composing.config({
  find: mem.getOpt
});

const childAt = (index: number) => Composing.config({
  find: (comp: AlloyComponent) => Traverse.child(comp.element(), index).bind((element) => comp.getSystem().getByDom(element).toOption())
});

export const ComposingConfigs = {
  self,
  memento,
  childAt
};