import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { window } from '@ephox/dom-globals';
import { LegacyUnit } from '@ephox/mcagar';
import EditorManager from 'tinymce/core/api/EditorManager';
import ViewBlock from '../module/test/ViewBlock';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorManagerSetupTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  Theme();

  suite.test('script baseURL and suffix with script in svg', () => {
    viewBlock.update('<svg><script>!function(){}();</script></svg><script src="http://localhost/nonexistant/tinymce.min.js" type="application/javascript"></script>');
    EditorManager.setup();
    LegacyUnit.equal(EditorManager.baseURL, 'http://localhost/nonexistant');
    LegacyUnit.equal(EditorManager.suffix, '.min');
  });

  viewBlock.attach();

  // Store the original data
  const origBaseURL = EditorManager.baseURL;
  const origBaseURI = EditorManager.baseURI;
  const origSuffix = EditorManager.suffix;
  const origDocumentBaseURL = EditorManager.documentBaseURL;
  const origTinyMCE = (window as any).tinymce;
  delete (window as any).tinymce;

  Pipeline.async({}, suite.toSteps({}), () => {
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
