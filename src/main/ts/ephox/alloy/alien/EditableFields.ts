import { Attr, Node } from '@ephox/sugar';
import { SugarElement } from './TypeDefinitions';

const inside = (target: SugarElement) => {
  return (
    (Node.name(target) === 'input' && Attr.get(target, 'type') !== 'radio') ||
    Node.name(target) === 'textarea'
  );
};

export {
  inside
};