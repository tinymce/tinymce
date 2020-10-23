import { GeneralSteps, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';
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
    setting: { key: string; value: Optional<any> };
    selector: string;
    exists: boolean;
  }

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    // NOTE: This will open the dialog once. It is expected that you specify all the settings that you want
    // in the sections array. Then once it has opened the dialog, it will check whether each section is
    // there or not
    const sCheckSections = (sections: TestSection[]) => Log.stepsAsStep('TBA', 'Link: Settings: ' + getStr(sections), [
      GeneralSteps.sequence(
        Arr.map(sections, ({ setting }) => setting.value.map((v) => tinyApis.sSetSetting(setting.key, v)).getOrThunk(() => tinyApis.sDeleteSetting(setting.key)))
      ),
      TestLinkUi.sOpenLinkDialog(tinyUi),
      GeneralSteps.sequence(
        Arr.map(
          sections,
          ({ selector, exists }) => {
            // eslint-disable-next-line no-console
            console.log('selector', selector, 'exists', exists);
            const sExistence = exists ? UiFinder.sExists : UiFinder.sNotExists;
            return sExistence(TinyDom.fromDom(document.body), selector);
          }
        )
      ),
      TestLinkUi.sClickOnDialog('click on cancel', 'button:contains("Cancel")')
    ]);

    const sCheckTargetSection = (exists: boolean, value: Optional<boolean>) => Log.step('TBA', 'Link: sCheckTargetSection',
      sCheckSections([
        {
          setting: { key: 'target_list', value },
          selector: 'label:contains("Open link in...")',
          exists
        }
      ])
    );

    const sCheckTitleSection = (exists: boolean, value: Optional<boolean>) => Log.step('TBA', 'Link: sCheckTitleSection',
      sCheckSections([
        {
          setting: { key: 'link_title', value },
          selector: 'label:contains("Title")',
          exists
        }
      ])
    );

    const sCheckRelSection = (exists: boolean, value: Optional<Array<{ value: string; title: string }>>) => Log.step('TBA', 'Link: sCheckRelSection',
      sCheckSections([
        {
          setting: { key: 'rel_list', value },
          selector: 'label:contains("Rel")',
          exists
        }
      ])
    );

    const sCheckClassSection = (exists: boolean, value: Optional<Array<{ value: string; title: string }>>) => Log.step('TBA', 'Link: sCheckClassSection',
      sCheckSections([
        {
          setting: { key: 'link_class_list', value },
          selector: 'label:contains("Class")',
          exists
        }
      ])
    );

    const sCheckLinkListSection = (exists: boolean, value: Optional<Array<{ value: string; title: string }>>) => Log.step('TBA', 'Link: sCheckLinkListSection',
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
      sCheckTargetSection(false, Optional.some(false)),
      sCheckTargetSection(true, Optional.some(true)),
      sCheckTargetSection(true, Optional.none()),

      sCheckRelSection(true, Optional.some([
        { title: 'a', value: 'b' },
        { title: 'c', value: 'd' }
      ])),
      sCheckRelSection(false, Optional.none()),

      sCheckTitleSection(false, Optional.some(false)),
      sCheckTitleSection(true, Optional.none()),

      sCheckClassSection(true, Optional.some([
        { title: 'a', value: 'b' },
        { title: 'c', value: 'd' }
      ])),
      sCheckClassSection(false, Optional.none()),

      sCheckLinkListSection(true, Optional.some([
        { title: 'a', value: 'b' },
        { title: 'c', value: 'd' }
      ])),
      sCheckLinkListSection(false, Optional.none()),
      TestLinkUi.sClearHistory
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
