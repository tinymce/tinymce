import { AlloySpec, SimpleSpec } from '@ephox/alloy';

import Editor from 'tinymce/core/api/Editor';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';

const promotionMessage = 'Try Premium!';
const promotionLink = 'http://tiny.cloud';

export interface PromotionSpec extends SimpleSpec {
  editor: Editor;
  sharedBackstage: UiFactoryBackstageShared;
}

const renderPromotion = (spec: PromotionSpec): AlloySpec => {
  return {
    uid: spec.uid,
    dom: spec.dom,

    components: [
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-promotion' ],
        },
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
      }
    ]
  };
};

export { renderPromotion };
