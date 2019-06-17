import { Attr, Css, Traverse } from '@ephox/sugar';
import { AlloyComponent } from '../../api/component/ComponentApi';

const initialAttribute = 'data-initial-z-index';

// We have to alter the z index of the alloy root of the blocker so that
// it can have a z-index high enough to act as the "blocker". Just before
// discarding it, we need to reset those z-indices back to what they
// were. ASSUMPTION: the blocker has been added as a direct child of the root
const resetZIndex = (blocker: AlloyComponent): void => {
  Traverse.parent(blocker.element()).each((root) => {
    const initZIndex = Attr.get(root, initialAttribute);
    if (Attr.has(root, initialAttribute)) { Css.set(root, 'z-index', initZIndex); } else { Css.remove(root, 'z-index'); }

    Attr.remove(root, initialAttribute);
  });
};

const changeZIndex = (blocker: AlloyComponent): void => {
  Traverse.parent(blocker.element()).each((root) => {
    Css.getRaw(root, 'z-index').each((zindex) => {
      Attr.set(root, initialAttribute, zindex);
    });

    // Used to be a really high number, but it probably just has
    // to match the blocker
    Css.set(root, 'z-index', Css.get(blocker.element(), 'z-index'));
  });
};

const instigate = (anyComponent: AlloyComponent, blocker: AlloyComponent): void => {
  anyComponent.getSystem().addToGui(blocker);
  changeZIndex(blocker);
};

const discard = (blocker: AlloyComponent): void => {
  resetZIndex(blocker);
  blocker.getSystem().removeFromGui(blocker);
};

export {
  instigate,
  discard
};