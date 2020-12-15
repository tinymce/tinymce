import { Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';

export interface OrphanText<E> {
  readonly validateText: (textNode: E) => boolean;
}

// Textnodes cannot be children of these tags
const textBlacklist = [ 'table', 'tbody', 'thead', 'tfoot', 'tr', 'ul', 'ol' ];

export const OrphanText = function <E, D> (universe: Universe<E, D>): OrphanText<E> {
  const domUtils = universe.property();
  const validateParent = function (node: E, blacklist: string[]) {
    return domUtils.parent(node).map(domUtils.name).map((name) => {
      return !Arr.contains(blacklist, name);
    }).getOr(false);
  };

  const validateText = function (textNode: E) {
    return domUtils.isText(textNode) && validateParent(textNode, textBlacklist);
  };

  return {
    validateText
  };
};
