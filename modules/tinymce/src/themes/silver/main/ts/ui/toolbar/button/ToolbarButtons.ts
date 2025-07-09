import {
  AddEventsBehaviour,
  AlloyComponent,
  AlloyEvents,
  AlloySpec,
  AlloyTriggers,
  Behaviour,
  Button as AlloyButton,
  Disabling,
  Dropdown as AlloyDropdown,
  FloatingToolbarButton,
  GuiFactory,
  Highlighting,
  Keying,
  Memento,
  NativeEvents,
  Replacing,
  SketchSpec,
  SystemEvents,
  TieredData,
  TieredMenuTypes,
  Toggling,
  Tooltipping,
  Unselecting
} from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { Arr, Cell, Fun, Future, Id, Merger, Optional, Type } from '@ephox/katamari';
import { Attribute, Class, EventArgs, SelectorFind, Traverse } from '@ephox/sugar';

import { ToolbarGroupOption } from '../../../api/Options';
import { UiFactoryBackstage, UiFactoryBackstageProviders, UiFactoryBackstageShared } from '../../../backstage/Backstage';
import * as ConvertShortcut from '../../../ui/alien/ConvertShortcut';
import * as UiState from '../../../UiState';
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
  readonly shortcut: Optional<string>;
  readonly onAction: (api: T) => void;
  readonly enabled: boolean;
  readonly context: string;
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
})).getOr({});

const focusButtonEvent = Id.generate('focus-button');

const renderCommonStructure = (
  optIcon: Optional<string>,
  optText: Optional<string>,
  tooltip: Optional<string>,
  behaviours: Optional<Behaviours>,
  providersBackstage: UiFactoryBackstageProviders,
  context: string,
  btnName?: string
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
      attributes: {
        ...getTooltipAttributes(tooltip, providersBackstage),
        ...(Type.isNonNullable(btnName) ? { 'data-mce-name': btnName } : {})
      }
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
      [SystemEvents.attachedToDom()]: [ commonButtonDisplayEvent, 'toolbar-group-button-events' ],
      [SystemEvents.detachedFromDom()]: [ commonButtonDisplayEvent, 'toolbar-group-button-events', 'tooltipping' ]
    },

    buttonBehaviours: Behaviour.derive(
      [
        DisablingConfigs.toolbarButton(() => providersBackstage.checkUiComponentContext(context).shouldDisable),
        UiState.toggleOnReceive(() => providersBackstage.checkUiComponentContext(context)),
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

const renderFloatingToolbarButton = (spec: Toolbar.GroupToolbarButton, backstage: UiFactoryBackstage, identifyButtons: (toolbar: string | ToolbarGroupOption[]) => ToolbarGroup[], attributes: Record<string, string>, btnName?: string): SketchSpec => {
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
    ]),
    ...(spec.tooltip.map(
      (t) => Tooltipping.config(
        backstage.shared.providers.tooltips.getConfig({
          tooltipText: backstage.shared.providers.translate(t),
        })
      )
    )).toArray()
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
      button: renderCommonStructure(spec.icon, spec.text, spec.tooltip, Optional.some(behaviours), sharedBackstage.providers, spec.context, btnName),
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

const renderCommonToolbarButton = <T>(spec: GeneralToolbarButton<T>, specialisation: Specialisation<T>, providersBackstage: UiFactoryBackstageProviders, btnName?: string): SketchSpec => {
  const editorOffCell = Cell(Fun.noop);
  const structure = renderCommonStructure(spec.icon, spec.text, spec.tooltip, Optional.none(), providersBackstage, spec.context, btnName);
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
          ...(spec.tooltip.map(
            (t) => Tooltipping.config(
              providersBackstage.tooltips.getConfig({
                tooltipText: providersBackstage.translate(t) + spec.shortcut.map((shortcut) => ` (${ConvertShortcut.convertText(shortcut)})`).getOr(''),
              })
            )
          )).toArray(),
          // Enable toolbar buttons by default
          DisablingConfigs.toolbarButton(() => !spec.enabled || providersBackstage.checkUiComponentContext(spec.context).shouldDisable),
          UiState.toggleOnReceive(() => providersBackstage.checkUiComponentContext(spec.context))
        ].concat(specialisation.toolbarButtonBehaviours)
      ),
      // Here we add the commonButtonDisplayEvent behaviour from the structure so we can listen
      // to updateMenuIcon and updateMenuText events and run the defined callbacks as they are
      // defined in the renderCommonStructure function and fix the size of the button onAttached.
      [commonButtonDisplayEvent]: structure.buttonBehaviours?.[commonButtonDisplayEvent],
    }
  });
};

const renderToolbarButton = (spec: Toolbar.ToolbarButton, providersBackstage: UiFactoryBackstageProviders, btnName?: string): SketchSpec =>
  renderToolbarButtonWith(spec, providersBackstage, [ ], btnName);

