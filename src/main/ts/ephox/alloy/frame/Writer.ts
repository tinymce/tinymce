import * as Reader from './Reader';
import { Body } from '@ephox/sugar';

const write = (element, content) => {
  if (!Body.inBody(element)) { throw new Error('Internal error: attempted to write to an iframe that is not in the DOM'); }

  const doc = Reader.doc(element);
  const dom = doc.dom();
  dom.open();
  dom.writeln(content);
  dom.close();
};

export {
  write
};