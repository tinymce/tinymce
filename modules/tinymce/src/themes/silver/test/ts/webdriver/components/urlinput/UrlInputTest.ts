import { RealKeys, UiControls } from '@ephox/agar';
import { GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Future, Optional } from '@ephox/katamari';
import { SelectorFind, SugarDocument, Value } from '@ephox/sugar';
import { assert } from 'chai';

import { ApiUrlData } from 'tinymce/themes/silver/backstage/UrlInputBackstage';
import { renderUrlInput } from 'tinymce/themes/silver/ui/dialog/UrlInput';

import * as TestExtras from '../../../module/TestExtras';

describe('webdriver.tinymce.themes.silver.components.urlinput.UrlInputTest', () => {
  const extrasHook = TestExtras.bddSetup();

  const hook = TestHelpers.GuiSetup.bddSetup((store, _doc, _body) => GuiFactory.build(
    renderUrlInput({
      label: Optional.some('UrlInput label'),
      picker_text: Optional.some('UrlInput picker text'),
      name: 'col1',
      filetype: 'file',
      enabled: true
    }, extrasHook.access().extras.backstages.popup, {
      getHistory: (_fileType) => [],
      addToHistory: (_url, _filetype) => store.adder('addToHistory')(),
      getLinkInformation: () => Optional.none(),
      getValidationHandler: () => Optional.none(),
      getUrlPicker: (_filetype) => Optional.some((entry: ApiUrlData) => {
        store.adder('urlpicker')();
        return Future.pure({ value: 'http://tiny.cloud', meta: { before: entry.value }, fieldname: 'test' });
      })
    }, Optional.none())
  ));

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    '.tox-menu { background: white; }',
    '.tox-collection__item--active { background: #cadbee }'
  ]);

  const getInput = () => {
    const component = hook.component();
    return component.getSystem().getByDom(
      SelectorFind.descendant(component.element, 'input').getOrDie('Could not find input')
    ).getOrDie();
  };

  const assertTrimSpaces = (inputKeys: any[], expectedOutput: string) =>
    async () => {
      const input = getInput();

      await RealKeys.pSendKeysOn('body input', inputKeys);

      assert.equal(Value.get(input.element), expectedOutput, 'Checking Value.get');
      const repValue = Representing.getValue(input);
      assert.deepEqual(
        {
          value: repValue.value,
          meta: { text: repValue.meta.text },
        },
        {
          value: expectedOutput,
          meta: { text: undefined },
        },
        'Checking Rep.getValue'
      );
    };

  beforeEach(() => {
    hook.store().clear();
    UiControls.setValue(getInput().element, '');
  });

  context('Trim spaces as expected for an URL', () => {
    it('TINY-8775: Trim a space if it is the only thing in the input', assertTrimSpaces([ RealKeys.text(' ') ], ''));
    it('TINY-8775: Trim a space if it is at the start', assertTrimSpaces([ RealKeys.text(' A') ], 'A'));
    it('TINY-8775: Trim a space if it is at the end', assertTrimSpaces([ RealKeys.text('A ') ], 'A'));
    it('TINY-8775: Trim all appropriate spaces', assertTrimSpaces([ RealKeys.text(' A B '), RealKeys.combo({}, 'arrowLeft'), RealKeys.text(' ') ], 'A B'));
  });
});
