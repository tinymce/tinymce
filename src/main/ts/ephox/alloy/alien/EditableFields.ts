import { Attr, Node } from '@ephox/sugar';

const inside = (target) => {
  return (
    (Node.name(target) === 'input' && Attr.get(target, 'type') !== 'radio') ||
    Node.name(target) === 'textarea'
  );
};

export {
  inside
};