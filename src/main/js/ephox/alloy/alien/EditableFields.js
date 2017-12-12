import { Attr } from '@ephox/sugar';
import { Node } from '@ephox/sugar';

var inside = function (target) {
  return (
    (Node.name(target) === 'input' && Attr.get(target, 'type') !== 'radio') ||
    Node.name(target) === 'textarea'
  );
};

export default <any> {
  inside: inside
};