import { Option } from '@ephox/katamari';
import { SugarBody, SugarElement, Traverse } from '@ephox/sugar';

/* eslint-disable no-console */

const iframeDoc = (element: SugarElement<HTMLFrameElement>): Option<SugarElement<HTMLDocument>> => {
  const dom = element.dom();
  try {
    const idoc = dom.contentWindow ? dom.contentWindow.document : dom.contentDocument;
    return idoc !== undefined && idoc !== null ? Option.some(SugarElement.fromDom(idoc)) : Option.none();
  } catch (err) {
    // ASSUMPTION: Permission errors result in an unusable iframe.
    console.log('Error reading iframe: ', dom);
    console.log('Error was: ' + err);
    return Option.none();
  }
};

// NOTE: This looks like it is only used in the demo. Move out.
const readDoc = (element: SugarElement) => {
  const optDoc = iframeDoc(element);
  return optDoc.getOrThunk(() =>
    // INVESTIGATE: This is new, but there is nothing else than can be done here atm. Rethink.
    Traverse.owner(element)
  );
};

const write = (element: SugarElement, content: string): void => {
  if (!SugarBody.inBody(element)) { throw new Error('Internal error: attempted to write to an iframe that is not n the DOM'); }

  const doc = readDoc(element);
  const dom = doc.dom();
  dom.open();
  dom.writeln(content);
  dom.close();
};

export {
  write,
  readDoc
};
