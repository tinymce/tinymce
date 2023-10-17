import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Button as AlloyButton, Disabling, FloatingToolbarButton, Focusing,
  GuiFactory,
  Keying, Memento, NativeEvents, Replacing, SketchSpec, SplitDropdown as AlloySplitDropdown, SystemEvents, TieredData, TieredMenuTypes, Toggling,
  Unselecting
} from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { Arr, Cell, Fun, Future, Id, Merger, Optional } from '@ephox/katamari';
import { Attribute, EventArgs, SelectorFind } from '@ephox/sugar';

import { ToolbarGroupOption } from '../../../api/Options';
import { UiFactoryBackstage, UiFactoryBackstageProviders, UiFactoryBackstageShared } from '../../../backstage/Backstage';
import * as ReadOnly from '../../../ReadOnly';
import { DisablingConfigs } from '../../alien/DisablingConfigs';
import { detectSize } from '../../alien/FlatgridAutodetect';
import { SimpleBehaviours } from '../../alien/SimpleBehaviours';
import * as UiUtils from '../../alien/UiUtils';
import { renderLabel, renderReplaceableIconFromPack } from '../../button/ButtonSlices';
import { onControlAttached, onControlDetached, OnDestroy } from '../../controls/Controls';
import { updateMenuIcon, UpdateMenuIconEvent, updateMenuText, UpdateMenuTextEvent } from '../../dropdown/CommonDropdown';
import * as Icons from '../../icons/Icons';
import { componentRenderPipeline } from '../../menus/item/build/CommonMenuItem';
import { classForPreset } from '../../menus/item/ItemClasses';
import ItemResponse from '../../menus/item/ItemResponse';
import { createPartialChoiceMenu } from '../../menus/menu/MenuChoice';
import { deriveMenuMovement } from '../../menus/menu/MenuMovement';
import * as MenuParts from '../../menus/menu/MenuParts';
import { createTieredDataFrom } from '../../menus/menu/SingleMenu';
import { SingleMenuItemSpec } from '../../menus/menu/SingleMenuTypes';
import { renderToolbarGroup, ToolbarGroup } from '../CommonToolbar';
import { ToolbarButtonClasses } from './ButtonClasses';
import { commonButtonDisplayEvent, onToolbarButtonExecute, toolbarButtonEventOrder } from './ButtonEvents';

type Behaviours = Behaviour.NamedConfiguredBehaviour<any, any, any>[];
type AlloyButtonSpec = Parameters<typeof AlloyButton['sketch']>[0];

interface Specialisation<T> {
  readonly toolbarButtonBehaviours: Behaviours;
  readonly getApi: (comp: AlloyComponent) => T;
  readonly onSetup: (api: T) => OnDestroy<T>;
}

interface GeneralToolbarButton<T> {
  readonly icon: Optional<string>;
  readonly text: Optional<string>;
  readonly tooltip: Optional<string>;
  readonly onAction: (api: T) => void;
  readonly enabled: boolean;
}

interface ChoiceFetcher {
  readonly fetch: (callback: (value: SingleMenuItemSpec[]) => void) => void;
  readonly columns: 'auto' | number;
  readonly presets: Toolbar.PresetTypes;
  readonly onItemAction: (api: Toolbar.ToolbarSplitButtonInstanceApi, value: string) => void;
  readonly select: Optional<(value: string) => boolean>;
}

const getButtonApi = (component: AlloyComponent): Toolbar.ToolbarButtonInstanceApi => ({
  isEnabled: () => !Disabling.isDisabled(component),
  setEnabled: (state: boolean) => Disabling.set(component, !state),
  setText: (text: string) => AlloyTriggers.emitWith(component, updateMenuText, {
    text
  }),
  setIcon: (icon: string) => AlloyTriggers.emitWith(component, updateMenuIcon, {
    icon
  })
});

const getToggleApi = (component: AlloyComponent): Toolbar.ToolbarToggleButtonInstanceApi => ({
  setActive: (state) => {
    Toggling.set(component, state);
  },
  isActive: () => Toggling.isOn(component),
  isEnabled: () => !Disabling.isDisabled(component),
  setEnabled: (state: boolean) => Disabling.set(component, !state),
  setText: (text: string) => AlloyTriggers.emitWith(component, updateMenuText, {
    text
  }),
  setIcon: (icon: string) => AlloyTriggers.emitWith(component, updateMenuIcon, {
    icon
  })
});

const getTooltipAttributes = (tooltip: Optional<string>, providersBackstage: UiFactoryBackstageProviders) => tooltip.map<{}>((tooltip) => ({
  'aria-label': providersBackstage.translate(tooltip),
  'title': providersBackstage.translate(tooltip)
})).getOr({});

const focusButtonEvent = Id.generate('focus-button');

