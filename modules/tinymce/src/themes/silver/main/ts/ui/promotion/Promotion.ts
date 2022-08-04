import { AlloySpec, SimpleSpec } from '@ephox/alloy';

// TODO final text and link to be decided in https://ephocks.atlassian.net/browse/TINY-8954
const promotionMessage = 'Upgrade';
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
            'href': promotionLink,
            'rel': 'noopener',
            'target': '_blank',
            'aria-hidden': 'true'
          },
          classes: [ 'tox-promotion-link' ],
          innerHtml: promotionMessage
        }
      }
    ]
  };
};

export { renderPromotion };
