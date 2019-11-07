import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.DefaultLinkTargetTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      TestLinkUi.sClearHistory,
      Log.stepsAsStep('TBA', 'Link: does not add target if no default is set', [
        TestLinkUi.sInsertLink('http://www.google.com'),
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a[target="_blank"]': 0, 'a': 1 }),
        tinyApis.sSetContent('')
      ]),
      Log.stepsAsStep('TBA', 'Link: adds target if default is set', [
        tinyApis.sSetSetting('default_link_target', '_blank'),
        TestLinkUi.sInsertLink('http://www.google.com'),
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a[target="_blank"]': 1, 'a': 1 }),
        tinyApis.sSetContent('')
      ]),
      Log.stepsAsStep('TBA', 'Link: adds target if default is set and target_list is enabled', [
        tinyApis.sSetSetting('default_link_target', '_blank'),
        tinyApis.sSetSetting('target_list', [
          {title: 'None', value: ''},
          {title: 'New', value: '_blank'}
        ]),
        TestLinkUi.sInsertLink('http://www.google.com'),
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a[target="_blank"]': 1, 'a': 1 }),
        tinyApis.sSetContent('')
      ]),
      Log.stepsAsStep('TBA', 'Link: adds target if default is set and target_list is disabled', [
        tinyApis.sSetSetting('default_link_target', '_blank'),
        tinyApis.sSetSetting('target_list', false),
        TestLinkUi.sInsertLink('http://www.google.com'),
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a[target="_blank"]': 1, 'a': 1 }),
        tinyApis.sSetContent(''),
        tinyApis.sDeleteSetting('target_list')
      ]),
      Log.stepsAsStep('TBA', 'Link: changing to current window doesn\'t apply the default', [
        tinyApis.sSetSetting('default_link_target', '_blank'),
        TestLinkUi.sInsertLink('http://www.google.com'),
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a[target="_blank"]': 1, 'a': 1 }),
        TestLinkUi.sOpenLinkDialog,
        TestLinkUi.sSetHtmlSelectValue('Open link in...', 'Current Window'),
        TestLinkUi.sClickSave,
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a:not([target="_blank"])': 1, 'a': 1 }),
        tinyApis.sSetContent('')
      ]),
      Log.stepsAsStep('TBA', 'Link: default isn\'t applied to an existing link', [
        tinyApis.sSetSetting('default_link_target', '_blank'),
        tinyApis.sSetContent('<a href="http://www.google.com">https://www.google.com/</a>'),
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a:not([target="_blank"])': 1, 'a': 1 }),
        TestLinkUi.sOpenLinkDialog,
        TestLinkUi.sClickSave,
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a:not([target="_blank"])': 1, 'a': 1 }),
        tinyApis.sSetContent('')
      ]),
      TestLinkUi.sClearHistory
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
