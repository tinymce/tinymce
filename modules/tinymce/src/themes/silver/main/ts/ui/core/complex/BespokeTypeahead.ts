import { AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Focusing, Keying, Representing, SketchSpec, SystemEvents, Typeahead } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Arr, Cell, Fun, Future, Id, Optional } from '@ephox/katamari';
import { Focus, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

import { onControlAttached, onControlDetached } from '../../controls/Controls';
import { updateMenuText, UpdateMenuTextEvent } from '../../dropdown/CommonDropdown';
import ItemResponse from '../../menus/item/ItemResponse';
import * as MenuParts from '../../menus/menu/MenuParts';
import * as NestedMenus from '../../menus/menu/NestedMenus';
import { SingleMenuItemSpec } from '../../menus/menu/SingleMenuTypes';
import { onSetupEvent } from '../ControlUtils';
import { SelectTypeaheadSpec } from './BespokeSelect';

interface BespokeSelectApi {
  readonly getComponent: () => AlloyComponent;
}

const createTypeaheadButton = (editor: Editor, backstage: UiFactoryBackstage, spec: SelectTypeaheadSpec): SketchSpec => {
  const data: SingleMenuItemSpec[] = spec.dataset.type === 'basic'
    ? Arr.map(spec.dataset.data, (item) => {
      return {
        type: 'togglemenuitem',
        text: item.title,
        onAction: (api) => {
          spec.onAction(item as any)(api);
        }
      };
    })
    : Arr.foldl(spec.dataset.getData(), (acc, item): Menu.ToggleMenuItemSpec[] => {
      if (item.type === 'separator') {
        return acc;
      }
      if (item.type === 'submenu') {
        return acc.concat(Arr.map(item.items, (subItem) => ({ type: 'togglemenuitem', text: subItem.title, onAction: (api) => {
          spec.onAction({ ...subItem, type: 'formatter' } as any)(api);
        } })));
      }

      if (item.type === 'formatter') {
        return acc.concat({ type: 'togglemenuitem', text: item.title, onAction: (api) => {
          if (item.type === 'formatter') {
            spec.onAction(item)(api);
          }
        } });
      }
      return acc;
    },
    [] as Menu.ToggleMenuItemSpec[]);

  const onSetup = onSetupEvent(editor, 'NodeChange', (api: BespokeSelectApi) => {
    const comp = api.getComponent();
    spec.updateText(comp);
  });
  const getApi = (comp: AlloyComponent): BespokeSelectApi => ({ getComponent: Fun.constant(comp) });
  const editorOffCell = Cell(Fun.noop);

  const customEvents = Id.generate('custom-events');

  const typeahead = Typeahead.sketch({
    minChars: 1,
    responseTime: 0.1,
    markers: {
      openClass: 'typeahead-is-open',
    },
    parts: {
      menu: MenuParts.part(false, 1, 'normal')
    },
    model: {
      selectsOver: true,
      getDisplayText: (itemData: any) => itemData.meta && itemData.meta.text ? itemData.meta.text : 'No.text',
      populateFromBrowse: true,
    },
    typeaheadBehaviours: Behaviour.derive([
      AddEventsBehaviour.config(customEvents, [
        onControlAttached({ onSetup, getApi }, editorOffCell),
        onControlDetached({ getApi }, editorOffCell)
      ]),
      AddEventsBehaviour.config('menubutton-update-display-text', [
        AlloyEvents.run<UpdateMenuTextEvent>(updateMenuText, (comp, se) => {
          Representing.setValue(comp, {
            meta: {
              text: se.event.text,
              format: se.event.format
            }
          });
        })
      ])
    ]),
    fetch: (_typeaheadComp) => {
      const optTieredData = NestedMenus.build(
        data,
        ItemResponse.CLOSE_ON_EXECUTE,
        backstage,
        {
          isHorizontalMenu: false,
          search: Optional.none()
        }
      );
      return Future.pure(optTieredData);
    },
    onExecute: (sandbox, item, value) => {
      if (spec.dataset.type === 'advanced') {

        const styles = spec.dataset.getData();

        const selectedStyle = Arr.find(styles, (style) => {
          if (style.type === 'formatter') {
            return style.title === value.meta.text;
          }
          if (style.type === 'separator') {
            return false;
          }
          if (style.type === 'submenu') {
            return Arr.exists(style.items, (subItem) => subItem.title === value.meta.text);
          }
          return false;
        });

        selectedStyle.each((style) => {
          if (style.type === 'formatter') {
            spec.onTypeaheadSelection(style);
          }
          if (style.type === 'submenu') {
            Arr.each(style.items, (item) => {
              if (item.title === value.meta.text) {
                spec.onTypeaheadSelection(item as any);
              }
            });
          }
        });
      } else {
        const styles = spec.dataset.data;
        const selectedStyle = Arr.find(styles, (style) => style.title === value.meta.text);
        selectedStyle.each((item) => {
          spec.onTypeaheadSelection(item as any);
        });
      }
      // spec.onTypeaheadSelection(value);
    },
    lazySink: backstage.shared.getSink,
    eventOrder: {
      [SystemEvents.attachedToDom()]: [ 'typeaheadevents', customEvents ],
      [SystemEvents.detachedFromDom()]: [ 'streaming', customEvents, 'typeaheadevents' ]
    }
  });

  return {
    uid: Id.generate('typeahead-wrapper'),
    dom: {
      tag: 'div',
      classes: [ 'typeahead-wrapper' ],
    },
    components: [ typeahead ],
    behaviours: Behaviour.derive([
      Focusing.config({}),
      Keying.config({
        mode: 'special',
        onEnter: (comp) => {
          Traverse.firstChild(comp.element).each((firstChild) => {
            Focus.focus(firstChild as any);
          });
          return Optional.some(true);
        },
        onEscape: (wrapperComp) => {
          if (Focus.hasFocus(wrapperComp.element)) {
            return Optional.none();
          } else {
            Focusing.focus(wrapperComp);
            return Optional.some(true);
          }
        }
      })
    ])
  };
};

export { createTypeaheadButton };
