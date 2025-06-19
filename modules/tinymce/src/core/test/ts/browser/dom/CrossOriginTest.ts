import { after, afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute, SugarElement, SugarNode } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import * as OptionTypes from 'tinymce/core/api/OptionTypes';

describe('browser.tinymce.core.dom.CrossOriginTest', () => {
  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    menubar: false,
    toolbar: false
  };
  const scriptUrl = '/project/tinymce/src/core/test/assets/js/test.js';

  after(() => {
    ScriptLoader.ScriptLoader._setCrossOrigin('');
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

  const assertCrossOriginAttribute = (script: SugarElement<HTMLScriptElement>, crossOrigin: string) => {
    if (crossOrigin === '') {
      assert.isFalse(Attribute.has(script, 'crossorigin'), 'Crossorigin attribute should not be set');
    } else {
      assert.equal(Attribute.get(script, 'crossorigin'), crossOrigin, `Crossorigin attribute should be set to "${crossOrigin}"`);
    }
  };

  afterEach(() => {
    ScriptLoader.ScriptLoader._setCrossOrigin('');
    EditorManager.overrideDefaults({ crossorigin: undefined });
  });

  context('Using global setter', () => {
    const pTestCrossOriginSetter = async (crossOrigin: OptionTypes.CrossOrigin) => {
      ScriptLoader.ScriptLoader._setCrossOrigin(crossOrigin);
      assertCrossOriginAttribute(await pLoadScript(scriptUrl), crossOrigin);
    };

    it('TINY-12228: Should support setting anonymous crossorigin', () => pTestCrossOriginSetter('anonymous'));
    it('TINY-12228: Should support setting use-credentials crossorigin', () => pTestCrossOriginSetter('use-credentials'));
    it('TINY-12228: Should support setting empty crossorigin', () => pTestCrossOriginSetter(''));
  });

  context('Using editor option', () => {
    const pTestCrossOriginEditorOption = async (crossOrigin: string) => {
      const editor = await McEditor.pFromSettings<Editor>({ ...settings, crossorigin: crossOrigin });

      assertCrossOriginAttribute(await pLoadScript(scriptUrl), crossOrigin);

      McEditor.remove(editor);
    };

    it('TINY-12228: Should support anonymous in crossorigin option', () => pTestCrossOriginEditorOption('anonymous'));
    it('TINY-12228: Should support use-credentials crossorigin option', () => pTestCrossOriginEditorOption('use-credentials'));
    it('TINY-12228: Should support setting empty crossorigin option', () => pTestCrossOriginEditorOption(''));
    it('TINY-12228: Not setting a value removes the crossorigin global state', async () => {
      ScriptLoader.ScriptLoader._setCrossOrigin('anonymous');

      const editor = await McEditor.pFromSettings<Editor>(settings);
      assertCrossOriginAttribute(await pLoadScript(scriptUrl), '');

      McEditor.remove(editor);
    });
  });

  context('Using overrideDefaults', () => {
    const pTestCrossOriginEditorOption = async (crossOrigin: OptionTypes.CrossOrigin) => {
      EditorManager.overrideDefaults({
        crossorigin: crossOrigin
      });

      const editor = await McEditor.pFromSettings<Editor>(settings);

      assertCrossOriginAttribute(await pLoadScript(scriptUrl), crossOrigin);

      McEditor.remove(editor);
    };

    it('TINY-12228: Should support anonymous in crossorigin option', () => pTestCrossOriginEditorOption('anonymous'));
    it('TINY-12228: Should support use-credentials crossorigin option', () => pTestCrossOriginEditorOption('use-credentials'));
    it('TINY-12228: Should support setting empty crossorigin option', () => pTestCrossOriginEditorOption(''));
    it('TINY-12228: Not setting a value does not override defaults value for crossorigin', async () => {
      EditorManager.overrideDefaults({
        crossorigin: 'anonymous'
      });

      const editor = await McEditor.pFromSettings<Editor>(settings);
      assertCrossOriginAttribute(await pLoadScript(scriptUrl), 'anonymous');

      McEditor.remove(editor);
    });
  });
});
