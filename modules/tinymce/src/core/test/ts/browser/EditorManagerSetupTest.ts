import { Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { window } from '@ephox/dom-globals';
import EditorManager from 'tinymce/core/api/EditorManager';
import ViewBlock from '../module/test/ViewBlock';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorManagerSetupTest', (success, failure) => {
  const viewBlock = ViewBlock();

  Theme();

  viewBlock.attach();

  // Store the original data
  const origBaseURL = EditorManager.baseURL;
  const origBaseURI = EditorManager.baseURI;
  const origSuffix = EditorManager.suffix;
  const origDocumentBaseURL = EditorManager.documentBaseURL;
  const origTinyMCE = (window as any).tinymce;
  delete (window as any).tinymce;

  Pipeline.async({}, [
    Logger.t('script baseURL and suffix with script in svg', Step.sync(() => {
      viewBlock.update('<svg><script>!function(){}();</script></svg><script src="http://localhost/nonexistant/tinymce.min.js" type="application/javascript"></script>');
      EditorManager.setup();
      Assertions.assertEq('BaseURL is interpreted from the script src', EditorManager.baseURL, 'http://localhost/nonexistant');
      Assertions.assertEq('Suffix is interpreted from the script src', EditorManager.suffix, '.min');
    }))
  ], () => {
    viewBlock.detach();

    // Restore the original values
    EditorManager.baseURL = origBaseURL;
    EditorManager.baseURI = origBaseURI;
    EditorManager.documentBaseURL = origDocumentBaseURL;
    EditorManager.suffix = origSuffix;
    (window as any).tinymce = origTinyMCE;

    success();
  }, failure);
});
