import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, CustomEvent, Dropdown as AlloyDropdown, Focusing, GuiFactory, Highlighting,
  Keying, MaxHeight, Memento, Replacing, Representing, SimulatedEvent, SketchSpec, SystemEvents, TieredData, Unselecting
} from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { Arr, Cell, Fun, Future, Id, Merger, Optional } from '@ephox/katamari';
import { EventArgs, SugarElement } from '@ephox/sugar';

import { toolbarButtonEventOrder } from 'tinymce/themes/silver/ui/toolbar/button/ButtonEvents';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import * as ReadOnly from '../../ReadOnly';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import * as UiUtils from '../alien/UiUtils';
import { renderLabel, renderReplaceableIconFromPack } from '../button/ButtonSlices';
import { onControlAttached, onControlDetached, OnDestroy } from '../controls/Controls';
import * as Icons from '../icons/Icons';
import { componentRenderPipeline } from '../menus/item/build/CommonMenuItem';
import * as MenuParts from '../menus/menu/MenuParts';
import { focusSearchField, handleRedirectToMenuItem, handleRefetchTrigger, updateAriaOnDehighlight, updateAriaOnHighlight } from '../menus/menu/searchable/SearchableMenu';
import { RedirectMenuItemInteractionEvent, redirectMenuItemInteractionEvent, RefetchTriggerEvent, refetchTriggerEvent } from '../menus/menu/searchable/SearchableMenuEvents';

export const updateMenuText = Id.generate('update-menu-text');
export const updateMenuIcon = Id.generate('update-menu-icon');

export interface UpdateMenuTextEvent extends CustomEvent {
  readonly text: string;
}

export interface UpdateMenuIconEvent extends CustomEvent {
  readonly icon: string;
}

export interface CommonDropdownSpec<T> {
  readonly uid?: string;
  readonly text: Optional<string>;
  readonly icon: Optional<string>;
  readonly disabled?: boolean;
  readonly tooltip: Optional<string>;
  readonly role: Optional<string>;
  readonly fetch: (comp: AlloyComponent, callback: (tdata: Optional<TieredData>) => void) => void;
  readonly onSetup: (itemApi: T) => OnDestroy<T>;
  readonly getApi: (comp: AlloyComponent) => T;
  readonly columns: Toolbar.ColumnTypes;
  readonly presets: Toolbar.PresetTypes;
  readonly classes: string[];
  readonly dropdownBehaviours: Behaviour.NamedConfiguredBehaviour<any, any, any>[];
  readonly searchable?: boolean;
}

