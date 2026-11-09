import { Mouse } from '@ephox/agar';
import { type AlloyComponent, Disabling, GuiFactory, Toggling } from '@ephox/alloy';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import type { Toolbar } from '@ephox/bridge';
import { Fun, Optional } from '@ephox/katamari';
import { Attribute, SelectorFind } from '@ephox/sugar';
import { assert } from 'chai';

import { renderToolbarToggleButton } from 'tinymce/themes/silver/ui/toolbar/button/ToolbarButtons';

import * as GuiSetup from '../../module/GuiSetup';
import TestBackstage from '../../module/TestBackstage';

describe('headless.tinymce.themes.silver.toolbar.ToolbarToggleButtonDoubleClickTest', () => {
  const makeSpec = (name: string, onDoubleClick: Optional<(api: Toolbar.ToolbarToggleButtonInstanceApi) => void>): Toolbar.ToolbarToggleButton => ({
    context: 'any',
    type: 'togglebutton',
    shortcut: Optional.none(),
    enabled: true,
    active: false,
    tooltip: Optional.some(name),
    icon: Optional.none(),
    text: Optional.some(name),
    onSetup: () => Fun.noop,
    onAction: Fun.noop,
    onDoubleClick
  });

  const hook = GuiSetup.bddSetup((store, _doc, _body) => GuiFactory.build({
    dom: {
      tag: 'div'
    },
    components: [
      {
        dom: {
          tag: 'div',
          classes: [ 'with-dblclick' ]
        },
        components: [
          renderToolbarToggleButton({
            ...makeSpec('with', Optional.some((api: Toolbar.ToolbarToggleButtonInstanceApi) => {
              store.adder('onDoubleClick')();
              api.setActive(!api.isActive());
            })),
            onAction: store.adder('onAction')
          }, TestBackstage().shared.providers)
        ]
      },
      {
        dom: {
          tag: 'div',
          classes: [ 'without-dblclick' ]
        },
        components: [
          renderToolbarToggleButton({
            ...makeSpec('without', Optional.none()),
            onAction: store.adder('onAction.without')
          }, TestBackstage().shared.providers)
        ]
      }
    ]
  }));

  const withSelector = '.with-dblclick .tox-tbtn';
  const withoutSelector = '.without-dblclick .tox-tbtn';

  const getButton = (selector: string): AlloyComponent => {
    const component = hook.component();
    return component.getSystem().getByDom(
      SelectorFind.descendant(component.element, selector).getOrDie(`Could not find button defined by: ${selector}`)
    ).getOrDie();
  };

  afterEach(() => {
    Disabling.enable(getButton(withSelector));
    Toggling.off(getButton(withSelector));
    hook.store().clear();
  });

  it('TINYMCE-15104: dblclick calls onDoubleClick with the toggle button api', () => {
    const component = hook.component();
    const store = hook.store();
    const button = getButton(withSelector);
    store.clear();

    Mouse.dblclickOn(component.element, withSelector);
    store.assertEq('Only onDoubleClick should run for a dblclick event', [ 'onDoubleClick' ]);
    assert.equal(Attribute.get(button.element, 'aria-pressed'), 'true', 'onDoubleClick received a working api (setActive)');
  });

  it('TINYMCE-15104: the browser sequence click, click, dblclick calls onAction twice then onDoubleClick', () => {
    const component = hook.component();
    const store = hook.store();
    store.clear();

    Mouse.clickOn(component.element, withSelector);
    Mouse.clickOn(component.element, withSelector);
    Mouse.dblclickOn(component.element, withSelector);
    store.assertEq('Clicks are not suppressed', [ 'onAction', 'onAction', 'onDoubleClick' ]);
  });

  it('TINYMCE-15104: dblclick on a disabled toggle button does not call onDoubleClick', () => {
    const component = hook.component();
    const store = hook.store();
    Disabling.disable(getButton(withSelector));
    store.clear();

    Mouse.dblclickOn(component.element, withSelector);
    Mouse.clickOn(component.element, withSelector);
    store.assertEq('No callbacks should run on a disabled button', [ ]);
  });

  it('TINYMCE-15104: dblclick on a toggle button without onDoubleClick does nothing', () => {
    const component = hook.component();
    const store = hook.store();
    store.clear();

    Mouse.dblclickOn(component.element, withoutSelector);
    store.assertEq('Nothing should run', [ ]);
    Mouse.clickOn(component.element, withoutSelector);
    store.assertEq('Click still runs onAction', [ 'onAction.without' ]);
  });
});
