import { Id } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { PredicateFind } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

var find = function (queryElem) {
  var dependent = PredicateFind.closest(queryElem, function (elem) {
    if (! Node.isElement(elem)) return false;
    var id = Attr.get(elem, 'id');
    return id !== undefined && id.indexOf('aria-owns') > -1;
  });

  return dependent.bind(function (dep) {
    var id = Attr.get(dep, 'id');
    var doc = Traverse.owner(dep);

    return SelectorFind.descendant(doc, '[aria-owns="' + id + '"]');
  });
};

var manager = function () {
  var ariaId = Id.generate('aria-owns');

  var link = function (elem) {
    Attr.set(elem, 'aria-owns', ariaId);
  };

  var unlink = function (elem) {
    Attr.remove(elem, 'aria-owns');
  };

  return {
    id: Fun.constant(ariaId),
    link: link,
    unlink: unlink
  };
};

export default <any> {
  find: find,
  manager: manager
};