/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Element, Traverse } from '@ephox/sugar';

export interface Navigation {
  view: (doc: Element) => Option<Element>;
  owner: (elem: Element) => Element;
}

const view = (doc: Element): Option<Element> => {
  // Only walk up to the document this script is defined in.
  // This prevents walking up to the parent window when the editor is in an iframe.
  const element = doc.dom() === document ? Option.none() : Option.from(doc.dom().defaultView.frameElement);
  return element.map(Element.fromDom);
};

const owner = (element: Element): Element => {
  return Traverse.owner(element);
};

export {
  view,
  owner
};
