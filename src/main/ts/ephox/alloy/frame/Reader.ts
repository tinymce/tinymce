import { Option } from '@ephox/katamari';

import { console, HTMLFrameElement } from '@ephox/dom-globals';
import { Element, Traverse } from '@ephox/sugar';
import { SugarElement } from 'ephox/alloy/api/Main';
import { SugarDocument } from 'ephox/alloy/alien/TypeDefinitions';

const iframeDoc = (element: SugarElement): Option<SugarDocument> => {
  const dom = element.dom() as HTMLFrameElement;
  try {
    const idoc = dom.contentWindow ? dom.contentWindow.document : dom.contentDocument;
    return idoc !== undefined && idoc !== null ? Option.some(Element.fromDom(idoc)) : Option.none();
  } catch (err) {
    // ASSUMPTION: Permission errors result in an unusable iframe.
    console.log('Error reading iframe: ', dom);
    console.log('Error was: ' + err);
    return Option.none();
  }
};

const doc = (element: SugarElement): SugarDocument => {
  const optDoc = iframeDoc(element);
  return optDoc.getOrThunk(() => {
    // INVESTIGATE: This is new, but there is nothing else than can be done here atm. Rethink.
    return Traverse.owner(element) as SugarDocument;
  });
};

export {
  doc
};