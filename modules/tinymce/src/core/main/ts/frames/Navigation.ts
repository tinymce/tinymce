/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';

export interface Navigation {
  view: (doc: SugarElement<Document>) => Optional<SugarElement<Element>>;
  owner: (elem: SugarElement<Node>) => SugarElement<Document>;
}

const view = (doc: SugarElement<Document>): Optional<SugarElement<Element>> => {
  // Only walk up to the document this script is defined in.
  // This prevents walking up to the parent window when the editor is in an iframe.
  const element = doc.dom === document ? Optional.none<Element>() : Optional.from(doc.dom.defaultView?.frameElement);
  return element.map(SugarElement.fromDom);
};

const owner = (element: SugarElement<Node>): SugarElement<Document> => Traverse.documentOrOwner(element);

export {
  view,
  owner
};
