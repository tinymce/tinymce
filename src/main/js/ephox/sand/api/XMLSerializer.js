import Global from '../util/Global';

/*
 * IE9 and above per
 * https://developer.mozilla.org/en/docs/XMLSerializer
 */
var xmlserializer = function () {
  var f = Global.getOrDie('XMLSerializer');
  return new f();
};

var serializeToString = function (node) {
  return xmlserializer().serializeToString(node);
};

export default <any> {
  serializeToString: serializeToString
};