/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour,
  AlloyEvents,
  Behaviour,
  Dropdown,
  Focusing,
  Keying,
  NativeEvents,
  RawDomSchema,
  Replacing,
  Sketcher,
  SystemEvents,
  UiSketcher,
  Tabstopping,
  AlloyComponent,
} from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Compare, SelectorFind } from '@ephox/sugar';
import { TranslatedString } from 'tinymce/core/api/util/I18n';

import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import { renderMenuButton } from '../../button/MenuButton';
import { MenuButtonClasses } from '../../toolbar/button/ButtonClasses';
import { SingleMenuItemApi } from '../menu/SingleMenuTypes';

export interface SilverMenubarSpec extends Sketcher.SingleSketchSpec {
  dom: RawDomSchema;
  onEscape: (comp: AlloyComponent) => void;
  onSetup: (comp: AlloyComponent) => void;
  backstage: UiFactoryBackstage;
}

export interface SilverMenubarDetail extends Sketcher.SingleSketchDetail {
  uid: string;
  dom: RawDomSchema;
  onEscape: (comp: AlloyComponent) => void;
  onSetup: (comp: AlloyComponent) => void;
  backstage: UiFactoryBackstage;
}

export interface SilverMenubarSketch extends Sketcher.SingleSketch<SilverMenubarSpec, SilverMenubarDetail> {
  focus: (comp: AlloyComponent) => void;
  setMenus: (comp: AlloyComponent, groups) => void;
}

export interface MenubarItemSpec {
  text: TranslatedString;
  getItems: () => SingleMenuItemApi[];
}

const factory: UiSketcher.SingleSketchFactory<SilverMenubarDetail, SilverMenubarSpec> = function (detail, spec) {
  const setMenus = (comp: AlloyComponent, menus: MenubarItemSpec[]) => {
    const newMenus = Arr.map(menus, (m) => {
      const buttonSpec = {
        type: 'menubutton',
        text: m.text,
        fetch: (callback) => {
          callback(m.getItems());
        }
      };

      // Convert to an internal bridge spec
      const internal = Toolbar.createMenuButton(buttonSpec).mapError((errInfo) => ValueSchema.formatError(errInfo)).getOrDie();

      return renderMenuButton(internal,
        MenuButtonClasses.Button,
        spec.backstage,
         // https://www.w3.org/TR/wai-aria-practices/examples/menubar/menubar-2/menubar-2.html
        Option.some('menuitem')
      );
    });

    Replacing.set(comp, newMenus);
  };

  const apis = {
    focus: Keying.focusIn,
    setMenus
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components: [ ],

    behaviours: Behaviour.derive([
      Replacing.config({ }),
      AddEventsBehaviour.config('menubar-events', [
        AlloyEvents.runOnAttached(function (component) {
          detail.onSetup(component);
        }),

        AlloyEvents.run(NativeEvents.mouseover(), (comp, se) => {
          // TODO: Use constants
          SelectorFind.descendant(comp.element(), '.' + MenuButtonClasses.Active).each((activeButton) => {
            SelectorFind.closest(se.event().target(), '.' + MenuButtonClasses.Button).each((hoveredButton) => {
              if (! Compare.eq(activeButton, hoveredButton)) {
                // Now, find the components, and expand the hovered one, and close the active one
                comp.getSystem().getByDom(activeButton).each((activeComp) => {
                  comp.getSystem().getByDom(hoveredButton).each((hoveredComp) => {
                    Dropdown.expand(hoveredComp);
                    Dropdown.close(activeComp);
                    Focusing.focus(hoveredComp);
                  });
                });
              }
            });
          });
        }),

        AlloyEvents.run<SystemEvents.AlloyFocusShiftedEvent>(SystemEvents.focusShifted(), (comp, se) => {
          se.event().prevFocus().bind((prev) => comp.getSystem().getByDom(prev).toOption()).each((prev) => {
            se.event().newFocus().bind((nu) => comp.getSystem().getByDom(nu).toOption()).each((nu) => {
              if (Dropdown.isOpen(prev)) {
                Dropdown.expand(nu);
                Dropdown.close(prev);
              }
            });
          });
        })
      ]),
      Keying.config({
        mode: 'flow',
        selector: '.' + MenuButtonClasses.Button,
        onEscape: (comp) => {
          detail.onEscape(comp);
          return Option.some(true);
        }
      }),
      Tabstopping.config({ })
    ]),
    apis,
    domModification: {
      attributes: {
        role: 'menubar'
      }
    }
  };
};

export default Sketcher.single({
  factory,
  name: 'silver.Menubar',
  configFields: [
    FieldSchema.strict('dom'),
    FieldSchema.strict('uid'),
    FieldSchema.strict('onEscape'),
    FieldSchema.strict('backstage'),
    FieldSchema.defaulted('onSetup', Fun.noop)
  ],
  apis: {
    focus (apis, comp) {
      apis.focus(comp);
    },
    setMenus (apis, comp, menus) {
      apis.setMenus(comp, menus);
    }
  }
}) as SilverMenubarSketch;
