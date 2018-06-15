import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { console } from '@ephox/dom-globals';

const iframeDoc = (element) => {
  const dom = element.dom();
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

const doc = (element) => {
  const optDoc = iframeDoc(element);
  return optDoc.fold(() => {
    return element;
  }, (v) => {
    return v;
  });
};

export {
  doc
};