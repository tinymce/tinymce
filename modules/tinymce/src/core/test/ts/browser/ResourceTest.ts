import { UnitTest, assert } from '@ephox/bedrock';
import { Global, Result } from '@ephox/katamari';
import Resource from 'tinymce/core/api/Resource';
import { Chain, Cleaner, Assertions, Pipeline, Step } from '@ephox/agar';

declare const tinymce: { Resource: Resource };

const install = () => {
  const origTiny = Global.tinymce;
  Global.tinymce = {
    Resource
  };
  const uninstall = () => {
    Global.tinymce = origTiny;
  };
  return uninstall;
};

const testScript = (id: string, data: string) => {
  return `data:text/javascript,tinymce.Resource.add('${id}', '${data}')`;
};

const cScriptAdd = (id: string, data: string) => Chain.op<any>((value) => {
  tinymce.Resource.add(id, data);
});

const cScriptLoad = (id: string, url: string) => Chain.async<any, Result<string, string>>((input, next, die) => {
  tinymce.Resource.load(id, url).then((value) => {
    next(Result.value(value));
  }, (err) => {
    next(Result.error(err));
  });
});

const cAssertLoadSuccess = (expectedData: string) => Chain.op<Result<string, string>>((actual) => {
  actual.fold((err) => {
    assert.fail('Load failed with error: ' + err);
  }, (data) => {
    Assertions.assertEq('Load succeeded but data did not match expected', expectedData, data);
  });
});

const cAssertLoadFailure = (expectedErr: string) => Chain.op<Result<string, string>>((actual) => {
  actual.fold((err) => {
    Assertions.assertEq('Load failed but error did not match expected', expectedErr, err);
  }, (data) => {
    assert.fail('Expected failure but succeeded with value: ' + data);
  });
});

UnitTest.asynctest('Scripts test', (success, failure) => {
  const cleanup = Cleaner();
  cleanup.add(install());
  Pipeline.async({}, [
    Step.label('bundling', Chain.asStep({}, [
      cScriptAdd('script.1', 'value.1'),
      cScriptLoad('script.1', '/custom/404'),
      cAssertLoadSuccess('value.1'),
    ])),
    Step.label('async loading', Chain.asStep({}, [
      cScriptLoad('script.2', testScript('script.2', 'value.2')),
      cAssertLoadSuccess('value.2'),
    ])),
    Step.label('return cached value', Chain.asStep({}, [
      cScriptLoad('script.2', testScript('script.2', 'value.3')),
      cAssertLoadSuccess('value.2'),
    ])),
    Step.label('invalid URL fails', Chain.asStep({}, [
      cScriptLoad('script.3', '/custom/404'),
      cAssertLoadFailure('Script at URL "/custom/404" failed to load'),
    ])),
    Step.label('invalid id fails', Chain.asStep({}, [
      cScriptLoad('script.4', testScript('invalid-id', 'value.4')), // this takes 1 second to timeout
      cAssertLoadFailure('Script at URL "data:text/javascript,tinymce.Resource.add(\'invalid-id\', \'value.4\')" did not call `tinymce.Resource.add(\'script.4\', data)` within 1 second'),
    ])),
  ], cleanup.wrap(success), cleanup.wrap(failure));
});