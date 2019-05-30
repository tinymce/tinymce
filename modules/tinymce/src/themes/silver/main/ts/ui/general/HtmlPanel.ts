/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Container as AlloyContainer, SketchSpec, Behaviour, Tabstopping, Focusing } from '@ephox/alloy';
import { Types } from '@ephox/bridge';

// TODO: Refer directly to the bridge interface type (HtmlPanel.HtmlPanel) #TINY-3349
export interface HtmlPanelFoo {
  type: 'htmlpanel';
  html: string;
  presets: Types.HtmlPanelPresetTypes;
}

export const renderHtmlPanel = (spec: HtmlPanelFoo): SketchSpec => {
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