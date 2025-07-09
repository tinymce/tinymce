import { after, afterEach, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Attribute, SugarElement, SugarNode } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import * as OptionTypes from 'tinymce/core/api/OptionTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.core.dom.CrossOriginScriptTest', () => {
  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    menubar: false,
    toolbar: false
  };
  const scriptUrl = '/project/tinymce/src/core/test/assets/js/test.js';

  after(() => {
    ScriptLoader.ScriptLoader._setCrossOrigin(Fun.constant(''));
  });

  const isScript = SugarNode.isTag('script');

  const pLoadScript = async (url: string, timeout: number = 1000) => {
    let resolve: (script: SugarElement<HTMLScriptElement>) => void;
    let reject: (reason: Error) => void;
    const time = Date.now();
    const observePromise = new Promise<SugarElement<HTMLScriptElement>>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        Arr.each(mutation.addedNodes, (node) => {
          const sugarNode = SugarElement.fromDom(node);
          if (isScript(sugarNode) && Attribute.get(sugarNode, 'src') === url) {
            clearTimeout(timer);
            observer.disconnect();
            resolve(sugarNode);
          }
        });
      });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timed out waiting for script to appear in the dom after ${Date.now() - time}ms`));
    }, timeout);

    await ScriptLoader.ScriptLoader.loadScript(url);

    return observePromise;
  };

  const assertCrossOriginAttribute = (script: SugarElement<HTMLScriptElement>, expectedCrossOrigin: string | undefined) => {
    if (expectedCrossOrigin === undefined) {
      assert.isFalse(Attribute.has(script, 'crossorigin'), 'Crossorigin attribute should not be set');
    } else {
      assert.equal(Attribute.get(script, 'crossorigin'), expectedCrossOrigin, `Crossorigin attribute should be set to "${expectedCrossOrigin}"`);
    }
  };

  afterEach(() => {
    ScriptLoader.ScriptLoader._setCrossOrigin(Fun.constant(undefined));
    EditorManager.overrideDefaults({ crossorigin: undefined });
  });

  context('Using global setter', () => {
    const pTestCrossOriginSetter = async (crossOrigin: string | undefined) => {
      let crossOriginUrl: string | undefined;

      ScriptLoader.ScriptLoader._setCrossOrigin((url) => {
        crossOriginUrl = url;
        return crossOrigin;
      });

      assertCrossOriginAttribute(await pLoadScript(scriptUrl), crossOrigin);
      assert.equal(crossOriginUrl, scriptUrl, 'Cross origin url should be set');
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

      assertCrossOriginAttribute(await pLoadScript(scriptUrl), crossOrigin);
      assert.equal(crossOriginUrl, scriptUrl, 'Cross origin url should be set');

      McEditor.remove(editor);
    };

    it('TINY-12228: Should support anonymous in crossorigin option', () => pTestCrossOriginEditorOption('anonymous'));
    it('TINY-12228: Should support use-credentials crossorigin option', () => pTestCrossOriginEditorOption('use-credentials'));
    it('TINY-12228: Should support setting empty crossorigin option', () => pTestCrossOriginEditorOption(undefined));
    it('TINY-12228: Not setting a value removes the crossorigin global state', async () => {
      ScriptLoader.ScriptLoader._setCrossOrigin(Fun.constant('anonymous'));

      const editor = await McEditor.pFromSettings<Editor>(settings);
      assertCrossOriginAttribute(await pLoadScript(scriptUrl), undefined);

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

      assertCrossOriginAttribute(await pLoadScript(scriptUrl), expectedCrossOrigin);
      assert.equal(crossOriginUrl, scriptUrl, 'Cross origin url should be set');
      assert.equal(crossOriginResourceType, 'script', 'Cross origin resource type should be script');

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
      assertCrossOriginAttribute(await pLoadScript(scriptUrl), 'anonymous');

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

      assertCrossOriginAttribute(await pLoadScript(scriptUrl), crossOrigin);

      McEditor.remove(editor);
    };

    it('TINY-12228: Should support anonymous in crossorigin option', () => pTestCrossOriginAddEventPatch('anonymous'));
    it('TINY-12228: Should support use-credentials crossorigin option', () => pTestCrossOriginAddEventPatch('use-credentials'));
    it('TINY-12228: Should support setting empty crossorigin option', () => pTestCrossOriginAddEventPatch(undefined));
  });
});