const renderCommonStructure = (
  optIcon: Optional<string>,
  optText: Optional<string>,
  tooltip: Optional<string>,
  behaviours: Optional<Behaviours>,
  providersBackstage: UiFactoryBackstageProviders
): AlloyButtonSpec => {
  const optMemDisplayText = optText.map(
    (text) => Memento.record(renderLabel(text, ToolbarButtonClasses.Button, providersBackstage))
  );
  const optMemDisplayIcon = optIcon.map(
    (icon) => Memento.record(renderReplaceableIconFromPack(icon, providersBackstage.icons))
  );
  return {
    dom: {
      tag: 'button',
      classes: [ ToolbarButtonClasses.Button ].concat(optText.isSome() ? [ ToolbarButtonClasses.MatchWidth ] : []),
      attributes: getTooltipAttributes(tooltip, providersBackstage)
    },
    components: componentRenderPipeline([
      optMemDisplayIcon.map((mem) => mem.asSpec()),
      optMemDisplayText.map((mem) => mem.asSpec()),
    ]),

    eventOrder: {
      [NativeEvents.mousedown()]: [
        'focusing',
        'alloy.base.behaviour',
        commonButtonDisplayEvent
      ],
      [SystemEvents.attachedToDom()]: [ commonButtonDisplayEvent, 'toolbar-group-button-events' ]
    },

    buttonBehaviours: Behaviour.derive(
      [
        DisablingConfigs.toolbarButton(providersBackstage.isDisabled),
        ReadOnly.receivingConfig(),
        AddEventsBehaviour.config(commonButtonDisplayEvent, [
          AlloyEvents.runOnAttached((comp, _se) => UiUtils.forceInitialSize(comp)),
          AlloyEvents.run<UpdateMenuTextEvent>(updateMenuText, (comp, se) => {
            optMemDisplayText.bind((mem) => mem.getOpt(comp)).each((displayText) => {
              Replacing.set(displayText, [ GuiFactory.text(providersBackstage.translate(se.event.text)) ]);
            });
          }),
          AlloyEvents.run<UpdateMenuIconEvent>(updateMenuIcon, (comp, se) => {
            optMemDisplayIcon.bind((mem) => mem.getOpt(comp)).each((displayIcon) => {
              Replacing.set(displayIcon, [ renderReplaceableIconFromPack(se.event.icon, providersBackstage.icons) ]);
            });
          }),
          AlloyEvents.run<EventArgs<MouseEvent>>(NativeEvents.mousedown(), (button, se) => {
            se.event.prevent();
            AlloyTriggers.emit(button, focusButtonEvent);
          })
        ])
      ].concat(behaviours.getOr([ ]))
    )
  };
};

