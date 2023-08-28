import { ApproxStructure, Assertions, Keyboard, Keys, Mouse, TestStore, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { Container, Disabling, Focusing, GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Future, Optional } from '@ephox/katamari';
import { Attribute, SelectorFind, SugarDocument, Value } from '@ephox/sugar';
import { assert } from 'chai';

import { ApiUrlData } from 'tinymce/themes/silver/backstage/UrlInputBackstage';
import { LinkTargetType } from 'tinymce/themes/silver/ui/core/LinkTargets';
import { renderUrlInput } from 'tinymce/themes/silver/ui/dialog/UrlInput';

import * as TestExtras from '../../../module/TestExtras';

describe('headless.tinymce.themes.silver.components.urlinput.UrlInputTest', () => {
  const extrasHook = TestExtras.bddSetup();

  const renderUrlInputWithPickerText = (store: TestStore<string>, pickerText?: string) =>
    renderUrlInput({
      label: Optional.some('UrlInput label'),
      picker_text: Optional.from(pickerText),
      name: 'col1',
      filetype: 'file',
      enabled: true
    }, extrasHook.access().extras.backstages.popup, {
      getHistory: (_fileType) => [],
      addToHistory: (_url, _filetype) => store.adder('addToHistory')(),
      getLinkInformation: () => Optional.some({
        targets: [
          {
            type: 'header' as LinkTargetType,
            title: 'Header1',
            url: '#header',
            level: 0,
            attach: store.adder('header1.attach')
          },
          {
            type: 'header' as LinkTargetType,
            title: 'Header2',
            url: '#header2',
            level: 0,
            attach: store.adder('header2.attach')
          }
        ],
        anchorTop: '#anchor-top',
        anchorBottom: undefined
      }),
      getValidationHandler: () => Optional.none(),
      getUrlPicker: (_filetype) => Optional.some((entry: ApiUrlData) => {
        store.adder('urlpicker')();
        return Future.pure({ value: 'http://tiny.cloud', meta: { before: entry.value }, fieldname: 'test' });
      })
    }, Optional.none());

  const hook = TestHelpers.GuiSetup.bddSetup((store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      dom: {
        tag: 'div'
      },
      components: [
        renderUrlInputWithPickerText(store, 'UrlInput picker text'),
        renderUrlInputWithPickerText(store)
      ]
    })
  ), () => extrasHook.access().getPopupMothership());

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    '.tox-menu { background: white; }',
    '.tox-collection__item--active { background: #cadbee }'
  ]);

  const getFirstComponent = () =>
    hook.component().components()[0];

  const getInput = () => {
    const component = getFirstComponent();
    return component.getSystem().getByDom(
      SelectorFind.descendant(component.element, 'input').getOrDie('Could not find input')
    ).getOrDie();
  };

  const getPicker = (specificText: boolean) => {
    const component = hook.component().components()[specificText ? 0 : 1];
    return component.getSystem().getByDom(
      SelectorFind.descendant(component.element, 'button').getOrDie('Could not find picker button')
    ).getOrDie();
  };

  const pOpenMenu = async () => {
    const sink = extrasHook.access().getPopupSink();
    const doc = hook.root();
    Focusing.focus(getInput());
    Keyboard.activeKeydown(doc, Keys.down());
    await UiFinder.pWaitFor('Waiting for menu to appear', sink, '.tox-menu .tox-collection__item');
    return UiFinder.findIn(sink, '[role="menu"]').getOrDie();
  };

  const assertMenuIsClosed = () =>
    UiFinder.notExists(hook.body(), '.tox-menu');

  const closeMenu = () => {
    const doc = hook.root();
    // Close the menu and verify it did actually close
    Keyboard.activeKeystroke(doc, Keys.escape());
    assertMenuIsClosed();
  };

  beforeEach(() => {
    hook.store().clear();
  });

  it('Disabling state', () => {
    const component = getFirstComponent();
    assert.isFalse(Disabling.isDisabled(component), 'Initial disabled state');
    Disabling.set(component, true);
    assert.isTrue(Disabling.isDisabled(component), 'enabled > disabled');
    Disabling.set(component, false);
    assert.isFalse(Disabling.isDisabled(component), 'disabled > enabled');
  });

  it('Check structure of the autocompletion menu', async () => {
    const menu = await pOpenMenu();
    Assertions.assertStructure(
      'Checking structure of menu (especially text)',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-menu'), arr.has('tox-collection--list'), arr.has('tox-collection') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-collection__group') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', { html: str.is('Header1') })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', { html: str.is('Header2') })
                ]
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-collection__group') ],
            children: [
              s.element('div', {
                children: [
                  s.element('div', { html: str.is('&lt;top&gt;') })
                ]
              })
            ]
          })
        ]
      })),
      menu
    );

    closeMenu();
  });

  it('Type "He", select an item and assert input state is updated', async () => {
    const sink = extrasHook.access().getPopupSink();
    const store = hook.store();
    const doc = hook.root();
    const input = getInput();

    await pOpenMenu();
    UiControls.setValue(input.element, 'He', 'input');
    await Waiter.pTryUntil(
      'Waiting for the menu to update',
      () => {
        const menuItems = UiFinder.findAllIn(sink, '.tox-collection__item');
        assert.isAtMost(menuItems.length, 2, `Menu hasn't been updated yet`);
      }
    );

    const menu = UiFinder.findIn(sink, '[role="menu"]').getOrDie();
    Assertions.assertStructure(
      'Checking the menu shows items that match the input string',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-menu'), arr.has('tox-collection--list'), arr.has('tox-collection') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-collection__group') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-collection__item'), arr.has('tox-collection__item--active') ],
                children: [
                  s.element('div', { html: str.is('Header1') })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', { html: str.is('Header2') })
                ]
              })
            ]
          })
        ]
      })),
      menu
    );

    store.assertEq('nothing in store ... before selecting item', []);
    Keyboard.activeKeydown(doc, Keys.enter());
    assert.equal(Value.get(input.element), '#header', 'Checking Value.get');
    assertMenuIsClosed();
    const repValue = Representing.getValue(input);
    assert.deepEqual(
      {
        value: repValue.value,
        meta: { text: repValue.meta.text },
        fieldname: 'test'
      },
      {
        value: '#header',
        meta: { text: 'Header1' },
        fieldname: 'test'
      },
      'Checking Rep.getValue'
    );

    store.assertEq('addToHistory called ... before firing attach', [ 'addToHistory' ]);
    // Check that attach fires
    repValue.meta.attach();
    store.assertEq('Attach should be in store ... after firing attach', [ 'addToHistory', 'header1.attach' ]);
  });

  it('Click urlpicker and assert input state is updated', async () => {
    const component = getFirstComponent();
    const store = hook.store();
    const input = getInput();

    // Set the initial state of the input
    Representing.setValue(input, {
      value: '#header',
      meta: { text: 'Header1' },
      fieldname: 'test'
    });

    Mouse.clickOn(component.element, 'button');
    store.assertEq(
      'URL picker should have been opened ... after clicking button',
      [ 'urlpicker' ]
    );

    await Waiter.pTryUntil('Checking Value.get', () => {
      assert.equal(Value.get(input.element), 'http://tiny.cloud');
    });

    const repValue = Representing.getValue(input);
    assert.deepEqual(repValue, {
      value: 'http://tiny.cloud',
      meta: { before: '#header' },
      fieldname: 'test'
    }, 'Checking Rep.getValue');
  });

  it('TINY-8997: Should not populate the input value when highlighting a dropdown item', async () => {
    const input = getInput();

    UiControls.setValue(input.element, '');
    const menu = await pOpenMenu();

    Mouse.hoverOn(menu, '.tox-collection__item:contains(Header2)');
    assert.equal(UiControls.getValue(input.element), '');

    Mouse.clickOn(menu, '.tox-collection__item:contains(Header1)');
    assert.equal(Value.get(input.element), '#header', 'Checking Value.get');
    assertMenuIsClosed();

    const repValue = Representing.getValue(input);
    assert.deepEqual(
      {
        value: repValue.value,
        meta: { text: repValue.meta.text }
      },
      {
        value: '#header',
        meta: { text: 'Header1' }
      },
      'Checking Rep.getValue'
    );
  });

  it('TINY-9717: it should open dropdown after the input value was reset to an empty string', async () => {
    const component = getFirstComponent();
    Representing.setValue(component, { value: '' });
    await pOpenMenu();
    closeMenu();
  });

  it('TINY-10155: Title attribute of picker button should be specified by picker_text property', () =>
    assert.equal(Attribute.get(getPicker(true).element, 'title'), 'UrlInput picker text'));

  it('TINY-10155: Title attribute of picker button should fall back to label when picker_text property is not specified', () =>
    assert.equal(Attribute.get(getPicker(false).element, 'title'), 'UrlInput label'));
});
