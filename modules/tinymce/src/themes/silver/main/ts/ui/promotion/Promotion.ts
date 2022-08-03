import { AlloySpec, SimpleSpec } from '@ephox/alloy';

const promotionMessage = 'Try Premium!';
const promotionLink = 'http://tiny.cloud';

const renderPromotion = (spec: SimpleSpec): AlloySpec => {
  return {
    uid: spec.uid,
    dom: spec.dom,

    components: [
      {
        dom: {
          tag: 'a',
          attributes: {
            href: promotionLink,
            rel: 'noopener',
            target: '_blank'
          },
          classes: [ 'tox-promotion-link' ],
          innerHtml: promotionMessage
        }
      }
    ]
  };
};

export { renderPromotion };
