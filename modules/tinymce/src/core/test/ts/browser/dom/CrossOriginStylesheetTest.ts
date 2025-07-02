import { UiFinder } from '@ephox/agar';
import { after, afterEach, before, context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Attribute, SugarElement, SugarHead } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import StyleSheetLoader from 'tinymce/core/api/dom/StyleSheetLoader';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import * as OptionTypes from 'tinymce/core/api/OptionTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.core.dom.CrossOriginStylesheetTest', () => {
  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    menubar: false,
    toolbar: false
  };
  const cssUrl = '/project/tinymce/js/tinymce/skins/content/default/content.css';

  after(() => {
    DOMUtils.DOM.styleSheetLoader._setCrossOrigin(Fun.constant(undefined));
  });

  const pLoadStylesheet = async (url: string) => {
    await DOMUtils.DOM.styleSheetLoader.load(url);
    return UiFinder.findIn<HTMLLinkElement>(SugarHead.head(), `link[href="${url}"]`).getOrDie();
  };

  const assertCrossOriginAttribute = (link: SugarElement<HTMLLinkElement>, expectedCrossOrigin: string | undefined) => {
    if (expectedCrossOrigin === undefined) {
      assert.isFalse(Attribute.has(link, 'crossorigin'), 'Crossorigin attribute should not be set');
    } else {
      assert.equal(Attribute.get(link, 'crossorigin'), expectedCrossOrigin, `Crossorigin attribute should be set to "${expectedCrossOrigin}"`);
    }
  };

  afterEach(() => {
    DOMUtils.DOM.styleSheetLoader._setCrossOrigin(Fun.constant(undefined));
    EditorManager.overrideDefaults({ crossorigin: undefined });
    DOMUtils.DOM.styleSheetLoader.unload(cssUrl);
  });

  context('Using global setter', () => {
    const pTestCrossOriginSetter = async (crossOrigin: string | undefined) => {
      let crossOriginUrl: string | undefined;

      DOMUtils.DOM.styleSheetLoader._setCrossOrigin((url) => {
        crossOriginUrl = url;
        return crossOrigin;
      });

      assertCrossOriginAttribute(await pLoadStylesheet(cssUrl), crossOrigin);
      assert.equal(crossOriginUrl, cssUrl, 'Cross origin url should be set');
    };

    it('TINY-12228: Should support setting anonymous crossorigin', () => pTestCrossOriginSetter('anonymous'));
    it('TINY-12228: Should support setting use-credentials crossorigin', () => pTestCrossOriginSetter('use-credentials'));
    it('TINY-12228: Should support setting empty crossorigin', () => pTestCrossOriginSetter(undefined));
  });

  context('Using editor option', () => {
    const pTestCrossOriginEditorOption = async (crossOrigin: string | undefined) => {
      let crossOriginUrl: string | undefined;
      const editor = await McEditor.pFromSettings<Editor>({
        ...settings,
        crossorigin: (url: string) => {
          crossOriginUrl = url;
          return crossOrigin;
        }
      });

      assertCrossOriginAttribute(await pLoadStylesheet(cssUrl), crossOrigin);
      assert.equal(crossOriginUrl, cssUrl, 'Cross origin url should be set');

      McEditor.remove(editor);
    };

    it('TINY-12228: Should support anonymous in crossorigin option', () => pTestCrossOriginEditorOption('anonymous'));
    it('TINY-12228: Should support use-credentials crossorigin option', () => pTestCrossOriginEditorOption('use-credentials'));
    it('TINY-12228: Should support setting empty crossorigin option', () => pTestCrossOriginEditorOption(undefined));
    it('TINY-12228: Not setting a value removes the crossorigin global state', async () => {
      DOMUtils.DOM.styleSheetLoader._setCrossOrigin(Fun.constant('anonymous'));

      const editor = await McEditor.pFromSettings<Editor>(settings);
      assertCrossOriginAttribute(await pLoadStylesheet(cssUrl), undefined);

      McEditor.remove(editor);
    });
  });

  context('Using overrideDefaults', () => {
    const pTestCrossOriginEditorOption = async (crossOrigin: OptionTypes.CrossOrigin, expectedCrossOrigin: string | undefined) => {
      let crossOriginUrl: string | undefined;
      let crossOriginResourceType: string | undefined;

      EditorManager.overrideDefaults({
        crossorigin: (url, resourceType) => {
          crossOriginUrl = url;
          crossOriginResourceType = resourceType;

          return crossOrigin(url, resourceType);
        }
      });

      const editor = await McEditor.pFromSettings<Editor>(settings);

      assertCrossOriginAttribute(await pLoadStylesheet(cssUrl), expectedCrossOrigin);
      assert.equal(crossOriginUrl, cssUrl, 'Cross origin url should be set');
      assert.equal(crossOriginResourceType, 'stylesheet', 'Cross origin resource type should be stylesheet');

      McEditor.remove(editor);
    };

    it('TINY-12228: Should support anonymous in crossorigin option', () => pTestCrossOriginEditorOption(Fun.constant('anonymous'), 'anonymous'));
    it('TINY-12228: Should support use-credentials crossorigin option', () => pTestCrossOriginEditorOption(Fun.constant('use-credentials'), 'use-credentials'));
    it('TINY-12228: Should support setting empty crossorigin option', () => pTestCrossOriginEditorOption(Fun.constant(undefined), undefined));
    it('TINY-12228: Not setting a value does not override defaults value for crossorigin', async () => {
      EditorManager.overrideDefaults({
        crossorigin: Fun.constant('anonymous')
      });

      const editor = await McEditor.pFromSettings<Editor>(settings);
      assertCrossOriginAttribute(await pLoadStylesheet(cssUrl), 'anonymous');

      McEditor.remove(editor);
    });
  });

  context('Using AddEditor event patch', () => {
    let patchedCrossOrigin: 'anonymous' | 'use-credentials' | undefined;

    const patchCrossOrigin = (e: EditorEvent<{ editor: Editor }>) => {
      e.editor.options.set('crossorigin', () => {
        return patchedCrossOrigin;
      });
    };

    before(() => {
      EditorManager.on('AddEditor', patchCrossOrigin);
    });

    after(() => {
      EditorManager.off('AddEditor', patchCrossOrigin);
    });

    const pTestCrossOriginAddEventPatch = async (crossOrigin: 'anonymous' | 'use-credentials' | undefined) => {
      patchedCrossOrigin = crossOrigin;

      const editor = await McEditor.pFromSettings<Editor>(settings);

      assertCrossOriginAttribute(await pLoadStylesheet(cssUrl), crossOrigin);

      McEditor.remove(editor);
    };

    it('TINY-12228: Should support anonymous in crossorigin option', () => pTestCrossOriginAddEventPatch('anonymous'));
    it('TINY-12228: Should support use-credentials crossorigin option', () => pTestCrossOriginAddEventPatch('use-credentials'));
    it('TINY-12228: Should support setting empty crossorigin option', () => pTestCrossOriginAddEventPatch(undefined));
  });

  context('Cross origin with contentCssCors set to true', () => {
    let loader: StyleSheetLoader;

    before(() => {
      loader = StyleSheetLoader(document, {
        maxLoadTime: 500,
        contentCssCors: true
      });
    });

    afterEach(() => {
      loader.unload(cssUrl);
    });

    const pTestCrossOriginAttribute = async (crossOrigin: string | undefined) => {
      let crossOriginCalled = false;

      loader._setCrossOrigin(() => {
        crossOriginCalled = true;

        return crossOrigin;
      });

      await loader.load(cssUrl);

      assert.isFalse(crossOriginCalled, 'Cross origin handler should not have been called when contentCssCors is true');
      UiFinder.exists(SugarHead.head(), `link[href="${cssUrl}"][crossorigin="anonymous"]`); // Should always be anonymous when contentCssCors is true
    };

    it('TINY-12326: Load stylesheet with crossorigin anonymous', () => pTestCrossOriginAttribute('anonymous'));
    it('TINY-12326: Load stylesheet with crossorigin use-credentials', () => pTestCrossOriginAttribute('use-credentials'));
    it('TINY-12326: Load stylesheet with crossorigin empty string', () => pTestCrossOriginAttribute(undefined));
  });
});
