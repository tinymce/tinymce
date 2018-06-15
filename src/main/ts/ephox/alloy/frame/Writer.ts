import * as Reader from './Reader';
import { Body } from '@ephox/sugar';
import { SugarElement } from 'ephox/alloy/api/Main';

const write = (element: SugarElement, content: string): void => {
  if (!Body.inBody(element)) { throw new Error('Internal error: attempted to write to an iframe that is not in the DOM'); }

  const doc = Reader.doc(element);
  const dom = doc.dom() as HTMLDocument;
  dom.open();
  dom.writeln(content);
  dom.close();
};

export {
  write
};