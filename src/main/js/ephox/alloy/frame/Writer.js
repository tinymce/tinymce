import Reader from './Reader';
import { Body } from '@ephox/sugar';

var write = function (element, content) {
  if (!Body.inBody(element)) throw 'Internal error: attempted to write to an iframe that is not in the DOM';

  var doc = Reader.doc(element);
  var dom = doc.dom();
  dom.open();
  dom.writeln(content);
  dom.close();
};

export default <any> {
  write: write
};