import { Chain, Pipeline, Log } from '@ephox/agar';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { Editor } from '@ephox/mcagar';
import { getToolbarMode } from 'tinymce/themes/silver/api/Settings';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('SettingsTest', (success, failure) =>  {
  Theme();

  Pipeline.async({}, [
    Log.chainsAsStep('TINY-4416', 'Test toolbar_mode & toolbar_drawer settings', [
      Editor.cFromSettings({
        base_url: '/project/tinymce/js/tinymce',
      }),
      Chain.op((editor) => Assert.eq('Test toolbar_mode default value', getToolbarMode(editor), '')),
      Editor.cRemove,

      Editor.cFromSettings({
        base_url: '/project/tinymce/js/tinymce',
        toolbar_drawer: 'sliding',
      }),
      Chain.op((editor) => Assert.eq('toolbar_mode should fall back to toolbar_drawer when unset', getToolbarMode(editor), 'sliding')),
      Editor.cRemove,

      Editor.cFromSettings({
        base_url: '/project/tinymce/js/tinymce',
        toolbar_drawer: 'sliding',
        toolbar_mode: 'floating'
      }),
      Chain.op((editor) => Assert.eq('toolbar_mode should should take precedence over toolbar_drawer when set', getToolbarMode(editor), 'floating')),
      Editor.cRemove,
    ]),
  ], success, failure);
});
