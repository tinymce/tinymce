import { Html } from '@ephox/sugar';
import { Replication } from '@ephox/sugar';

var getHtml = function (element) {
  var clone = Replication.shallow(element);
  return Html.getOuter(clone);
};

export default <any> {
  getHtml: getHtml
};