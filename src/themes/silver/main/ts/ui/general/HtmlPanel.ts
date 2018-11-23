import { SketchSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/api/component/SpecTypes';
import { Container as AlloyContainer, Behaviour, Tabstopping, Focusing } from '@ephox/alloy';

export interface HtmlPanelFoo {
  type: 'htmlpanel';
  html: string;
}

export const renderHtmlPanel = (spec: HtmlPanelFoo): SketchSpec => {
  return AlloyContainer.sketch({
    dom: {
      tag: 'div',
      innerHtml: spec.html
    },
    containerBehaviours: Behaviour.derive([
      Tabstopping.config({ }),
      Focusing.config({ })
    ])
  });
};