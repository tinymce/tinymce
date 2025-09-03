import { after, afterEach, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Global } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';
import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.dom.ScriptLoaderTest', () => {
  const testScript = '/project/tinymce/src/core/test/assets/js/test.js';
  const nestedScript = '/project/tinymce/src/core/test/assets/js/nested.js';
  const invalidScript = '/project/tinymce/src/core/test/assets/js/invalid.js';
  const fakelibScript = '/project/tinymce/src/core/test/assets/js/fakelib.js';
  let loadedCount = 0;

  before(() => {
    Global.tinymce_ = { ScriptLoader: ScriptLoader.ScriptLoader };
  });

  after(() => {
    delete Global.tinymce_;
  });

  afterEach(() => {
    Arr.each([ testScript, nestedScript, invalidScript ], (url) => ScriptLoader.ScriptLoader.remove(url));
    loadedCount = 0;
  });

  const pLoadScript = (url: string, editorDoc?: Document): Promise<void> => {
    return ScriptLoader.ScriptLoader.loadScript(url, editorDoc).then(() => {
      loadedCount++;
    });
  };

  const pLoadScripts = (urls: string[]): Promise<void> => {
    const scriptCount = urls.length;
    return ScriptLoader.ScriptLoader.loadScripts(urls).then(() => {
      loadedCount += scriptCount;
    });
  };

  const addToQueue = (url: string): void => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ScriptLoader.ScriptLoader.add(url).then(() => loadedCount++);
  };

  const pLoadQueue = (): Promise<void> =>
    ScriptLoader.ScriptLoader.loadQueue();

  const assertQueueLoadedCount = (count: number) => {
    assert.equal(loadedCount, count, 'Loaded script count');
  };

  it('TBA: Load a single script', async () => {
    await pLoadScript(testScript);
    assertQueueLoadedCount(1);
  });

  it('TBA: Load scripts', async () => {
    await pLoadScripts([ testScript ]);
    assertQueueLoadedCount(1);
  });

  it('TBA: Load invalid scripts', async () => {
    try {
      await pLoadScripts([ invalidScript ]);
    } catch (failedUrls) {
      assert.deepEqual(failedUrls, [ invalidScript ]);
    }
    assertQueueLoadedCount(0);
  });

  it('TBA: Load scripts via a queue', async () => {
    addToQueue(testScript);
    assertQueueLoadedCount(0);
    await pLoadQueue();
    assertQueueLoadedCount(1);
  });

  it('TINY-6570: Load a script multiple times via a queue', async () => {
    addToQueue(testScript);
    await pLoadQueue();
    assertQueueLoadedCount(1);
    addToQueue(testScript);
    await pLoadQueue();
    assertQueueLoadedCount(2);
  });

  it('TINY-8325: Resolves load queue calls in order', async () => {
    const loadOrder: string[] = [];

    // Start loading but don't wait for it to finish
    addToQueue(testScript);
    const loadQueuePromises = [
      pLoadQueue().then(() => loadOrder.push('first')),
    ];

    // Trigger another load for the same resources
    addToQueue(testScript);
    loadQueuePromises.push(
      pLoadQueue().then(() => loadOrder.push('second'))
    );

    // Verify that the second queue load waited for the first
    await Promise.all(loadQueuePromises);
    assertQueueLoadedCount(2);
    assert.deepEqual(loadOrder, [ 'first', 'second' ]);
  });

  it('TINY-8480: Loads additional scripts added to the queue while loading', async () => {
    addToQueue(nestedScript);
    await pLoadQueue();
    assertQueueLoadedCount(1);
    assert.isTrue(ScriptLoader.ScriptLoader.isDone(testScript), 'test.js should have been loaded');
    assert.isTrue(ScriptLoader.ScriptLoader.isDone(nestedScript), 'nested.js should have been loaded');
  });

  context('TINY-12817: load with a different document', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce'
    }, []);

    it('TINY-12817: Loading a script specifying the document should load the script in that document', async () => {
      const editor = hook.editor();
      await pLoadScript(fakelibScript);
      assert.isDefined((document as any).testFun, 'test fun should be loaded on the main document');
      assert.isUndefined((editor.getDoc() as any).testFun, 'test fun should not be loaded on the editor document');
      await pLoadScript(fakelibScript, editor.getDoc());
      assert.isDefined((editor.getDoc() as any).testFun, 'test fun should be loaded on the editor document');
    });
  });
});
