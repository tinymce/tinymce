import { Attr, Node, Element } from '@ephox/sugar';

const inside = (target: Element) => (
  (Node.name(target) === 'input' && Attr.get(target, 'type') !== 'radio') ||
    Node.name(target) === 'textarea'
);

export {
  inside
};