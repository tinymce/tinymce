import { Pipeline, Chain, Logger, UiFinder, RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { UiChains, Editor } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/modern/Theme';
import { Body, Element } from '@ephox/sugar';

const cNotExists = (selector) => {
  return Chain.op((container: Element) => {
    UiFinder.findIn(container, selector).fold(
      () => RawAssertions.assertEq('should not find anything', true, true),
      () => RawAssertions.assertEq('Expected ' + selector + ' not to exist.', true, false)
    );
  });
};

const cExists = (selector) => {
  return Chain.op((container: Element) => {
    UiFinder.findIn(container, selector).fold(
      () => RawAssertions.assertEq('Expected ' + selector + ' to exist.', true, false),
      () => RawAssertions.assertEq('found element', true, true)
    );
  });
};

UnitTest.asynctest('browser.tinymce.plugins.media.NoAdvancedTabTest', (success, failure) => {
  Plugin();
  Theme();

  Pipeline.async({}, [
    Logger.t('if alt source and poster set to false, do not show advance tab', Chain.asStep({}, [
      Chain.fromParent(
        Editor.cFromSettings({
          plugins: ['media'],
          toolbar: 'media',
          media_alt_source: false,
          media_poster: false,
          skin_url: '/project/js/tinymce/skins/lightgray'
        }),
        [
          Chain.fromChains([
            UiChains.cClickOnToolbar('click button', 'div[aria-label="Insert/edit media"]'),
            Chain.inject(Body.body()),
            UiFinder.cWaitForVisible('wait for popup', 'div.mce-floatpanel[aria-label="Insert/edit media"]'),
            cNotExists('div.mce-tab:contains("Advanced")')
          ]),
          Editor.cRemove
        ]
      )
    ])),
    Logger.t('if alt source and poster not set to false, show advance tab', Chain.asStep({}, [
      Chain.fromParent(
        Editor.cFromSettings({
          plugins: ['media'],
          toolbar: 'media',
          skin_url: '/project/js/tinymce/skins/lightgray'
        }),
        [
          Chain.fromChains([
            UiChains.cClickOnToolbar('click button', 'div[aria-label="Insert/edit media"]'),
            Chain.inject(Body.body()),
            UiFinder.cWaitForVisible('wait for popup', 'div.mce-floatpanel[aria-label="Insert/edit media"]'),
            cExists('div.mce-tab:contains("Advanced")')
          ]),
          Editor.cRemove
        ]
      )
    ]))
  ], () => success(), failure);

});
