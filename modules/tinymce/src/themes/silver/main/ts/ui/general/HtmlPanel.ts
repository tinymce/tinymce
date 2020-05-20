/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Container as AlloyContainer, SketchSpec, Behaviour, Tabstopping, Focusing, Representing } from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Omit } from '../Omit';
import { Html } from '@ephox/sugar';
import { ComposingConfigs } from '../alien/ComposingConfigs';

type HtmlPanelSpec = Omit<Types.HtmlPanel.HtmlPanel, 'type'>;

export const renderHtmlPanel = (spec: HtmlPanelSpec): SketchSpec => {

  const repBehaviour = Representing.config({
    store: {
      mode: 'manual',
      getValue: (comp) => Html.get(comp.element()),
      setValue: (comp, v) => Html.set(comp.element(), v)
    }
  });

  if (spec.presets === 'presentation') {
    return AlloyContainer.sketch({
      dom: {
        tag: 'div',
        classes: [ 'tox-form__group' ],
        innerHtml: spec.html
      },
      containerBehaviours: Behaviour.derive([
        repBehaviour,
        ComposingConfigs.self()
      ])
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
        Focusing.config({ }),
        repBehaviour,
        ComposingConfigs.self()
      ])
    });
  }
};
