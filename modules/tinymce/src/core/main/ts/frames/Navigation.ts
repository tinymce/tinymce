/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';

export interface Navigation {
  view: (doc: SugarElement) => Option<SugarElement>;
  owner: (elem: SugarElement) => SugarElement;
}

const view = (doc: SugarElement): Option<SugarElement> => {
  // Only walk up to the document this script is defined in.
  // This prevents walking up to the parent window when the editor is in an iframe.
  const element = doc.dom() === document ? Option.none() : Option.from(doc.dom().defaultView.frameElement);
  return element.map(SugarElement.fromDom);
};

const owner = (element: SugarElement): SugarElement => Traverse.owner(element);

export {
  view,
  owner
};
