import { AlloySpec, SimpleSpec } from '@ephox/alloy';

const promotionMessage = '💝 Get all features';
const promotionLink = 'https://www.tiny.cloud/tinymce-upgrade-to-cloud/?utm_campaign=self_hosted_upgrade_promo&utm_source=tiny&utm_medium=referral';

interface PromotionSpec extends SimpleSpec {
  promotionLink: boolean;
}

const renderPromotion = (spec: PromotionSpec): AlloySpec => {
  const components = spec.promotionLink ? [
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
  ] : [];

  return {
    uid: spec.uid,
    dom: spec.dom,
    components
  };
};

export { renderPromotion, PromotionSpec };
