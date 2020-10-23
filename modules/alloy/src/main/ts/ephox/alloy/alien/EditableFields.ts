import { Attribute, SugarElement, SugarNode } from '@ephox/sugar';

const inside = (target: SugarElement) => (
  (SugarNode.name(target) === 'input' && Attribute.get(target, 'type') !== 'radio') ||
  SugarNode.name(target) === 'textarea'
);

export {
  inside
};
