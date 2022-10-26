import { AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Focusing, GuiFactory, Keying, Memento, Replacing, SketchSpec, Typeahead } from '@ephox/alloy';
import { TypeaheadData } from '@ephox/alloy/src/main/ts/ephox/alloy/ui/types/TypeaheadTypes';
import { Arr, Cell, Fun, Future, Optional } from '@ephox/katamari';
import { Focus, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

import { renderLabel } from '../../button/ButtonSlices';
import { onControlAttached, onControlDetached } from '../../controls/Controls';
import { updateMenuText, UpdateMenuTextEvent } from '../../dropdown/CommonDropdown';
import ItemResponse from '../../menus/item/ItemResponse';
import * as MenuParts from '../../menus/menu/MenuParts';
import * as NestedMenus from '../../menus/menu/NestedMenus';
import { SingleMenuItemSpec } from '../../menus/menu/SingleMenuTypes';
import { onSetupEvent } from '../ControlUtils';
import { SelectSpec } from './BespokeSelect';

interface BespokeSelectApi {
  readonly getComponent: () => AlloyComponent;
}

const createTypeaheadButton = (editor: Editor, backstage: UiFactoryBackstage, spec: SelectSpec): SketchSpec => {
  const optMemDisplayText = spec.text.map(
    (text) => Memento.record(renderLabel(text, '', backstage.shared.providers))
  );
  const data: SingleMenuItemSpec[] = spec.dataset.type === 'basic'
    ? []
    : Arr.map(spec.dataset.getData(), (item): Menu.ToggleMenuItemSpec => ({ type: 'togglemenuitem', text: item.title, onAction: (api) => {
      // it seems to work only with click :(
      if (item.type === 'formatter') {
        spec.onAction(item)(api);
      }
    } }));

  const onSetup = onSetupEvent(editor, 'NodeChange', (api: BespokeSelectApi) => {
    const comp = api.getComponent();
    spec.updateText(comp);
  });
  const getApi = (comp: AlloyComponent): BespokeSelectApi => ({ getComponent: Fun.constant(comp) });
  const editorOffCell = Cell(Fun.noop);

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
      getDisplayText: (itemData: TypeaheadData) => itemData.meta && itemData.meta.text ? itemData.meta.text : 'No.text',
      populateFromBrowse: true,
    },
    typeaheadBehaviours: Behaviour.derive([
      AddEventsBehaviour.config('typeaheadevents', [
        onControlAttached({ onSetup, getApi }, editorOffCell),
        onControlDetached({ getApi }, editorOffCell)
      ]),
      AddEventsBehaviour.config('menubutton-update-display-text', [
        AlloyEvents.run<UpdateMenuTextEvent>(updateMenuText, (comp, se) => {
          optMemDisplayText.bind((mem) => mem.getOpt(comp)).each((displayText) => {
            Replacing.set(displayText, [ GuiFactory.text(backstage.shared.providers.translate(se.event.text)) ]);
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
      // it seems to not work
      // eslint-disable-next-line no-console
      console.log('onExecute: ', sandbox, item, value);
    },
    lazySink: backstage.shared.getSink
  });

  return {
    uid: 'fake-uid-typeahead-wrapper',
    dom: {
      tag: 'div',
      classes: [ 'typeahead-wrapper' ],
    },
    components: [
      // ...componentRenderPipeline([ optMemDisplayText.map((mem) => mem.asSpec()) ]),
      typeahead
    ],
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
