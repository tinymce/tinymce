import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Dropdown, Focusing, Keying, NativeEvents, RawDomSchema, Replacing, Sketcher,
  SystemEvents, Tabstopping, UiSketcher
} from '@ephox/alloy';
import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Toolbar } from '@ephox/bridge';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { Compare, EventArgs, SelectorFind } from '@ephox/sugar';

import { Menu } from 'tinymce/core/api/ui/Ui';
import { TranslatedString } from 'tinymce/core/api/util/I18n';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

import { renderMenuButton } from '../../button/MenuButton';
import { MenuButtonClasses } from '../../toolbar/button/ButtonClasses';

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

export interface SilverMenubarApis {
  focus: (comp: AlloyComponent) => void;
  setMenus: (comp: AlloyComponent, groups: MenubarItemSpec[]) => void;
}

export interface SilverMenubarSketch extends Sketcher.SingleSketch<SilverMenubarSpec>, SilverMenubarApis { }

export interface MenubarItemSpec {
  text: TranslatedString;
  getItems: () => Menu.NestedMenuItemContents[];
}

const factory: UiSketcher.SingleSketchFactory<SilverMenubarDetail, SilverMenubarSpec> = (detail, spec) => {
  const setMenus = (comp: AlloyComponent, menus: MenubarItemSpec[]) => {
    const newMenus = Arr.map(menus, (m) => {
      const buttonSpec: Toolbar.ToolbarMenuButtonSpec = {
        type: 'menubutton',
        text: m.text,
        fetch: (callback) => {
          callback(m.getItems());
        }
      };

      // Convert to an internal bridge spec
      const internal = Toolbar.createMenuButton(buttonSpec).mapError((errInfo) => StructureSchema.formatError(errInfo)).getOrDie();

      return renderMenuButton(internal,
        MenuButtonClasses.Button,
        spec.backstage,
        // https://www.w3.org/TR/wai-aria-practices/examples/menubar/menubar-2/menubar-2.html
        Optional.some('menuitem')
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
        AlloyEvents.runOnAttached((component) => {
          detail.onSetup(component);
        }),

        AlloyEvents.run<EventArgs<MouseEvent>>(NativeEvents.mouseover(), (comp, se) => {
          // TODO: Use constants
          SelectorFind.descendant(comp.element, '.' + MenuButtonClasses.Active).each((activeButton) => {
            SelectorFind.closest(se.event.target, '.' + MenuButtonClasses.Button).each((hoveredButton) => {
              if (!Compare.eq(activeButton, hoveredButton)) {
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
          se.event.prevFocus.bind((prev) => comp.getSystem().getByDom(prev).toOptional()).each((prev) => {
            se.event.newFocus.bind((nu) => comp.getSystem().getByDom(nu).toOptional()).each((nu) => {
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
          return Optional.some(true);
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

export default Sketcher.single<SilverMenubarSpec, SilverMenubarDetail, SilverMenubarApis>({
  factory,
  name: 'silver.Menubar',
  configFields: [
    FieldSchema.required('dom'),
    FieldSchema.required('uid'),
    FieldSchema.required('onEscape'),
    FieldSchema.required('backstage'),
    FieldSchema.defaulted('onSetup', Fun.noop)
  ],
  apis: {
    focus: (apis, comp) => {
      apis.focus(comp);
    },
    setMenus: (apis, comp, menus) => {
      apis.setMenus(comp, menus);
    }
  }
});
