import { UiFinder } from '@ephox/agar';
import { describe, it, before, after, context } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

interface TestSection {
  readonly setting: { key: string; value: Optional<any> };
  readonly selector: string;
  readonly exists: boolean;
}

describe('browser.tinymce.plugins.link.DialogSectionsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  before(() => {
    TestLinkUi.clearHistory();
  });

  after(() => {
    TestLinkUi.clearHistory();
  });

  const getStr = (sections: TestSection[]) => {
    const r = {};
    Arr.each(sections, (section) => {
      r[section.setting.key] = section.setting.value.getOr('{ default }');
    });
    return JSON.stringify(r, null, 2);
  };

  // NOTE: This will open the dialog once. It is expected that you specify all the settings that you want
  // in the sections array. Then once it has opened the dialog, it will check whether each section is
  // there or not
  const checkSections = (sections: TestSection[]) => {
    it('Settings: ' + getStr(sections), async () => {
      const editor = hook.editor();

      Arr.each(sections, ({ setting }) => {
        setting.value.fold(
          () => {
            delete editor.settings[setting.key];
          },
          (v) => {
            editor.settings[setting.key] = v;
          }
        );
      });

      await TestLinkUi.pOpenLinkDialog(editor);

      Arr.each(
        sections,
        ({ selector, exists }) => {
          // eslint-disable-next-line no-console
          console.log('selector', selector, 'exists', exists);
          const existence = exists ? UiFinder.exists : UiFinder.notExists;
          existence(SugarBody.body(), selector);
        }
      );

      await TestLinkUi.pClickCancel(editor);
    });
  };

  const checkTargetSection = (exists: boolean, value: Optional<boolean>) => {
    checkSections([
      {
        setting: { key: 'target_list', value },
        selector: 'label:contains("Open link in...")',
        exists
      }
    ]);
  };

  const checkTitleSection = (exists: boolean, value: Optional<boolean>) => {
    checkSections([
      {
        setting: { key: 'link_title', value },
        selector: 'label:contains("Title")',
        exists
      }
    ]);
  };

  const checkRelSection = (exists: boolean, value: Optional<Array<{ value: string; title: string }>>) => {
    checkSections([
      {
        setting: { key: 'rel_list', value },
        selector: 'label:contains("Rel")',
        exists
      }
    ]);
  };

  const checkClassSection = (exists: boolean, value: Optional<Array<{ value: string; title: string }>>) => {
    checkSections([
      {
        setting: { key: 'link_class_list', value },
        selector: 'label:contains("Class")',
        exists
      }
    ]);
  };

  const checkLinkListSection = (exists: boolean, value: Optional<Array<{ value: string; title: string }>>) => {
    checkSections([
      {
        setting: { key: 'link_list', value },
        selector: 'label:contains("Link list")',
        exists
      }
    ]);
  };

  context('Check Target section', () => {
    checkTargetSection(false, Optional.some(false));
    checkTargetSection(true, Optional.some(true));
    checkTargetSection(true, Optional.none());
  });

  context('Check rel section', () => {
    checkRelSection(true, Optional.some([
      { title: 'a', value: 'b' },
      { title: 'c', value: 'd' }
    ]));
    checkRelSection(false, Optional.none());
  });

  context('Check Title section', () => {
    checkTitleSection(false, Optional.some(false));
    checkTitleSection(true, Optional.none());
  });

  context('Check class section', () => {
    checkClassSection(true, Optional.some([
      { title: 'a', value: 'b' },
      { title: 'c', value: 'd' }
    ]));
    checkClassSection(false, Optional.none());
  });

  context('Check LinkList section', () => {
    checkLinkListSection(true, Optional.some([
      { title: 'a', value: 'b' },
      { title: 'c', value: 'd' }
    ]));
    checkLinkListSection(false, Optional.none());
  });
});
