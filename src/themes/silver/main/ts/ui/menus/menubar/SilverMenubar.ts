import { UiFactoryBackstageProviders } from '../../../backstage/Backstage';
import {
  AddEventsBehaviour,
  AlloyEvents,
  Behaviour,
  ComponentApi,
  Keying,
  RawDomSchema,
  Replacing,
  Sketcher,
  UiSketcher,
  Dropdown,
  SystemEvents,
  NativeEvents,
  Focusing,
} from '@ephox/alloy';
import { FieldSchema } from '@ephox/boulder';
import { Arr, Fun, Option, Result } from '@ephox/katamari';

import { SingleMenuItemApi } from '../menu/SingleMenu';
import { renderMenuButton } from './Integration';
import { MenuButtonClasses } from '../../toolbar/button/ButtonClasses';
import { SelectorFind, Compare } from '@ephox/sugar';
import I18n, { TranslatedString } from 'tinymce/core/api/util/I18n';

export interface SilverMenubarSpec extends Sketcher.SingleSketchSpec {
  dom: RawDomSchema;
  onEscape: (comp: ComponentApi.AlloyComponent) => void;
  onSetup: (comp: ComponentApi.AlloyComponent) => void;
  getSink: () => Result<ComponentApi.AlloyComponent, Error>;
  providers: UiFactoryBackstageProviders;
}

export interface SilverMenubarDetail extends Sketcher.SingleSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  onEscape: () => (comp: ComponentApi.AlloyComponent) => void;
  onSetup: () => (comp: ComponentApi.AlloyComponent) => void;
  getSink: () => () => Result<ComponentApi.AlloyComponent, Error>;
  providers: () => UiFactoryBackstageProviders;
}

export interface SilverMenubarSketch extends Sketcher.SingleSketch<SilverMenubarSpec, SilverMenubarDetail> {
  focus: (comp: ComponentApi.AlloyComponent) => void;
  setMenus: (comp: ComponentApi.AlloyComponent, groups) => void;
}

export interface MenubarItemSpec {
  text: TranslatedString;
  getItems: () => SingleMenuItemApi[];
}

const factory: UiSketcher.SingleSketchFactory<SilverMenubarDetail, SilverMenubarSpec> = function (detail, spec) {
  const setMenus = (comp: ComponentApi.AlloyComponent, menus: MenubarItemSpec[]) => {
    const newMenus = Arr.map(menus, (m) => {
      // FIX: this. Make it go through bridge.
      const buttonSpec = {

        // TODO: backstage me
        text: Option.some(m.text),
        icon: Option.none(),
        fetch: (callback) => {
          callback(m.getItems());
        }
      };

      // FIX: any reference
      return renderMenuButton(buttonSpec as any,
        MenuButtonClasses.Button,
        {
          getSink: detail.getSink(),
          providers: detail.providers(),
          translate: I18n.translate
        },
         // https://www.w3.org/TR/wai-aria-practices/examples/menubar/menubar-2/menubar-2.html
        'menuitem'
      );
    });

    Replacing.set(comp, newMenus);
  };

  const apis = {
    focus: Keying.focusIn,
    setMenus
  };

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: [ ],

    behaviours: Behaviour.derive([
      Replacing.config({ }),
      AddEventsBehaviour.config('menubar-events', [
        AlloyEvents.runOnAttached(function (component) {
          detail.onSetup()(component);
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
          detail.onEscape()(comp);
          return Option.some(true);
        }
      })
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
    FieldSchema.strict('getSink'),
    FieldSchema.strict('providers'),
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