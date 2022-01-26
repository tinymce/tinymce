import { after, before, describe, it } from '@ephox/bedrock-client';
import { Global } from '@ephox/katamari';
import { assert } from 'chai';

import Resource from 'tinymce/core/api/Resource';

declare const tinymce: { Resource: Resource };

describe('browser.tinymce.core.ResourceTest', () => {
  const origTiny = Global.tinymce;

  before(() => {
    Global.tinymce = {
      Resource
    };
  });

  after(() => {
    Global.tinymce = origTiny;
  });

  const testScript = (id: string, data: string) => `data:text/javascript,tinymce.Resource.add('${id}', '${data}')`;

  const addScript = (id: string, data: string) => {
    tinymce.Resource.add(id, data);
  };

  const loadScript = (id: string, url: string): Promise<any> =>
    tinymce.Resource.load(id, url);

  const unloadScript = (id: string) => {
    tinymce.Resource.unload(id);
  };

  const assertLoadSuccess = (actual: Promise<string>, expectedData: string) => {
    return actual.then((data) => {
      assert.equal(data, expectedData, 'Load succeeded but data did not match expected');
    }, (err) => {
      assert.fail('Load failed with error: ' + err);
    });
  };

  const assertLoadFailure = (actual: Promise<string>, expectedErr: string): Promise<void> => {
    return actual.then((data) => {
      assert.fail('Expected failure but succeeded with value: ' + data);
    }, (err) => {
      assert.equal(err, expectedErr, 'Load failed but error did not match expected');
    });
  };

  it('bundling', () => {
    addScript('script.1', 'value.1');
    const load = loadScript('script.1', '/custom/404');
    return assertLoadSuccess(load, 'value.1');
  });

  it('async loading', () => {
    const load = loadScript('script.2', testScript('script.2', 'value.2'));
    return assertLoadSuccess(load, 'value.2');
  });

  it('return cached value', async () => {
    await loadScript('script.2', testScript('script.2', 'value.2'));

    const load = loadScript('script.2', testScript('script.2', 'value.3'));
    return assertLoadSuccess(load, 'value.2');
  });

  it('invalid URL fails', () => {
    const load = loadScript('script.3', '/custom/404');
    return assertLoadFailure(load, 'Script at URL "/custom/404" failed to load');
  });

  it('invalid id fails', () => {
    const load = loadScript('script.4', testScript('invalid-id', 'value.4')); // this takes 1 second to timeout
    return assertLoadFailure(load, `Script at URL "data:text/javascript,tinymce.Resource.add('invalid-id', 'value.4')" did not call \`tinymce.Resource.add('script.4', data)\` within 1 second`);
  });

  it('unload cached value', async () => {
    await loadScript('script.5', testScript('script.5', 'value.1'));
    unloadScript('script.5');

    const load = loadScript('script.5', testScript('script.5', 'value.2'));
    return assertLoadSuccess(load, 'value.2');
  });
});
