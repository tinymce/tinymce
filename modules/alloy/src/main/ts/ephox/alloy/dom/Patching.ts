import { Arr, Optional } from '@ephox/katamari';
import { Compare, Insert, Remove, SugarElement, Traverse } from '@ephox/sugar';

const switchElement = (parent: SugarElement<Element>, original: SugarElement<Node>, nu: SugarElement<Node>) => {
  // All of this code is trying to handle the situation
  // where there are premades. The problem with premades
  // is that they might have existing DOM elements as their
  // children already, which causes problems when you are
  // moving them around. This is all very experimental.

  // The thing that we are putting in the DOM already contains
  // as a descendant the thing that we are replacing.
  if (Compare.contains(nu, original)) {
    // Because the original is going to be removed when we
    // try to add the new one, we want to find a way to add
    // the new one that doesn't rely on the position of the
    // original. So either appending to the parent (if it's
    // the last one), or inserting *before* the next sibling)
    const insertOperation = Traverse.nextSibling(original).fold(
      // we are the last element, so append to parent
      () => () => Insert.append(parent, nu),
      // we have a right sibling, so insert before that
      (nextSibling) => () => Insert.before(nextSibling, nu)
    );

    // So remove the original *FIRST*, then insert the nu
    Remove.remove(original);
    insertOperation();
  } else {
    // It doesn't contain it, so we don't need to do anything
    // strange (hopefully)
    Insert.before(original, nu);
    Remove.remove(original);
  }
};

/*
 * What is going on here, you ask?
 *
 * During patching, it is quite possible that an element is going to
 * be replaced by something which has the replacee as a child. In this
 * situation, we cannot insert before it, because it is already in the
 * tree. Therefore, we have to remove it first.
 *
 * I'm not sure whether we should just always do it in that order. There
 * is probably no harm, and it is likely a lot safer.
 *
 * However, this is going to fail in situations where the thing that is
 * getting put in new is not the obsoleted child, but a child further away.
 * Although, maybe the DOM just handles that? Let's see if we can get a test
 * case. It looks like the DOM handles most things that aren't insertBefore.
 * Though, I'm not sure about that.
 *
 * Let's run tests
 *
 */
const patchChildren = <T, C>(
  nu: T[],
  process: (t: T, i: number, optObs: Optional<SugarElement<Node>>) => C,
  toDom: (c: C) => SugarElement<Node>,
  parent: SugarElement<Element>
): C[] => {
  const builtChildren = Arr.map(nu, (n, i) => {
    // Before building anything, this is the DOM element
    // we are going to try to use.
    const oldObsoleted = Traverse.child(parent, i);
    const childC = process(n, i, oldObsoleted);
    const child = toDom(childC);

    // When dealing with premades, the process of building
    // something may have moved existing nodes around, so
    // we see if the child at position i is still the same.
    // If it isn't, we need to introduce some complex
    // behaviour
    const newObsoleted = Traverse.child(parent, i);
    const obsoleted = newObsoleted.map(
      (newObs) => {
        const elemChanged = oldObsoleted.exists(
          (o) => !Compare.eq(o, newObs)
        );

        // If the element has changed, then we introduce
        // an additional marker to increase the likelihood
        // that the nodes to the right can still be reused (?)
        if (elemChanged) {
          const marker = SugarElement.fromTag('span');
          Insert.before(newObs, marker);
          return marker;
        } else {
          return newObs;
        }
      }
    );

    obsoleted.fold(
      () => {
        // There is nothing here, so just append to the parent
        Insert.append(parent, child);
      },
      (obs) => {
        // I don't these branches handles all the cases.
        if (!Compare.eq(obs, child)) {
          // This situation occurs when the DOM element
          // that has been patched when building it is no
          // longer the one that we need to replace. This is
          // caused by premades. So we need to switch
          switchElement(parent, obs, child);
        } else {
          // We have already patched the element, so do
          // nothing.
        }
      }
    );

    return childC;
  });

  // Need to regather the children in case some of the previous children
  // have moved to an earlier index.
  const currentChildren = Traverse.children(parent);
  Arr.each(currentChildren.slice(builtChildren.length), Remove.remove);

  return builtChildren;
};

export {
  patchChildren
};
