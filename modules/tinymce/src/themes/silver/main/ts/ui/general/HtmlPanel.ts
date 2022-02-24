import { Behaviour, Container as AlloyContainer, Focusing, SketchSpec, Tabstopping } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';

type HtmlPanelSpec = Omit<Dialog.HtmlPanel, 'type'>;

export const renderHtmlPanel = (spec: HtmlPanelSpec): SketchSpec => {
  if (spec.presets === 'presentation') {
    return AlloyContainer.sketch({
      dom: {
        tag: 'div',
        classes: [ 'tox-form__group' ],
        innerHtml: spec.html
      }
    });
  } else {
    return AlloyContainer.sketch({
      dom: {
        tag: 'div',
        classes: [ 'tox-form__group' ],
        innerHtml: spec.html,
        attributes: {
          role: 'document'
        }
      },
      containerBehaviours: Behaviour.derive([
        Tabstopping.config({ }),
        Focusing.config({ })
      ])
    });
  }
};
