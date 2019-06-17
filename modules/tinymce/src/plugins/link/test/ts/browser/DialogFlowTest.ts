import {
  ApproxStructure,
  Assertions,
  Chain,
  Keyboard,
  Keys,
  Logger,
  Mouse,
  NamedChain,
  Pipeline,
  Step,
  UiControls,
  UiFinder,
  FocusTools,
  Log,
  GeneralSteps,
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';
import { Attr } from '@ephox/sugar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.DialogFlowTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const doc = TinyDom.fromDom(document);

    const sAssertInputValue = (expected: string, group: string) => Logger.t('Assert input value', Chain.asStep({ }, [
      TestLinkUi.cFindInDialog('label:contains("' + group + '") + input'),
      UiControls.cGetValue,
      Assertions.cAssertEq('Checking input value', expected)
    ]));

    // FIX: Dupe
    const sAssertUrlStructure = (expected: (s, str, arr) => any) => Logger.t('Assert url structure', Chain.asStep({ }, [
      TestLinkUi.cFindInDialog('label:contains("URL") + .tox-form__controls-h-stack input'),
      Chain.op((urlinput) => {
        Assertions.assertStructure(
          'Checking content of url input',
          ApproxStructure.build(expected),
          urlinput
        );
      })
    ]));

    const testChangingAnchorValue = Log.stepsAsStep('TBA', 'Link: Switching anchor changes the href and text', [
      tinyApis.sSetContent('<p><a name="anchor1"></a>Our Anchor1</p><p><a name="anchor2"></a>Our Anchor2</p>'),
      TestLinkUi.sOpenLinkDialog,
      TestLinkUi.sSetHtmlSelectValue('Anchor', '#anchor2'),
      TestLinkUi.sAssertDialogContents({
        href: '#anchor2',
        text: 'anchor2',
        title: '',
        anchor: '#anchor2',
        target: ''
      }),
      TestLinkUi.sSetHtmlSelectValue('Anchor', '#anchor1'),
      TestLinkUi.sAssertDialogContents({
        href: '#anchor1',
        text: 'anchor1',
        title: '',
        anchor: '#anchor1',
        target: ''
      }),

      // Change the text ...so text won't change, but href will still
      TestLinkUi.sSetInputFieldValue('Text to display', 'Other text'),
      TestLinkUi.sSetHtmlSelectValue('Anchor', '#anchor2'),
      TestLinkUi.sAssertDialogContents({
        href: '#anchor2',
        text: 'Other text',
        title: '',
        anchor: '#anchor2',
        target: ''
      }),

      TestLinkUi.sClickSave,
      TestLinkUi.sAssertContentPresence(tinyApis, {
        'a[href]': 1,
        'a[href="#anchor2"]:contains("Other text")': 1
      })
    ]);

    const testChangingUrlValueWith = (sChooseItem: Step<any, any>) => Log.stepsAsStep('TBA', 'Link: Choosing something in the urlinput changes text and value', [
      tinyApis.sSetContent('<h1>Header One</h1><h2 id="existing-id">Header2</h2>'),
      TestLinkUi.sOpenLinkDialog,
      Keyboard.sKeydown(doc, Keys.down(), { }),
      UiFinder.sWaitForVisible('Waiting for dropdown', TinyDom.fromDom(document.body), '.tox-menu'),
      sChooseItem,
      sAssertUrlStructure((s, str, _arr) => {
        return s.element('input', {
          value: str.startsWith('#h_')
        });
      }),
      sAssertInputValue('Header One', 'Text to display'),
      TestLinkUi.sAssertContentPresence(tinyApis, {
        'h1[id]': 0,
        'h2[id]': 1
      }),
      TestLinkUi.sClickSave,
      TestLinkUi.sAssertContentPresence(tinyApis, {
        'h1[id]': 1
      }),

      // Check that the h1's id value is referred to by a link containing dog
      Chain.asStep(TinyDom.fromDom(editor.getBody()), [
        NamedChain.asChain([
          NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn('h1'), 'h1'),
          NamedChain.direct('h1', Chain.mapper((h1) => Attr.get(h1, 'id')), 'h1-id'),
          NamedChain.bundle((obj) => {
            return UiFinder.findIn(obj[NamedChain.inputName()], `a[href="#${obj['h1-id']}"]:contains("Header One")`);
          })
        ])
      ])
    ]);

    const testChangingUrlValueWithKeyboard = Log.step('TBA', 'Link: With Keyboard',
      testChangingUrlValueWith(GeneralSteps.sequence([
        Keyboard.sKeydown(doc, Keys.enter(), { })
      ]))
    );

    const testChangingUrlValueWithMouse = Log.step('TBA', 'Link: With Mouse',
      testChangingUrlValueWith(Mouse.sClickOn(TinyDom.fromDom(document.body), '.tox-collection__item')
      )
    );

    const testChangingUrlValueManually = Log.stepsAsStep('TBA', 'Link: Change urlinput value manually', [
        tinyApis.sSetContent('<h1>Something</h2>'),
        tinyApis.sSetSelection([ 0, 0 ], ''.length, [ 0, 0 ], 'Something'.length),
        TestLinkUi.sOpenLinkDialog,

        FocusTools.sSetActiveValue(doc, 'http://www.tiny.cloud'),
        TestLinkUi.sAssertDialogContents({
          href: 'http://www.tiny.cloud',
          text: 'Something',
          title: '',
          target: ''
        }),
        TestLinkUi.sClickSave,
        TestLinkUi.sAssertContentPresence(tinyApis, {
          a: 1
        })
      ]
    );

    Pipeline.async({}, [
      TestLinkUi.sClearHistory,
      testChangingAnchorValue,
      testChangingUrlValueWithKeyboard,
      testChangingUrlValueWithMouse,
      testChangingUrlValueManually,
      TestLinkUi.sClearHistory
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
