import { Arr } from '@ephox/katamari';

// Textnodes cannot be children of these tags
var textBlacklist = [ 'table', 'tbody', 'thead', 'tfoot', 'tr', 'ul', 'ol' ];

export default function (universe) {
  var domUtils = universe.property();
  var validateParent = function (node, blacklist) {
    return domUtils.parent(node).map(domUtils.name).map(function (name) {
      return !Arr.contains(blacklist, name);
    }).getOr(false);
  };

  var validateText = function (textNode) {
    return domUtils.isText(textNode) && validateParent(textNode, textBlacklist);
  };

  return {
    validateText: validateText
  };
};