import { AlloySpec, SimpleSpec } from '@ephox/alloy';

const promotionMessage = '⚡️Upgrade';
const promotionLink = 'https://www.tiny.cloud/tinymce-self-hosted-premium-features/?utm_source=TinyMCE&utm_medium=SPAP&utm_campaign=SPAP&utm_id=editorreferral';

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
