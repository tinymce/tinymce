import { GeneralSteps, Pipeline, UiFinder, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { console, document } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.DialogSectionsTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  const getStr = (sections: TestSection[]) => {
    const r = { };
    Arr.each(sections, (section) => {
      r[section.setting.key] = section.setting.value.getOr('{ default }');
    });
    return JSON.stringify(r, null, 2);
  };

  interface TestSection {
    setting: { key: string, value: Option<any> };
    selector: string;
    exists: boolean;
  }

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    // NOTE: This will open the dialog once. It is expected that you specify all the settings that you want
    // in the sections array. Then once it has opened the dialog, it will check whether each section is
    // there or not
    const sCheckSections = (sections: TestSection[]) => {
      return Log.stepsAsStep('TBA', 'Link: Settings: ' + getStr(sections), [
        GeneralSteps.sequence(
          Arr.map(sections, ({ setting }) => setting.value.map((v) => tinyApis.sSetSetting(setting.key, v)).getOrThunk(() => {
            return tinyApis.sDeleteSetting(setting.key);
          }))
        ),
        TestLinkUi.sOpenLinkDialog,
        GeneralSteps.sequence(
          Arr.map(
            sections,
            ({ selector, exists }) => {
              console.log('selector', selector, 'exists', exists);
              const sExistence = exists ? UiFinder.sExists : UiFinder.sNotExists;
              return sExistence(TinyDom.fromDom(document.body), selector);
            }
          )
        ),
        TestLinkUi.sClickOnDialog('click on cancel', 'button:contains("Cancel")')
      ]);
    };

    const sCheckTargetSection = (exists: boolean, value: Option<boolean>) => Log.step('TBA', 'Link: sCheckTargetSection',
      sCheckSections([
        {
          setting: { key: 'target_list', value },
          selector: 'label:contains("Open link in...")',
          exists
        }
      ])
    );

    const sCheckTitleSection = (exists: boolean, value: Option<boolean>) => Log.step('TBA', 'Link: sCheckTitleSection',
      sCheckSections([
        {
          setting: { key: 'link_title', value },
          selector: 'label:contains("Title")',
          exists
        }
      ])
    );

    const sCheckRelSection = (exists: boolean, value: Option<Array<{ value: string, title: string }>>) => Log.step('TBA', 'Link: sCheckRelSection',
      sCheckSections([
        {
          setting: { key: 'rel_list', value },
          selector: 'label:contains("Rel")',
          exists
        }
      ])
    );

    const sCheckClassSection = (exists: boolean, value: Option<Array<{ value: string, title: string }>>) => Log.step('TBA', 'Link: sCheckClassSection',
      sCheckSections([
        {
          setting: { key: 'link_class_list', value },
          selector: 'label:contains("Class")',
          exists
        }
      ])
    );

    const sCheckLinkListSection = (exists: boolean, value: Option<Array<{ value: string, title: string }>>) => Log.step('TBA', 'Link: sCheckLinkListSection',
      sCheckSections([
        {
          setting: { key: 'link_list', value },
          selector: 'label:contains("Link list")',
          exists
        }
      ])
    );

    // NOTE: Always end with none to remove the setting from future tests
    Pipeline.async({}, [
      TestLinkUi.sClearHistory,
      sCheckTargetSection(false, Option.some(false)),
      sCheckTargetSection(true, Option.some(true)),
      sCheckTargetSection(true, Option.none()),

      sCheckRelSection(true, Option.some([
        { title: 'a', value: 'b' },
        { title: 'c', value: 'd' }
      ])),
      sCheckRelSection(false, Option.none()),

      sCheckTitleSection(false, Option.some(false)),
      sCheckTitleSection(true, Option.none()),

      sCheckClassSection(true, Option.some([
        { title: 'a', value: 'b' },
        { title: 'c', value: 'd' }
      ])),
      sCheckClassSection(false, Option.none()),

      sCheckLinkListSection(true, Option.some([
        { title: 'a', value: 'b' },
        { title: 'c', value: 'd' }
      ])),
      sCheckLinkListSection(false, Option.none()),
      TestLinkUi.sClearHistory
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