const renderToolbarButtonWith = (spec: Toolbar.ToolbarButton, providersBackstage: UiFactoryBackstageProviders, bonusEvents: AlloyEvents.AlloyEventKeyAndHandler<any>[], btnName?: string): SketchSpec =>
  renderCommonToolbarButton(spec, {
    toolbarButtonBehaviours: (bonusEvents.length > 0 ? [
      // TODO: May have to pass through eventOrder if events start clashing
      AddEventsBehaviour.config('toolbarButtonWith', bonusEvents)
    ] : [ ]),
    getApi: getButtonApi,
    onSetup: spec.onSetup
  }, providersBackstage, btnName);

const renderToolbarToggleButton = (spec: Toolbar.ToolbarToggleButton, providersBackstage: UiFactoryBackstageProviders, btnName?: string): SketchSpec =>
  renderToolbarToggleButtonWith(spec, providersBackstage, [ ], btnName);

const renderToolbarToggleButtonWith = (spec: Toolbar.ToolbarToggleButton, providersBackstage: UiFactoryBackstageProviders, bonusEvents: AlloyEvents.AlloyEventKeyAndHandler<any>[], btnName?: string): SketchSpec =>
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
    providersBackstage,
    btnName
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

const makeSplitButtonApi = (tooltipString: Cell<string>, sharedBackstage: UiFactoryBackstageShared, spec: Toolbar.ToolbarSplitButton) => (component: AlloyComponent): Toolbar.ToolbarSplitButtonInstanceApi => {
  const system = component.getSystem();
  const element = component.element;
  const getComponents = () => {
    const isChevron = Class.has(element, 'tox-split-button__chevron');

    const mainOpt = isChevron ?
      Traverse.prevSibling(element).bind((el) => system.getByDom(el).toOptional()) :
      Optional.some(component);

    const chevronOpt = isChevron ?
      Optional.some(component) :
      Traverse.nextSibling(element).bind((el) => system.getByDom(el).toOptional().filter((comp) => Class.has(comp.element, 'tox-split-button__chevron')));
    return { mainOpt, chevronOpt };
  };

  const applyBoth = (f: (c: AlloyComponent) => void) => {
    const { mainOpt, chevronOpt } = getComponents();
    mainOpt.each(f);
    chevronOpt.each(f);
  };

  return {
    isEnabled: () => {
      const { mainOpt } = getComponents();
      return mainOpt.exists((c) => !Disabling.isDisabled(c));
    },
    setEnabled: (state: boolean) => applyBoth((c) => Disabling.set(c, !state)),
    setText: (text: string) => {
      const { mainOpt } = getComponents();
      mainOpt.each((c) => AlloyTriggers.emitWith(c, updateMenuText, { text }));
    },
    setIcon: (icon: string) => {
      const { mainOpt } = getComponents();
      mainOpt.each((c) => AlloyTriggers.emitWith(c, updateMenuIcon, { icon }));
    },
    setIconFill: (id: string, value: string) => applyBoth((c) => {
      SelectorFind.descendant(c.element, `svg path[class="${id}"], rect[class="${id}"]`).each((underlinePath) => {
        Attribute.set(underlinePath, 'fill', value);
      });
    }),
    isActive: () => {
      const { mainOpt } = getComponents();
      return mainOpt.exists((c) => Toggling.isOn(c));
    },
    setActive: (state: boolean) => {
      const { mainOpt } = getComponents();
      mainOpt.each((c) => Toggling.set(c, state));
    },
    setTooltip: (tooltip: string) => {
      tooltipString.set(tooltip);
      const { mainOpt, chevronOpt } = getComponents();
      mainOpt.each((c) => Attribute.set(c.element, 'aria-label', sharedBackstage.providers.translate(tooltip)));
      // For chevron, use the explicit chevronTooltip if provided, otherwise fall back to default behavior
      const chevronTooltipText = spec.chevronTooltip
        .map((chevronTooltip) => sharedBackstage.providers.translate(chevronTooltip))
        .getOr(sharedBackstage.providers.translate(`${tooltip} menu`));
      chevronOpt.each((c) => Attribute.set(c.element, 'aria-label', chevronTooltipText));
    }
  };
};

