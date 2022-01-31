import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { assert } from 'chai';

import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';

describe('browser.tinymce.core.dom.ScriptLoaderTest', () => {
  const testScript = '/project/tinymce/src/core/test/assets/js/test.js';
  let loadedScripts: string[] = [];
  let loadedCount = 0;

  const pLoadScript = (url: string): Promise<void> => {
    loadedScripts.push(url);
    return ScriptLoader.ScriptLoader.loadScript(url).then(() => {
      loadedCount++;
    });
  };

  const pLoadScripts = (urls: string[]): Promise<void> => {
    loadedScripts.push(...urls);
    const scriptCount = urls.length;
    return ScriptLoader.ScriptLoader.loadScripts(urls).then(() => {
      loadedCount += scriptCount;
    });
  };

  const addToQueue = (url: string): void => {
    loadedScripts.push(url);
    ScriptLoader.ScriptLoader.add(url).then(() => loadedCount++);
  };

  const pLoadQueue = (): Promise<void> =>
    ScriptLoader.ScriptLoader.loadQueue();

  const assertQueueLoadedCount = (count: number) => {
    assert.equal(loadedCount, count, 'Loaded script count');
  };

  afterEach(() => {
    Arr.each(loadedScripts, (url) => ScriptLoader.ScriptLoader.remove(url));
    loadedCount = 0;
    loadedScripts = [];
  });

  it('TBA: Load a single script', async () => {
    await pLoadScript(testScript);
    assertQueueLoadedCount(1);
  });

  it('TBA: Load scripts', async () => {
    await pLoadScripts([ testScript ]);
    assertQueueLoadedCount(1);
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
});