// TODO: Use renderCommonStructure here.
const renderCommonDropdown = <T>(
  spec: CommonDropdownSpec<T>,
  prefix: string,
  sharedBackstage: UiFactoryBackstageShared
): SketchSpec => {
  const editorOffCell = Cell(Fun.noop);

  // We need mementos for display text and display icon because on the events
  // updateMenuText and updateMenuIcon respectively, their contents are changed
  // via Replacing. These events are generally emitted by dropdowns that want the
  // main text and icon to match the current selection (e.g. bespokes like font family)
  const optMemDisplayText = spec.text.map(
    (text) => Memento.record(renderLabel(text, prefix, sharedBackstage.providers))
  );
  const optMemDisplayIcon = spec.icon.map(
    (iconName) => Memento.record(renderReplaceableIconFromPack(iconName, sharedBackstage.providers.icons))
  );

  /*
   * The desired behaviour here is:
   *
   *   when left or right is pressed, and it isn't associated with expanding or
   *   collapsing a submenu, then it should navigate to the next menu item, and
   *   expand it (without highlighting any items in the expanded menu).
   *   It also needs to close the previous menu
   */
  const onLeftOrRightInMenu = (comp: AlloyComponent, se: SimulatedEvent<EventArgs>) => {
    // The originating dropdown is stored on the sandbox itself. This is just an
    // implementation detail of alloy. We really need to make it a fully-fledged API.
    // TODO: TINY-9014 Make SandboxAPI have a function that just delegates to Representing
    const dropdown: AlloyComponent = Representing.getValue(comp);

    // Focus the dropdown. Current workaround required to make FlowLayout recognise the current focus.
    // The triggering keydown is going to try to move the focus left or
    // right of the current menu, so it needs to know what the current menu dropdown is. It
    // can't work it out by the current focus, because the current focus is *in* the menu, so
    // we help it by moving the focus to the button, so it can work out what the next menu to
    // the left or right is.
    Focusing.focus(dropdown);
    AlloyTriggers.emitWith(dropdown, 'keydown', {
      raw: se.event.raw
    });

    // Because we have just navigated off this open menu, we want to close it.
    // INVESTIGATE: TINY-9014: Is this handling situations where there were no menus
    // to move to? Does it matter if we still close it when there are no other menus?
    AlloyDropdown.close(dropdown);

    // The Optional.some(true) tells the keyboard handler that this event was handled,
    // which will do things like stopPropagation and preventDefault.
    return Optional.some(true);
  };

  const role = spec.role.fold(() => ({}), (role) => ({ role }));

  const tooltipAttributes = spec.tooltip.fold(
    () => ({}),
    (tooltip) => {
      const translatedTooltip = sharedBackstage.providers.translate(tooltip);
      return {
        // TODO: AP-213 Implement tooltips manually, rather than relying on title
        'title': translatedTooltip,
        'aria-label': translatedTooltip
      };
    }
  );

  const iconSpec = Icons.render('chevron-down', {
    tag: 'div',
    classes: [ `${prefix}__select-chevron` ]
  }, sharedBackstage.providers.icons);

  const fixWidthBehaviourName = Id.generate('common-button-display-events');

  const memDropdown = Memento.record(
    AlloyDropdown.sketch({
      ...spec.uid ? { uid: spec.uid } : {},
      ...role,
      dom: {
        tag: 'button',
        classes: [ prefix, `${prefix}--select` ].concat(Arr.map(spec.classes, (c) => `${prefix}--${c}`)),
        attributes: {
          ...tooltipAttributes
        }
      },
      components: componentRenderPipeline([
        optMemDisplayIcon.map((mem) => mem.asSpec()),
        optMemDisplayText.map((mem) => mem.asSpec()),
        Optional.some(iconSpec)
      ]),
      matchWidth: true,
      useMinWidth: true,

      // When the dropdown opens, if we are in search mode, then we want to
      // focus our searcher.
      onOpen: (anchor, dropdownComp, tmenuComp) => {
        if (spec.searchable) {
          focusSearchField(tmenuComp);
        }
      },

      dropdownBehaviours: Behaviour.derive([
        ...spec.dropdownBehaviours,
        DisablingConfigs.button(() => spec.disabled || sharedBackstage.providers.isDisabled()),
        ReadOnly.receivingConfig(),
        // INVESTIGATE (TINY-9012): There was a old comment here about something not quite working, and that
        // we can still get the button focused. It was probably related to Unselecting.
        Unselecting.config({}),
        Replacing.config({}),

        // This is the generic way to make onSetup and onDestroy call as the component is attached /
        // detached from the page/DOM.
        AddEventsBehaviour.config('dropdown-events', [
          onControlAttached(spec, editorOffCell),
          onControlDetached(spec, editorOffCell)
        ]),
        AddEventsBehaviour.config(fixWidthBehaviourName, [
          AlloyEvents.runOnAttached((comp, _se) => UiUtils.forceInitialSize(comp)),
        ]),
        AddEventsBehaviour.config('menubutton-update-display-text', [
          // These handlers are just using Replacing to replace either the menu
          // text or the icon.
          AlloyEvents.run<UpdateMenuTextEvent>(updateMenuText, (comp, se) => {
            optMemDisplayText.bind((mem) => mem.getOpt(comp)).each((displayText) => {
              Replacing.set(displayText, [ GuiFactory.text(sharedBackstage.providers.translate(se.event.text)) ]);
            });
          }),
          AlloyEvents.run<UpdateMenuIconEvent>(updateMenuIcon, (comp, se) => {
            optMemDisplayIcon.bind((mem) => mem.getOpt(comp)).each((displayIcon) => {
              Replacing.set(displayIcon, [
                renderReplaceableIconFromPack(se.event.icon, sharedBackstage.providers.icons)
              ]);
            });
          })
        ])
      ]),
      eventOrder: Merger.deepMerge(toolbarButtonEventOrder, {
        // INVESTIGATE (TINY-9014): Explain why we need the events in this order.
        // Ideally, have a test that fails when they are in a different order if order
        // is important
        mousedown: [ 'focusing', 'alloy.base.behaviour', 'item-type-events', 'normal-dropdown-events' ],
        [SystemEvents.attachedToDom()]: [
          'toolbar-button-events',
          'dropdown-events',
          fixWidthBehaviourName
        ]
      }),

      sandboxBehaviours: Behaviour.derive([
        Keying.config({
          mode: 'special',
          onLeft: onLeftOrRightInMenu,
          onRight: onLeftOrRightInMenu
        }),

        AddEventsBehaviour.config('dropdown-sandbox-events', [
          AlloyEvents.run<RefetchTriggerEvent>(refetchTriggerEvent, (originalSandboxComp, se) => {
            handleRefetchTrigger(originalSandboxComp);
            // It's a custom event that no-one else should be listening to, so stop it.
            se.stop();
          }),

          AlloyEvents.run<RedirectMenuItemInteractionEvent>(
            redirectMenuItemInteractionEvent,
            (sandboxComp, se) => {
              handleRedirectToMenuItem(sandboxComp, se);
              // It's a custom event that no-one else should be listening to, so stop it.
              se.stop();
            }
          )
        ])
      ]),

      lazySink: sharedBackstage.getSink,

      toggleClass: `${prefix}--active`,

      parts: {
        menu: {
          ...MenuParts.part(false, spec.columns, spec.presets),
          // When the menu is "searchable", use fakeFocus so that keyboard
          // focus stays in the search field
          fakeFocus: spec.searchable,
          onHighlightItem: updateAriaOnHighlight,
          onCollapseMenu: (tmenuComp, itemCompCausingCollapse, nowActiveMenuComp) => {
            // We want to update ARIA on collapsing as well, because it isn't changing
            // the highlights. So what we need to do is get the right parameters to
            // pass to updateAriaOnHighlight
            Highlighting.getHighlighted(nowActiveMenuComp).each((itemComp) => {
              updateAriaOnHighlight(tmenuComp, nowActiveMenuComp, itemComp);
            });
          },
          onDehighlightItem: updateAriaOnDehighlight
        }
      },

      getAnchorOverrides: () => {
        return {
          maxHeightFunction: (element: SugarElement<HTMLElement>, available: number): void => {
            MaxHeight.anchored()(element, available - 10);
          },
        };
      },

      fetch: (comp) => Future.nu(Fun.curry(spec.fetch, comp))
    })
  );

  return memDropdown.asSpec() as SketchSpec;
};

export {
  renderCommonDropdown
};
