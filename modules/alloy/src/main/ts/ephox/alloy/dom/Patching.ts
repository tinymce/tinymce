import { Arr, Optional } from '@ephox/katamari';
import { Compare, Insert, Remove, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import { AlloySpec } from '../api/component/SpecTypes';

type SpecBuilder = (spec: AlloySpec, optObs: Optional<SugarElement<Node>>) => AlloyComponent;

const determineObsoleted = (parent: SugarElement<Element>, index: number, oldObsoleted: Optional<SugarElement<Node>>): Optional<SugarElement<Node>> => {
  // When dealing with premades, the process of building something may have moved existing nodes around, so we see
  // if the child at the index position is still the same. If it isn't, we need to introduce some complex behaviour
  //
  // Example:
  // ```<div><premade></premade><span></span></div>```
  // and then moving the premade inside a blockquote
  // ```<div><blockquote><premade></premade></blockquote><span></span></div>```
  //
  // so when you go to replace the first thing it would think there is only 1 child which would be the span, so in
  // this case we insert a marker to keep the span in the same spot.
  const newObsoleted = Traverse.child(parent, index);
  return newObsoleted.map((newObs) => {
    const elemChanged = oldObsoleted.exists((o) => !Compare.eq(o, newObs));

    // Adding a marker prevents the case where a premade is added to something shifting it from where
    // it was. That in turn un-synced all trailing children and made it so they couldn't be patched.
    if (elemChanged) {
      const oldTag = oldObsoleted.map(SugarNode.name).getOr('span');
      const marker = SugarElement.fromTag(oldTag);
      Insert.before(newObs, marker);
      return marker;
    } else {
      return newObs;
    }
  });
};

const ensureInDom = (parent: SugarElement<Element>, child: SugarElement<Node>, obsoleted: Optional<SugarElement<Node>>): void => {
  obsoleted.fold(
    // There is nothing here, so just append to the parent
    () => Insert.append(parent, child),
    (obs) => {
      if (!Compare.eq(obs, child)) {
        // This situation occurs when the DOM element that has been patched when building it is no
        // longer the one that we need to replace. This is probably caused by premades.
        Insert.before(obs, child);
        Remove.remove(obs);
      } else {
        // We have already patched the element, so do nothing.
      }
    }
  );
};

const patchChildrenWith = <T, C>(parent: SugarElement<Element>, nu: T[], f: (n: T, i: number) => C) => {
  const builtChildren = Arr.map(nu, f);

  // Need to regather the children in case some of the previous children have moved
  // to an earlier index. So this just prunes any leftover children in the dom.
  const currentChildren = Traverse.children(parent);
  Arr.each(currentChildren.slice(builtChildren.length), Remove.remove);

  return builtChildren;
};

const patchSpecChild = (parent: SugarElement<Element>, index: number, spec: AlloySpec, build: SpecBuilder): AlloyComponent => {
  // Before building anything, this is the DOM element we are going to try to use.
  const oldObsoleted = Traverse.child(parent, index);
  const childComp = build(spec, oldObsoleted);

  const obsoleted = determineObsoleted(parent, index, oldObsoleted);
  ensureInDom(parent, childComp.element, obsoleted);

  return childComp;
};

const patchSpecChildren = (parent: SugarElement<Element>, specs: AlloySpec[], build: SpecBuilder): AlloyComponent[] =>
  patchChildrenWith(parent, specs, (spec, index) =>
    patchSpecChild(parent, index, spec, build)
  );

const patchDomChildren = (parent: SugarElement<Element>, nodes: SugarElement<Node>[]): SugarElement<Node>[] =>
  patchChildrenWith(parent, nodes, (node, index) => {
    const optObsoleted = Traverse.child(parent, index);
    ensureInDom(parent, node, optObsoleted);
    return node;
  });

export {
  patchDomChildren,
  patchSpecChild,
  patchSpecChildren
};
