import { Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';

UnitTest.asynctest('browser.tinymce.core.dom.ScriptLoaderTest', (success, failure) => {
  const testScript = '/project/tinymce/src/core/test/assets/js/test.js';
  let loadedScripts: string[] = [];
  let loadedCount = 0;

  const sLoadScript = (url: string) => Step.async((next, die) => {
    loadedScripts.push(url);
    ScriptLoader.ScriptLoader.loadScript(url, () => {
      loadedCount++;
      next();
    }, () => die('Failed to load script'));
  });

  const sLoadScripts = (urls: string[]) => Step.async((next, die) => {
    loadedScripts.push(...urls);
    const scriptCount = urls.length;
    ScriptLoader.ScriptLoader.loadScripts(urls, () => {
      loadedCount += scriptCount;
      next();
    }, () => die('Failed to load scripts'));
  });

  const sAddToQueue = (url: string) => Step.sync(() => {
    loadedScripts.push(url);
    ScriptLoader.ScriptLoader.add(url, () => loadedCount++);
  });

  const sLoadQueue = Step.async((next, die) => {
    ScriptLoader.ScriptLoader.loadQueue(next, undefined, () => die('Failed to load queued scripts'));
  });

  const sAssertQueueLoadedCount = (count: number) => Step.sync(() => {
    Assert.eq('Loaded script count', count, loadedCount);
  });

  const sReset = () => Step.sync(() => {
    Arr.each(loadedScripts, (url) => ScriptLoader.ScriptLoader.remove(url));
    loadedCount = 0;
    loadedScripts = [];
  });

  Pipeline.async({}, [
    Log.stepsAsStep('TBA', 'Load a single script', [
      sLoadScript(testScript),
      sAssertQueueLoadedCount(1),
      sReset()
    ]),
    Log.stepsAsStep('TBA', 'Load scripts', [
      sLoadScripts([ testScript ]),
      sAssertQueueLoadedCount(1),
      sReset()
    ]),
    Log.stepsAsStep('TBA', 'Load scripts via a queue', [
      sAddToQueue(testScript),
      sAssertQueueLoadedCount(0),
      sLoadQueue,
      sAssertQueueLoadedCount(1),
      sReset()
    ]),
    Log.stepsAsStep('TINY-6570', 'Load a script multiple times via a queue', [
      sAddToQueue(testScript),
      sLoadQueue,
      sAssertQueueLoadedCount(1),
      sAddToQueue(testScript),
      sLoadQueue,
      sAssertQueueLoadedCount(2),
      sReset()
    ])
  ], success, failure);
});
