/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Button as AlloyButton, Disabling, FloatingToolbarButton, Focusing,
  Keying, NativeEvents, Reflecting, Replacing, SketchSpec, SplitDropdown as AlloySplitDropdown, SystemEvents, TieredData, TieredMenuTypes, Toggling,
  Unselecting
} from '@ephox/alloy';
import { Toolbar, Types } from '@ephox/bridge';
import { Arr, Cell, Fun, Future, Id, Merger, Option } from '@ephox/katamari';
import { Attr, SelectorFind } from '@ephox/sugar';

import I18n from 'tinymce/core/api/util/I18n';
import { UiFactoryBackstage, UiFactoryBackstageProviders, UiFactoryBackstageShared } from 'tinymce/themes/silver/backstage/Backstage';
import * as ReadOnly from '../../../ReadOnly';
import { DisablingConfigs } from '../../alien/DisablingConfigs';
import { detectSize } from '../../alien/FlatgridAutodetect';
import { SimpleBehaviours } from '../../alien/SimpleBehaviours';
import { renderIconFromPack, renderLabel } from '../../button/ButtonSlices';
import { onControlAttached, onControlDetached, OnDestroy } from '../../controls/Controls';
import * as Icons from '../../icons/Icons';
import { componentRenderPipeline } from '../../menus/item/build/CommonMenuItem';
import { classForPreset } from '../../menus/item/ItemClasses';
import ItemResponse from '../../menus/item/ItemResponse';
import { createPartialChoiceMenu } from '../../menus/menu/MenuChoice';
import { deriveMenuMovement } from '../../menus/menu/MenuMovement';
import * as MenuParts from '../../menus/menu/MenuParts';
import { createTieredDataFrom } from '../../menus/menu/SingleMenu';
import { ToolbarButtonClasses } from '../button/ButtonClasses';
import { onToolbarButtonExecute, toolbarButtonEventOrder } from '../button/ButtonEvents';
import { renderToolbarGroup, ToolbarGroup } from '../CommonToolbar';
import { ToolbarGroupSetting } from 'tinymce/themes/silver/api/Settings';

interface Specialisation<T> {
  toolbarButtonBehaviours: Array<Behaviour.NamedConfiguredBehaviour<Behaviour.BehaviourConfigSpec, Behaviour.BehaviourConfigDetail>>;
  getApi: (comp: AlloyComponent) => T;
  onSetup: (api: T) => OnDestroy<T>;
}

const getButtonApi = (component: AlloyComponent): Toolbar.ToolbarButtonInstanceApi => ({
  isDisabled: () => Disabling.isDisabled(component),
  setDisabled: (state: boolean) => Disabling.set(component, state)
});

const getToggleApi = (component: AlloyComponent): Toolbar.ToolbarToggleButtonInstanceApi => ({
  setActive: (state) => {
    Toggling.set(component, state);
  },
  isActive: () => Toggling.isOn(component),
  isDisabled: () => Disabling.isDisabled(component),
  setDisabled: (state: boolean) => Disabling.set(component, state)
});

const getTooltipAttributes = (tooltip: Option<string>, providersBackstage: UiFactoryBackstageProviders) => tooltip.map<{}>((tooltip) => ({
  'aria-label': providersBackstage.translate(tooltip),
  'title': providersBackstage.translate(tooltip)
})).getOr({});

interface GeneralToolbarButton<T> {
  icon: Option<string>;
  text: Option<string>;
  tooltip: Option<string>;
  onAction: (api: T) => void;
  disabled: boolean;
}

const focusButtonEvent = Id.generate('focus-button');

// TODO TINY-3598: Implement a permanent solution to render rtl icons
// Icons that have `-rtl` equivalents
const rtlIcon = [
  'checklist',
  'ordered-list'
];

// Icons that need to be transformed in RTL
const rtlTransform = [
  'indent',
  'outdent',
  'table-insert-column-after',
  'table-insert-column-before',
  'unordered-list'
];

