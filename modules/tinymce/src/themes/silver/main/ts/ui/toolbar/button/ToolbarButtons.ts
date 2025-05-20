import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Button as AlloyButton, Disabling, FloatingToolbarButton, Focusing,
  GuiFactory,
  Keying, Memento, NativeEvents, Replacing, SketchSpec, SplitDropdown as AlloySplitDropdown, SystemEvents, TieredData, TieredMenuTypes, Toggling,
  Tooltipping,
  Unselecting,
  AlloySpec,
  TieredMenu
} from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { Arr, Cell, Fun, Future, Id, Merger, Optional, Type } from '@ephox/katamari';
import { Attribute, EventArgs, SelectorFind } from '@ephox/sugar';

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

const getSplitButtonApi = (component: AlloyComponent): Toolbar.ToolbarSplitButtonInstanceApi => ({
  isEnabled: () => !Disabling.isDisabled(component),
  setEnabled: (state: boolean) => Disabling.set(component, !state),
  setText: (text: string) => AlloyTriggers.emitWith(component, updateMenuText, { text }),
  setIcon: (icon: string) => AlloyTriggers.emitWith(component, updateMenuIcon, { icon }),
  setIconFill: (_id: string, _value: string) => {},
  isActive: () => Fun.never(),
  setActive: (_state: boolean) => {},
  setTooltip: (_tooltip: string) => {}
});
// TODO: hookup onSetup and onDestroy
const renderSplitButton = (spec: Toolbar.ToolbarSplitButton, sharedBackstage: UiFactoryBackstageShared, btnName?: string): AlloySpec[] => {
  const openDropdownMenu = (chevronButton: AlloyComponent) => {
    sharedBackstage.getSink().toOptional().each((sink) => {
      fetchChoices(getSplitButtonApi, spec, sharedBackstage.providers)(chevronButton).get((optTieredData) => {
        optTieredData.each((tieredData) => {
          let menu: AlloyComponent;
          let onDocClick: (e: MouseEvent) => void;

          const closeMenu = () => {
            sink.getSystem().removeFromGui(menu);
            document.removeEventListener('mousedown', onDocClick);
          };

          const menuSpec = TieredMenu.sketch({
            dom: {
              tag: 'div',
              classes: [ 'tox-menu', 'tox-selected-menu' ]
            },
            data: tieredData,
            markers: MenuParts.markers(spec.presets),
            onEscape: (_item) => {
              closeMenu();
              return Optional.some(true);
            },
            onExecute: (_item) => {
              closeMenu();
              return Optional.some(true);
            },
            onOpenMenu: () => Fun.noop,
            onOpenSubmenu: () => Fun.noop,
            eventOrder: {
              'alloy.execute': [
                'disabling',
                'alloy.base.behaviour',
                'toggling',
                'close-on-execute'
              ]
            },
            tmenuBehaviours: Behaviour.derive([
              AddEventsBehaviour.config('close-on-execute', [
                AlloyEvents.runOnExecute((_comp, _simulatedEvent) => {
                  closeMenu();
                })
              ]),
              // Add handler for sandboxClose event
              AddEventsBehaviour.config('custom-sandbox-close', [
                AlloyEvents.run(SystemEvents.sandboxClose(), () => {
                  closeMenu();
                })
              ])
            ])
          });

          menu = sink.getSystem().build(menuSpec);
          sink.getSystem().addToGui(menu);

          const chevronRect = chevronButton.element.dom.getBoundingClientRect();
          const sinkRect = sink.element.dom.getBoundingClientRect();
          const menuEl = menu.element.dom as HTMLElement;
          menuEl.style.position = 'absolute';
          menuEl.style.top = `${chevronRect.bottom - sinkRect.top}px`;
          menuEl.style.left = `${chevronRect.left - sinkRect.left}px`;

          setTimeout(() => {
            const firstItem = menuEl.querySelector('.tox-collection__item');
            if (firstItem) {
              (firstItem as HTMLElement).focus();
            }
          }, 0);

          onDocClick = (e: MouseEvent) => {
            if (!menuEl.contains(e.target as Node)) {
              closeMenu();
            }
          };

          document.addEventListener('mousedown', onDocClick);
        });
      });
    });
  };

  return [
    AlloyButton.sketch({
      ...renderCommonStructure(
        spec.icon,
        spec.text,
        Optional.none(),
        Optional.some([
          Toggling.config({ toggleClass: ToolbarButtonClasses.Ticked, aria: { mode: 'pressed' }, toggleOnExecute: false }),
          DisablingConfigs.toolbarButton(Fun.never),
          UiState.toggleOnReceive(Fun.constant({ contextType: 'any', shouldDisable: false }))
        ]),
        sharedBackstage.providers,
        spec.context,
        btnName
      ),
      action: (button) => {
        if (spec.onAction) {
          const api = getSplitButtonApi(button);
          if (api.isEnabled()) {
            spec.onAction(api);
          }
        }
      }
    }),
    AlloyButton.sketch({
      dom: {
        tag: 'button',
        classes: [ ToolbarButtonClasses.Button, 'tox-split-button__chevron' ],
        innerHtml: Icons.get('chevron-down', sharedBackstage.providers.icons),
        attributes: {
          'aria-label': sharedBackstage.providers.translate('Show menu'),
          ...(Type.isNonNullable(btnName) ? { 'data-mce-name': btnName + '-chevron' } : {})
        }
      },
      buttonBehaviours: Behaviour.derive([
        DisablingConfigs.splitButton(Fun.never),
        UiState.toggleOnReceive(Fun.constant({ contextType: 'any', shouldDisable: false }))
      ]),
      action: openDropdownMenu
    })
  ];
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
