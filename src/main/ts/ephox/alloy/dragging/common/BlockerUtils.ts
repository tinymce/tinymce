import { Attr, Css, Traverse } from '@ephox/sugar';

const initialAttribute = 'data-initial-z-index';

// We have to alter the z index of the alloy root of the blocker so that
// it can have a z-index high enough to act as the "blocker". Just before
// discarding it, we need to reset those z-indices back to what they
// were. ASSUMPTION: the blocker has been added as a direct child of the root
const resetZIndex = function (blocker) {
  Traverse.parent(blocker.element()).each(function (root) {
    const initZIndex = Attr.get(root, initialAttribute);
    if (Attr.has(root, initialAttribute)) { Css.set(root, 'z-index', initZIndex); } else { Css.remove(root, 'z-index'); }

    Attr.remove(root, initialAttribute);
  });
};

const changeZIndex = function (blocker) {
  Traverse.parent(blocker.element()).each(function (root) {
    Css.getRaw(root, 'z-index').each(function (zindex) {
      Attr.set(root, initialAttribute, zindex);
    });

    // Used to be a really high number, but it probably just has
    // to match the blocker
    Css.set(root, 'z-index', Css.get(blocker.element(), 'z-index'));
  });
};

const instigate = function (anyComponent, blocker) {
  anyComponent.getSystem().addToGui(blocker);
  changeZIndex(blocker);
};

const discard = function (blocker) {
  resetZIndex(blocker);
  blocker.getSystem().removeFromGui(blocker);
};

export {
  instigate,
  discard
};