type Behaviours = Behaviour.NamedConfiguredBehaviour<Behaviour.BehaviourConfigSpec, Behaviour.BehaviourConfigDetail>[];
const renderCommonStructure = (
  icon: Option<string>,
  text: Option<string>,
  tooltip: Option<string>,
  receiver: Option<string>,
  behaviours: Option<Behaviours>,
  providersBackstage: UiFactoryBackstageProviders
) => {

  // If RTL and icon is in whitelist, add RTL icon class for icons that don't have a `-rtl` icon available.
  // Use `-rtl` icon suffix for icons that do.

  const getIconName = (iconName: string): string => I18n.isRtl() && Arr.contains(rtlIcon, iconName) ? iconName + '-rtl' : iconName;
  const needsRtlClass = I18n.isRtl() && icon.exists((name) => Arr.contains(rtlTransform, name));

  return {
    dom: {
      tag: 'button',
      classes: [ ToolbarButtonClasses.Button ].concat(text.isSome() ? [ ToolbarButtonClasses.MatchWidth ] : []).concat(needsRtlClass ? [ ToolbarButtonClasses.IconRtl ] : []),
      attributes: getTooltipAttributes(tooltip, providersBackstage)
    },
    components: componentRenderPipeline([
      icon.map((iconName) => renderIconFromPack(getIconName(iconName), providersBackstage.icons)),
      text.map((text) => renderLabel(text, ToolbarButtonClasses.Button, providersBackstage))
    ]),

    eventOrder: {
      [NativeEvents.mousedown()]: [
        'focusing',
        'alloy.base.behaviour',
        'common-button-display-events'
      ]
    },

    buttonBehaviours: Behaviour.derive(
      [
        DisablingConfigs.toolbarButton(providersBackstage.isReadOnly),
        ReadOnly.receivingConfig(),
        AddEventsBehaviour.config('common-button-display-events', [
          AlloyEvents.run(NativeEvents.mousedown(), (button, se) => {
            se.event().prevent();
            AlloyTriggers.emit(button, focusButtonEvent);
          })
        ])
      ].concat(
        receiver.map((r) => Reflecting.config({
          channel: r,
          initialData: { icon, text },
          renderComponents: (data, _state) => componentRenderPipeline([
            data.icon.map((iconName) => renderIconFromPack(getIconName(iconName), providersBackstage.icons)),
            data.text.map((text) => renderLabel(text, ToolbarButtonClasses.Button, providersBackstage))
          ])
        })).toArray()
      ).concat(behaviours.getOr([ ]))
    )
  };
};

const renderFloatingToolbarButton = (spec: Toolbar.GroupToolbarButton, backstage: UiFactoryBackstage, identifyButtons: (toolbar: string | ToolbarGroupSetting[]) => ToolbarGroup[], attributes: Record<string, string>) => {
  const sharedBackstage = backstage.shared;

  return FloatingToolbarButton.sketch({
    lazySink: sharedBackstage.getSink,
    fetch: () => Future.nu((resolve) => {
      resolve(Arr.map(identifyButtons(spec.items), renderToolbarGroup));
    }),
    markers: {
      toggledClass: ToolbarButtonClasses.Ticked
    },
    parts: {
      button: renderCommonStructure(spec.icon, spec.text, spec.tooltip, Option.none(), Option.none(), sharedBackstage.providers),
      toolbar: {
        dom: {
          tag: 'div',
          classes: [ 'tox-toolbar__overflow' ],
          attributes
        }
      }
    }
  });
};

const renderCommonToolbarButton = <T>(spec: GeneralToolbarButton<T>, specialisation: Specialisation<T>, providersBackstage: UiFactoryBackstageProviders) => {
  const editorOffCell = Cell(Fun.noop);
  const structure = renderCommonStructure(spec.icon, spec.text, spec.tooltip, Option.none(), Option.none(), providersBackstage);
  return AlloyButton.sketch({
    dom: structure.dom,
    components: structure.components,

    eventOrder: toolbarButtonEventOrder,
    buttonBehaviours: Behaviour.derive(
      [
        AddEventsBehaviour.config('toolbar-button-events', [
          onToolbarButtonExecute<T>({
            onAction: spec.onAction,
            getApi: specialisation.getApi
          }),
          onControlAttached(specialisation, editorOffCell),
          onControlDetached(specialisation, editorOffCell)
        ]),
        DisablingConfigs.toolbarButton(() => spec.disabled || providersBackstage.isReadOnly()),
        ReadOnly.receivingConfig()
      ].concat(specialisation.toolbarButtonBehaviours)
    )
  });
};