const renderFloatingToolbarButton = (spec: Toolbar.GroupToolbarButton, backstage: UiFactoryBackstage, identifyButtons: (toolbar: string | ToolbarGroupOption[]) => ToolbarGroup[], attributes: Record<string, string>): SketchSpec => {
  const sharedBackstage = backstage.shared;
  const editorOffCell = Cell(Fun.noop);
  const specialisation = {
    toolbarButtonBehaviours: [],
    getApi: getButtonApi,
    onSetup: spec.onSetup
  };
  const behaviours: Behaviours = [
    AddEventsBehaviour.config('toolbar-group-button-events', [
      onControlAttached(specialisation, editorOffCell),
      onControlDetached(specialisation, editorOffCell)
    ])
  ];

  return FloatingToolbarButton.sketch({
    lazySink: sharedBackstage.getSink,
    fetch: () => Future.nu((resolve) => {
      resolve(Arr.map(identifyButtons(spec.items), renderToolbarGroup));
    }),
    markers: {
      toggledClass: ToolbarButtonClasses.Ticked
    },
    parts: {
      button: renderCommonStructure(spec.icon, spec.text, spec.tooltip, Optional.some(behaviours), sharedBackstage.providers),
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

const renderCommonToolbarButton = <T>(spec: GeneralToolbarButton<T>, specialisation: Specialisation<T>, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  const editorOffCell = Cell(Fun.noop);
  const structure = renderCommonStructure(spec.icon, spec.text, spec.tooltip, Optional.none(), providersBackstage);
  return AlloyButton.sketch({
    dom: structure.dom,
    components: structure.components,

    eventOrder: toolbarButtonEventOrder,
    buttonBehaviours: {
      ...Behaviour.derive(
        [
          AddEventsBehaviour.config('toolbar-button-events', [
            onToolbarButtonExecute<T>({
              onAction: spec.onAction,
              getApi: specialisation.getApi
            }),
            onControlAttached(specialisation, editorOffCell),
            onControlDetached(specialisation, editorOffCell)
          ]),
          // Enable toolbar buttons by default
          DisablingConfigs.toolbarButton(() => !spec.enabled || providersBackstage.isDisabled()),
          ReadOnly.receivingConfig()
        ].concat(specialisation.toolbarButtonBehaviours)
      ),
      // Here we add the commonButtonDisplayEvent behaviour from the structure so we can listen
      // to updateMenuIcon and updateMenuText events and run the defined callbacks as they are
      // defined in the renderCommonStructure function and fix the size of the button onAttached.
      [commonButtonDisplayEvent]: structure.buttonBehaviours?.[commonButtonDisplayEvent],
    }
  });
};

const renderToolbarButton = (spec: Toolbar.ToolbarButton, providersBackstage: UiFactoryBackstageProviders): SketchSpec =>
  renderToolbarButtonWith(spec, providersBackstage, [ ]);

const renderToolbarButtonWith = (spec: Toolbar.ToolbarButton, providersBackstage: UiFactoryBackstageProviders, bonusEvents: AlloyEvents.AlloyEventKeyAndHandler<any>[]): SketchSpec =>
  renderCommonToolbarButton(spec, {
    toolbarButtonBehaviours: (bonusEvents.length > 0 ? [
      // TODO: May have to pass through eventOrder if events start clashing
      AddEventsBehaviour.config('toolbarButtonWith', bonusEvents)
    ] : [ ]),
    getApi: getButtonApi,
    onSetup: spec.onSetup
  }, providersBackstage);

const renderToolbarToggleButton = (spec: Toolbar.ToolbarToggleButton, providersBackstage: UiFactoryBackstageProviders): SketchSpec =>
  renderToolbarToggleButtonWith(spec, providersBackstage, [ ]);

const renderToolbarToggleButtonWith = (spec: Toolbar.ToolbarToggleButton, providersBackstage: UiFactoryBackstageProviders, bonusEvents: AlloyEvents.AlloyEventKeyAndHandler<any>[]): SketchSpec =>
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
  );

const fetchChoices = (getApi: (comp: AlloyComponent) => Toolbar.ToolbarSplitButtonInstanceApi, spec: ChoiceFetcher, providersBackstage: UiFactoryBackstageProviders) =>
  (comp: AlloyComponent): Future<Optional<TieredData>> =>
    Future.nu<SingleMenuItemSpec[]>((callback) => spec.fetch(callback))
      .map((items) => Optional.from(createTieredDataFrom(
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
            spec.select.getOr(Fun.never),
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

  const getApi = (comp: AlloyComponent): Toolbar.ToolbarSplitButtonInstanceApi => ({
    isEnabled: () => !Disabling.isDisabled(comp),
    setEnabled: (state: boolean) => Disabling.set(comp, !state),
    setIconFill: (id, value) => {
      SelectorFind.descendant(comp.element, `svg path[class="${id}"], rect[class="${id}"]`).each((underlinePath) => {
        Attribute.set(underlinePath, 'fill', value);
      });
    },
    setActive: (state) => {
      // Toggle the pressed aria state component
      Attribute.set(comp.element, 'aria-pressed', state);
      // Toggle the inner button state, as that's the toggle component of the split button
      SelectorFind.descendant(comp.element, 'span').each((button) => {
        comp.getSystem().getByDom(button).each((buttonComp) => Toggling.set(buttonComp, state));
      });
    },
    isActive: () => SelectorFind.descendant(comp.element, 'span').exists((button) => comp.getSystem().getByDom(button).exists(Toggling.isOn)),
    setText: (text: string) =>
      SelectorFind.descendant(comp.element, 'span').each((button) =>
        comp.getSystem().getByDom(button).each((buttonComp) =>
          AlloyTriggers.emitWith(buttonComp, updateMenuText, {
            text
          }))
      ),
    setIcon: (icon: string) =>
      SelectorFind.descendant(comp.element, 'span').each((button) =>
        comp.getSystem().getByDom(button).each((buttonComp) =>
          AlloyTriggers.emitWith(buttonComp, updateMenuIcon, {
            icon
          }))
      ),
    setTooltip: (tooltip: string) => {
      const translatedTooltip = sharedBackstage.providers.translate(tooltip);
      Attribute.setAll(comp.element, { 'aria-label': translatedTooltip, 'title': translatedTooltip });
    }
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

    onExecute: (button: AlloyComponent) => {
      const api = getApi(button);
      if (api.isEnabled()) {
        spec.onAction(api);
      }
    },

    onItemExecute: (_a, _b, _c) => { },

    splitDropdownBehaviours: Behaviour.derive([
      DisablingConfigs.splitButton(sharedBackstage.providers.isDisabled),
      ReadOnly.receivingConfig(),
      AddEventsBehaviour.config('split-dropdown-events', [
        AlloyEvents.runOnAttached((comp, _se) => UiUtils.forceInitialSize(comp)),
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
      AlloySplitDropdown.parts.button(
        renderCommonStructure(spec.icon, spec.text, Optional.none(), Optional.some([
          Toggling.config({ toggleClass: ToolbarButtonClasses.Ticked, toggleOnExecute: false })
        ]), sharedBackstage.providers)
      ),
      AlloySplitDropdown.parts.arrow({
        dom: {
          tag: 'button',
          classes: [ ToolbarButtonClasses.Button, 'tox-split-button__chevron' ],
          innerHtml: Icons.get('chevron-down', sharedBackstage.providers.icons)
        },
        buttonBehaviours: Behaviour.derive([
          DisablingConfigs.splitButton(sharedBackstage.providers.isDisabled),
          ReadOnly.receivingConfig(),
          Icons.addFocusableBehaviour()
        ])
      }),
      AlloySplitDropdown.parts['aria-descriptor']({
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
