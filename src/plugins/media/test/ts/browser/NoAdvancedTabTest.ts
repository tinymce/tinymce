import { Chain, Pipeline, UiFinder, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Editor, UiChains } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.media.NoAdvancedTabTest', (success, failure) => {
  Plugin();
  Theme();

  Pipeline.async({}, [
    Log.chainsAsStep('TBA', 'Media: if alt source and poster set to false, do not show advance tab', [
      Chain.fromParent(
        Editor.cFromSettings({
          plugins: ['media'],
          toolbar: 'media',
          media_alt_source: false,
          media_poster: false,
          theme: 'silver',
          base_url: '/project/tinymce/js/tinymce'
        }),
        [
          Chain.fromChains([
            UiChains.cClickOnToolbar('click button', 'button[aria-label="Insert/edit media"]'),
            Chain.inject(Body.body()),
            UiFinder.cWaitForVisible('wait for popup', 'div.tox-dialog'),
            Utils.cNotExists('div.tox-tab:contains(Advanced)')
          ]),
          Editor.cRemove
        ]
      )
    ]),
    Log.chainsAsStep('TBA', 'Media: if alt source and poster not set to false, show advance tab', [
      Chain.fromParent(
        Editor.cFromSettings({
          plugins: ['media'],
          toolbar: 'media',
          theme: 'silver',
          base_url: '/project/tinymce/js/tinymce'
        }),
        [
          Chain.fromChains([
            UiChains.cClickOnToolbar('click button', 'button[aria-label="Insert/edit media"]'),
            Chain.inject(Body.body()),
            UiFinder.cWaitForVisible('wait for popup', 'div.tox-dialog'),
            Utils.cExists('div.tox-tab:contains(Advanced)')
          ]),
          Editor.cRemove
        ]
      )
    ])
  ], () => success(), failure);

});