const renderToolbarButton = (spec: Toolbar.ToolbarButton, providersBackstage: UiFactoryBackstageProviders) => renderToolbarButtonWith(spec, providersBackstage, [ ]);

const renderToolbarButtonWith = (spec: Toolbar.ToolbarButton, providersBackstage: UiFactoryBackstageProviders, bonusEvents: AlloyEvents.AlloyEventKeyAndHandler<any>[]) => renderCommonToolbarButton(spec, {
  toolbarButtonBehaviours: [ ].concat(bonusEvents.length > 0 ? [
    // TODO: May have to pass through eventOrder if events start clashing
    AddEventsBehaviour.config('toolbarButtonWith', bonusEvents)
  ] : [ ]),
  getApi: getButtonApi,
  onSetup: spec.onSetup
}, providersBackstage);

const renderToolbarToggleButton = (spec: Toolbar.ToolbarToggleButton, providersBackstage: UiFactoryBackstageProviders) => renderToolbarToggleButtonWith(spec, providersBackstage, [ ]);

const renderToolbarToggleButtonWith = (spec: Toolbar.ToolbarToggleButton, providersBackstage: UiFactoryBackstageProviders, bonusEvents: AlloyEvents.AlloyEventKeyAndHandler<any>[]) => Merger.deepMerge(
  renderCommonToolbarButton(spec,
    {
      toolbarButtonBehaviours: [
        Replacing.config({ }),
        Toggling.config({ toggleClass: ToolbarButtonClasses.Ticked, aria: { mode: 'pressed' }, toggleOnExecute: false })
      ].concat(bonusEvents.length > 0 ? [
        // TODO: May have to pass through eventOrder if events start clashing
        AddEventsBehaviour.config('toolbarToggleButtonWith', bonusEvents)

      ] : [ ]),
      getApi: getToggleApi,
      onSetup: spec.onSetup
    },
    providersBackstage
  )
) as SketchSpec;

interface ChoiceFetcher {
  fetch: (callback: Function) => void;
  columns: 'auto' | number;
  presets: Types.PresetTypes;
  onItemAction: (api: Toolbar.ToolbarSplitButtonInstanceApi, value: string) => void;
  select: Option<(value: string) => boolean>;
}

const fetchChoices = (getApi, spec: ChoiceFetcher, providersBackstage: UiFactoryBackstageProviders) => (comp: AlloyComponent): Future<Option<TieredData>> => Future.nu((callback) => spec.fetch(callback)).map((items) => Option.from(createTieredDataFrom(
  Merger.deepMerge(
    createPartialChoiceMenu(
      Id.generate('menu-value'),
      items,
      (value) => {
        spec.onItemAction(getApi(comp), value);
      },
      spec.columns,
      spec.presets,
      ItemResponse.CLOSE_ON_EXECUTE,
      spec.select.getOr(() => false),
      providersBackstage
    ),
    {
      movement: deriveMenuMovement(spec.columns, spec.presets),
      menuBehaviours: SimpleBehaviours.unnamedEvents(spec.columns !== 'auto' ? [ ] : [
        AlloyEvents.runOnAttached((comp, _se) => {
          detectSize(comp, 4, classForPreset(spec.presets)).each(({ numRows, numColumns }) => {
            Keying.setGridSize(comp, numRows, numColumns);
          });
        })
      ])
    } as TieredMenuTypes.PartialMenuSpec
  )
)));

