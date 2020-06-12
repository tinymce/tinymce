/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, Behaviour, ItemWidget, Keying, Memento, Menu, MenuTypes, SimpleOrSketchSpec } from '@ephox/alloy';
import { Id, Option } from '@ephox/katamari';

import { dom as menuDom } from './MenuParts';

export interface WidgetMenuSpec {
  value: string;
  widget: AlloySpec;
}

export const renderWidgetMenu = (spec: WidgetMenuSpec): Partial<MenuTypes.MenuSpec> => {
  const memWidget = Memento.record(spec.widget as SimpleOrSketchSpec);
  return {
    value: spec.value,
    items: [
      {
        type: 'widget',
        data: {
          // FIX: Widgets.
          value: Id.generate('widget-id')
        },
        autofocus: true,

        // FIX: widget classes.
        dom: {
          tag: 'div'
        },
        components: [
          ItemWidget.parts().widget(
            {
              dom: {
                tag: 'div',
                classes: [ 'tox-menu-widget-js' ]
              },
              components: [ memWidget.asSpec() ],
              behaviours: Behaviour.derive([
                Keying.config({
                  mode: 'special',
                  focusIn: (comp) => {
                    memWidget.getOpt(comp).each(Keying.focusIn);
                    return Option.some(true);
                  }
                })
              ])
            }
          )
        ]
      }
    ],
    dom: menuDom(false, 1, 'normal'),
    components: [
      Menu.parts().items({ })
    ]
  };
};
