import { Attr, Css, Node, Traverse } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloyEventRecord } from '../../api/events/AlloyEvents';
import { Container } from '../../api/ui/Container';

const initialAttribute = 'data-initial-z-index';

// We have to alter the z index of the alloy root of the blocker so that
// it can have a z-index high enough to act as the "blocker". Just before
// discarding it, we need to reset those z-indices back to what they
// were. ASSUMPTION: the blocker has been added as a direct child of the root
const resetZIndex = (blocker: AlloyComponent): void => {
  Traverse.parent(blocker.element()).filter(Node.isElement).each((root) => {
    Attr.getOpt(root, initialAttribute).fold(
      () => Css.remove(root, 'z-index'),
      (zIndex) => Css.set(root, 'z-index', zIndex)
    );

    Attr.remove(root, initialAttribute);
  });
};

const changeZIndex = (blocker: AlloyComponent): void => {
  Traverse.parent(blocker.element()).filter(Node.isElement).each((root) => {
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

const createComponent = (component: AlloyComponent, blockerClass: string, blockerEvents: AlloyEventRecord) => component.getSystem().build(
  Container.sketch({
    dom: {
      // Probably consider doing with classes?
      styles: {
        'left': '0px',
        'top': '0px',
        'width': '100%',
        'height': '100%',
        'position': 'fixed',
        'z-index': '1000000000000000'
      },
      classes: [ blockerClass ]
    },
    events: blockerEvents
  })
);

export {
  createComponent,
  instigate,
  discard
};