// TODO: hookup onSetup and onDestroy
const renderSplitButton = (spec: Toolbar.ToolbarSplitButton, sharedBackstage: UiFactoryBackstageShared): SketchSpec => {
  // This is used to change the icon on the button. Normally, affected by the select call.
  const displayChannel = Id.generate('channel-update-split-dropdown-display');

  const getApi = (comp: AlloyComponent): Toolbar.ToolbarSplitButtonInstanceApi => ({
    isDisabled: () => Disabling.isDisabled(comp),
    setDisabled: (state: boolean) => Disabling.set(comp, state),
    setIconFill: (id, value) => {
      SelectorFind.descendant(comp.element(), 'svg path[id="' + id + '"], rect[id="' + id + '"]').each((underlinePath) => {
        Attr.set(underlinePath, 'fill', value);
      });
    },
    setIconStroke: (id, value) => {
      SelectorFind.descendant(comp.element(), 'svg path[id="' + id + '"], rect[id="' + id + '"]').each((underlinePath) => {
        Attr.set(underlinePath, 'stroke', value);
      });
    },
    setActive: (state) => {
      // Toggle the pressed aria state component
      Attr.set(comp.element(), 'aria-pressed', state);
      // Toggle the inner button state, as that's the toggle component of the split button
      SelectorFind.descendant(comp.element(), 'span').each((button) => {
        comp.getSystem().getByDom(button).each((buttonComp) => Toggling.set(buttonComp, state));
      });
    },
    isActive: () => SelectorFind.descendant(comp.element(), 'span').exists((button) => comp.getSystem().getByDom(button).exists(Toggling.isOn))
  });

  const editorOffCell = Cell(Fun.noop);
  const specialisation = {
    getApi,
    onSetup: spec.onSetup
  };
  return AlloySplitDropdown.sketch({
    dom: {
      tag: 'div',
      classes: [ ToolbarButtonClasses.SplitButton ],
      attributes: { 'aria-pressed': false, ...getTooltipAttributes(spec.tooltip, sharedBackstage.providers) }
    },

    onExecute(button: AlloyComponent) {
      spec.onAction(getApi(button));
    },

    onItemExecute: (_a, _b, _c) => { },

    splitDropdownBehaviours: Behaviour.derive([
      DisablingConfigs.splitButton(sharedBackstage.providers.isReadOnly),
      ReadOnly.receivingConfig(),
      AddEventsBehaviour.config('split-dropdown-events', [
        AlloyEvents.run(focusButtonEvent, Focusing.focus),
        onControlAttached(specialisation, editorOffCell),
        onControlDetached(specialisation, editorOffCell)
      ]),
      Unselecting.config({ })
    ]),

    eventOrder: {
      [SystemEvents.attachedToDom()]: [ 'alloy.base.behaviour', 'split-dropdown-events' ]
    },

    toggleClass: ToolbarButtonClasses.Ticked,
    lazySink: sharedBackstage.getSink,
    fetch: fetchChoices(getApi, spec, sharedBackstage.providers),

    parts: {
      // FIX: hasIcons
      menu: MenuParts.part(false, spec.columns, spec.presets)
    },

    components: [
      AlloySplitDropdown.parts().button(
        renderCommonStructure(spec.icon, spec.text, Option.none(), Option.some(displayChannel), Option.some([
          Toggling.config({ toggleClass: ToolbarButtonClasses.Ticked, toggleOnExecute: false })
        ]), sharedBackstage.providers)
      ),
      AlloySplitDropdown.parts().arrow({
        dom: {
          tag: 'button',
          classes: [ ToolbarButtonClasses.Button, 'tox-split-button__chevron' ],
          innerHtml: Icons.get('chevron-down', sharedBackstage.providers.icons)
        },
        buttonBehaviours: Behaviour.derive([
          DisablingConfigs.splitButton(sharedBackstage.providers.isReadOnly),
          ReadOnly.receivingConfig()
        ])
      }),
      AlloySplitDropdown.parts()['aria-descriptor']({
        text: sharedBackstage.providers.translate('To open the popup, press Shift+Enter')
      })
    ]
  });
};

export {
  renderCommonStructure,
  renderFloatingToolbarButton,
  renderToolbarButton,
  renderToolbarButtonWith,
  renderToolbarToggleButton,
  renderToolbarToggleButtonWith,
  renderSplitButton
};
