import * as Errors from 'tinymce/plugins/imagetools/core/Errors';
import { Assert, UnitTest } from '@ephox/bedrock-client';

UnitTest.test('atomic.tinymce.plugins.imagetools.ErrorsTest', function () {
  const testHttpErrors = function () {
    Assert.eq('404', 'ImageProxy HTTP error: Could not find Image Proxy', Errors.getHttpErrorMsg(404));
    Assert.eq('403', 'ImageProxy HTTP error: Rejected request', Errors.getHttpErrorMsg(403));
    Assert.eq('0', 'ImageProxy HTTP error: Incorrect Image Proxy URL', Errors.getHttpErrorMsg(0));
  };

  const testServiceErrors = function () {
    Assert.eq('key missing', 'The request did not include an api key.', Errors.getServiceErrorMsg('key_missing'));
    Assert.eq('key not found', 'The provided api key could not be found.', Errors.getServiceErrorMsg('key_not_found'));
    Assert.eq('key not found', 'The api key is not valid for the request origins.', Errors.getServiceErrorMsg('domain_not_trusted'));
  };

  testHttpErrors();
  testServiceErrors();
});
