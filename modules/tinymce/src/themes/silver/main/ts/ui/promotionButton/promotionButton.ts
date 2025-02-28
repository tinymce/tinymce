import { AlloyComponent, AlloySpec, Button, SimpleSpec } from '@ephox/alloy';

const renderPromotionButton = (spec: SimpleSpec & { action: (comp: AlloyComponent) => void }): AlloySpec => {

  return Button.sketch({
    uid: spec.uid,
    dom: {
      tag: 'button',
      classes: [ 'tox-promotion' ],
    },
    components: [
      {
        dom: {
          tag: 'p',
          classes: [ 'tox-promotion-link' ],
          innerHtml: '🌟 Explore all features',
        }
      }
    ],
    action: spec.action,
  });
};

export { renderPromotionButton };
