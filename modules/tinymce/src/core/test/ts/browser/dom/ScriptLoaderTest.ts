import { after, afterEach, before, describe, it } from '@ephox/bedrock-client';
import { Arr, Global } from '@ephox/katamari';
import { assert } from 'chai';

import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';

describe('browser.tinymce.core.dom.ScriptLoaderTest', () => {
  const testScript = '/project/tinymce/src/core/test/assets/js/test.js';
  const nestedScript = '/project/tinymce/src/core/test/assets/js/nested.js';
  const invalidScript = '/project/tinymce/src/core/test/assets/js/invalid.js';
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

  const pLoadScript = (url: string): Promise<void> => {
    return ScriptLoader.ScriptLoader.loadScript(url).then(() => {
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
});
