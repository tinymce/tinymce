/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, CustomEvent, Dropdown as AlloyDropdown, Focusing, GuiFactory, Keying,
  Memento, Replacing, Representing, SimulatedEvent, SketchSpec, TieredData, Unselecting
} from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { Arr, Cell, Fun, Future, Id, Merger, Optional } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';
import { toolbarButtonEventOrder } from 'tinymce/themes/silver/ui/toolbar/button/ButtonEvents';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import * as ReadOnly from '../../ReadOnly';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import { renderLabel, renderReplacableIconFromPack } from '../button/ButtonSlices';
import { onControlAttached, onControlDetached, OnDestroy } from '../controls/Controls';
import * as Icons from '../icons/Icons';
import { componentRenderPipeline } from '../menus/item/build/CommonMenuItem';
import * as MenuParts from '../menus/menu/MenuParts';

export const updateMenuText = Id.generate('update-menu-text');
export const updateMenuIcon = Id.generate('update-menu-icon');

export interface UpdateMenuTextEvent extends CustomEvent {
  readonly text: string;
}

export interface UpdateMenuIconEvent extends CustomEvent {
  readonly icon: string;
}

export interface CommonDropdownSpec<T> {
  uid?: string;
  text: Optional<string>;
  icon: Optional<string>;
  disabled?: boolean;
  tooltip: Optional<string>;
  role: Optional<string>;
  fetch: (comp: AlloyComponent, callback: (tdata: Optional<TieredData>) => void) => void;
  onSetup: (itemApi: T) => OnDestroy<T>;
  getApi: (comp: AlloyComponent) => T;
  columns: Toolbar.ColumnTypes;
  presets: Toolbar.PresetTypes;
  classes: string[];
  dropdownBehaviours: Array<Behaviour.NamedConfiguredBehaviour<
  Behaviour.BehaviourConfigSpec, Behaviour.BehaviourConfigDetail>>;
}

// TODO: Use renderCommonStructure here.
const renderCommonDropdown = <T>(
  spec: CommonDropdownSpec<T>,
  prefix: string,
  sharedBackstage: UiFactoryBackstageShared
): SketchSpec => {
  const editorOffCell = Cell(Fun.noop);
  const optMemDisplayText = spec.text.map(
    (text) => Memento.record(renderLabel(text, prefix, sharedBackstage.providers))
  );
  const optMemDisplayIcon = spec.icon.map(
    (iconName) => Memento.record(renderReplacableIconFromPack(iconName, sharedBackstage.providers.icons))
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
    // The originating dropdown is stored on the sandbox itself.
    const dropdown: AlloyComponent = Representing.getValue(comp);

    // Focus the dropdown. Current workaround required to make flow recognise the current focus
    Focusing.focus(dropdown);
    AlloyTriggers.emitWith(dropdown, 'keydown', {
      raw: se.event.raw
    });

    // Close the dropdown
    AlloyDropdown.close(dropdown);

    return Optional.some(true);
  };

  const role = spec.role.fold(() => ({ }), (role) => ({ role }));

  const tooltipAttributes = spec.tooltip.fold(
    () => ({}),
    (tooltip) => {
      const translatedTooltip = sharedBackstage.providers.translate(tooltip);
      return {
        'title': translatedTooltip, // TODO: tooltips AP-213
        'aria-label': translatedTooltip
      };
    }
  );

  const memDropdown = Memento.record(
    AlloyDropdown.sketch({
      ...spec.uid ? { uid: spec.uid } : { },
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
        Optional.some({
          dom: {
            tag: 'div',
            classes: [ `${prefix}__select-chevron` ],
            innerHtml: Icons.get('chevron-down', sharedBackstage.providers.icons)
          }
        })
      ]),
      matchWidth: true,
      useMinWidth: true,

      // TODO: Not quite working. Can still get the button focused.
      dropdownBehaviours: Behaviour.derive([
        ...spec.dropdownBehaviours,
        DisablingConfigs.button(() => spec.disabled || sharedBackstage.providers.isDisabled()),
        ReadOnly.receivingConfig(),
        Unselecting.config({ }),
        Replacing.config({ }),
        AddEventsBehaviour.config('dropdown-events', [
          onControlAttached(spec, editorOffCell),
          onControlDetached(spec, editorOffCell)
        ]),
        AddEventsBehaviour.config('menubutton-update-display-text', [
          AlloyEvents.run<UpdateMenuTextEvent>(updateMenuText, (comp, se) => {
            optMemDisplayText.bind((mem) => mem.getOpt(comp)).each((displayText) => {
              Replacing.set(displayText, [ GuiFactory.text(sharedBackstage.providers.translate(se.event.text)) ] );
            });
          }),
          AlloyEvents.run<UpdateMenuIconEvent>(updateMenuIcon, (comp, se) => {
            optMemDisplayIcon.bind((mem) => mem.getOpt(comp)).each((displayIcon) => {
              Replacing.set(displayIcon, [
                renderReplacableIconFromPack(se.event.icon, sharedBackstage.providers.icons)
              ] );
            });
          })
        ])
      ]),
      eventOrder: Merger.deepMerge(toolbarButtonEventOrder, {
        mousedown: [ 'focusing', 'alloy.base.behaviour', 'item-type-events', 'normal-dropdown-events' ]
      }),

      sandboxBehaviours: Behaviour.derive([
        Keying.config({
          mode: 'special',
          onLeft: onLeftOrRightInMenu,
          onRight: onLeftOrRightInMenu
        })
      ]),

      lazySink: sharedBackstage.getSink,

      toggleClass: `${prefix}--active`,

      parts: {
        // FIX: hasIcons
        menu: MenuParts.part(false, spec.columns, spec.presets)
      },

      fetch: (comp) => Future.nu(Fun.curry(spec.fetch, comp))
    })
  );

  return memDropdown.asSpec() as SketchSpec;
};

export {
  renderCommonDropdown
};