const renderSplitButton = (spec: Toolbar.ToolbarSplitButton, sharedBackstage: UiFactoryBackstageShared, btnName?: string): AlloySpec[] => {
  const editorOffCell = Cell(Fun.noop);
  const tooltipString = Cell<string>(spec.tooltip.getOr(''));
  const getApi = makeSplitButtonApi(tooltipString, sharedBackstage, spec);
  const menuId = Id.generate('tox-split-menu');
  const expandedCell = Cell(false);

  const getAriaAttributes = () => ({
    'aria-haspopup': 'menu',
    'aria-expanded': String(expandedCell.get()),
    'aria-controls': menuId
  });

  // Helper to get ARIA label for the main button
  const getMainButtonAriaLabel = () => {
    return spec.tooltip.map((tooltip) => sharedBackstage.providers.translate(tooltip))
      .getOr(sharedBackstage.providers.translate('Text color'));
  };

  // Helper to get ARIA label and tooltip for the chevron/dropdown button
  const getChevronTooltip = () => {
    return spec.chevronTooltip
      .map((tooltip) => sharedBackstage.providers.translate(tooltip))
      .getOrThunk(() => {
        const mainLabel = getMainButtonAriaLabel();
        return sharedBackstage.providers.translate([ '{0} menu', mainLabel ]);
      });
  };

  const updateAriaExpanded = (expanded: boolean, comp: AlloyComponent) => {
    expandedCell.set(expanded);
    Attribute.set(comp.element, 'aria-expanded', String(expanded));
  };

  const arrow = AlloyDropdown.sketch({
    dom: {
      tag: 'button',
      classes: [ ToolbarButtonClasses.Button, 'tox-split-button__chevron' ],
      innerHtml: Icons.get('chevron-down', sharedBackstage.providers.icons),
      attributes: {
        'aria-label': getChevronTooltip(),
        ...(Type.isNonNullable(btnName) ? { 'data-mce-name': btnName + '-chevron' } : {}),
        ...getAriaAttributes()
      }
    },
    components: [],
    toggleClass: ToolbarButtonClasses.Ticked,
    dropdownBehaviours: Behaviour.derive([
      AddEventsBehaviour.config('split-dropdown-events', [
        AlloyEvents.runOnAttached((comp, _se) => UiUtils.forceInitialSize(comp)),
        onControlAttached({ getApi, onSetup: spec.onSetup }, editorOffCell),
        AlloyEvents.run('alloy-dropdown-open', (comp) => updateAriaExpanded(true, comp)),
        AlloyEvents.run('alloy-dropdown-close', (comp) => updateAriaExpanded(false, comp)),
      ]),
      DisablingConfigs.toolbarButton(() => sharedBackstage.providers.checkUiComponentContext(spec.context).shouldDisable),
      UiState.toggleOnReceive(() => sharedBackstage.providers.checkUiComponentContext(spec.context)),
      Unselecting.config({ }),
      Tooltipping.config(sharedBackstage.providers.tooltips.getConfig({
        tooltipText: getChevronTooltip(),
        onShow: (comp) => {
          if (tooltipString.get() !== spec.tooltip.getOr('')) {
            const chevronTooltipText = spec.chevronTooltip
              .map((chevronTooltip) => sharedBackstage.providers.translate(chevronTooltip))
              .getOr(`${sharedBackstage.providers.translate(tooltipString.get())} menu`);
            Tooltipping.setComponents(comp,
              sharedBackstage.providers.tooltips.getComponents({ tooltipText: chevronTooltipText })
            );
          }
        }
      }))
    ]),
    lazySink: sharedBackstage.getSink,
    fetch: fetchChoices(getApi, spec, sharedBackstage.providers),
    getHotspot: (comp) => Traverse.prevSibling(comp.element).bind((el) => comp.getSystem().getByDom(el).toOptional()),
    onOpen: (_anchor, _comp, menu) => {
      Highlighting.highlightBy(menu, (item) => Class.has(item.element, 'tox-collection__item--active'));
      Highlighting.getHighlighted(menu).each(Keying.focusIn);
    },
    parts: {
      menu: {
        ...MenuParts.part(false, spec.columns, spec.presets),
        dom: {
          ...MenuParts.part(false, spec.columns, spec.presets).dom,
          tag: 'div',
          attributes: {
            id: menuId
          }
        }
      }
    }
  });

  const mainButton = AlloyButton.sketch({
    ...renderCommonStructure(
      spec.icon,
      spec.text,
      Optional.none(),
      Optional.some([
        Toggling.config({
          toggleClass: ToolbarButtonClasses.Ticked,
          aria: spec.presets === 'color' ? { mode: 'none' } : { mode: 'pressed' },
          toggleOnExecute: false
        }),
        DisablingConfigs.toolbarButton(() => sharedBackstage.providers.checkUiComponentContext(spec.context).shouldDisable),
        UiState.toggleOnReceive(() => sharedBackstage.providers.checkUiComponentContext(spec.context)),
        AddEventsBehaviour.config('split-main-aria-events', []),
        ...(spec.tooltip.isSome() ? [
          Tooltipping.config(sharedBackstage.providers.tooltips.getConfig({
            tooltipText: sharedBackstage.providers.translate(spec.tooltip.getOr('')),
            onShow: (comp) => {
              if (tooltipString.get() !== spec.tooltip.getOr('')) {
                const translated = sharedBackstage.providers.translate(tooltipString.get());
                Tooltipping.setComponents(comp,
                  sharedBackstage.providers.tooltips.getComponents({ tooltipText: translated })
                );
              }
            }
          }))
        ] : [])
      ]),
      sharedBackstage.providers,
      spec.context,
      btnName
    ),
    dom: {
      ...renderCommonStructure(
        spec.icon,
        spec.text,
        Optional.none(),
        Optional.none(),
        sharedBackstage.providers,
        spec.context,
        btnName
      ).dom,
      classes: [ ToolbarButtonClasses.Button, 'tox-split-button__main' ],
      attributes: {
        'aria-label': getMainButtonAriaLabel(),
        ...(Type.isNonNullable(btnName) ? { 'data-mce-name': btnName } : {})
      }
    },
    action: (button) => {
      if (spec.onAction) {
        const api = getApi(button);
        if (api.isEnabled()) {
          spec.onAction(api);
        }
      }
    }
  });

  return [ mainButton, arrow ];
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
