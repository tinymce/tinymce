import { ApproxStructure, Assertions, Chain, NamedChain, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Editor as McEditor, UiChains } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { Body, Element, Insert, Remove, Selectors } from '@ephox/sugar';
import Styles from 'tinymce/themes/mobile/style/Styles';
import mobileTheme from 'tinymce/themes/mobile/Theme';

UnitTest.asynctest('browser.tinymce.themes.mobile.EditorRemoveTest', (success, failure) => {
  const platform = PlatformDetection.detect();

  if (platform.browser.isIE() || platform.browser.isEdge()) {
    // No need to run mobile tests on IE/Edge as it's not supported
    return success();
  }

  mobileTheme();

  const cleanedThorAttrsStruct = (str) => {
    return {
      'position': str.none(),
      'background-color': str.none(),
    };
  };

  Pipeline.async({}, [
    Chain.asStep({}, [
      McEditor.cFromSettings({
        theme: 'mobile',
        inline: false,
        base_url: '/project/tinymce/js/tinymce'
      }),
      Chain.op((editor) => {
        const wrapperElm = Element.fromHtml('<div class="tinymce-editor"></div>');
        Selectors.one('#' + editor.id).each((textareaElm) => {
          Insert.wrap(textareaElm, wrapperElm);
        });
        Selectors.one('.tinymce-mobile-outer-container').each((editorElm) => {
          Insert.wrap(editorElm, wrapperElm);
        });
      }),
      NamedChain.asChain([
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        NamedChain.writeValue('body', Body.body()),
        NamedChain.direct('body', UiFinder.cExists(`.${Styles.resolve('mask-tap-icon')}`), '_'),
        NamedChain.direct('body', UiChains.cClickOnUi('Click the tap to edit button', `.${Styles.resolve('mask-tap-icon')}`), '_'),
        NamedChain.direct('body', UiChains.cWaitForUi('Wait mobile Toolbar', `.${Styles.resolve('toolbar')}`), '_'),
        NamedChain.direct('body', UiChains.cWaitForUi('Check for The first group', '[aria-label="The first group"]'), '_'),
        NamedChain.direct('body', UiChains.cWaitForUi('Check for the action group', '[aria-label="the action group"]'), '_'),
        NamedChain.direct('body', UiFinder.cNotExists('[aria-label="The read only mode group"]'), '_'),
        NamedChain.direct('body', UiFinder.cNotExists(`.${Styles.resolve('mask-edit-icon')}`), '_'),
        NamedChain.direct('body', UiChains.cClickOnUi('Click back to Tap to Edit screen', `.${Styles.resolve('icon-back')}`), '_'),
        NamedChain.direct('body', UiFinder.cExists(`.${Styles.resolve('mask-tap-icon')}`), '_'),
        NamedChain.outputInput
      ]),
      McEditor.cRemove,
      Chain.mapper(() => Body.body()),
      Assertions.cAssertStructure('Assert Thor overrides removed from body', ApproxStructure.build((s, str) => {
        return s.element('body', {
          attrs: cleanedThorAttrsStruct(str),
        });
      })),
      UiFinder.cFindIn('div.tinymce-editor'),
      Assertions.cAssertStructure('Assert Thor overrides removed from editor div', ApproxStructure.build((s, str) => {
        return s.element('div', {
          attrs: cleanedThorAttrsStruct(str),
          children: []
        });
      })),
      Chain.op((editorElm) => {
        Remove.remove(editorElm);
      })
    ])
  ], success, failure);
});
