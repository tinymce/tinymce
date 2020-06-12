import { Assertions, Pipeline, Logger, NamedChain, Chain } from '@ephox/agar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor, ApiChains } from '@ephox/mcagar';

UnitTest.asynctest('browser.tinymce.core.content.HTMLDataURLsTest', (success, failure) =>  {
  Theme();

  const content = '<p><a href="data:text/plain;base64,SGVsbG8sIHdvcmxkCg==">Click me</a></p>';

  const getSettings = (hasDataUrls: boolean) => ({
    base_url: '/project/tinymce/js/tinymce',
    allow_html_data_urls: hasDataUrls
  });

  Pipeline.async({}, [
    Logger.t('Editor should not allow data urls by default', Chain.asStep({}, [ NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), McEditor.cFromSettings(getSettings(false)), 'editor'),
      NamedChain.read('editor', ApiChains.cSetContent(content)),
      NamedChain.direct('editor', ApiChains.cGetContent, 'content'),
      NamedChain.read('content', Assertions.cAssertEq('Href should be removed', '<p><a>Click me</a></p>')),
      NamedChain.read('editor', McEditor.cRemove),
    ]) ])),
    Logger.t('Editor should allow data urls when allow_html_data_urls is true', Chain.asStep({}, [ NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), McEditor.cFromSettings(getSettings(true)), 'editor'),
      NamedChain.read('editor', ApiChains.cSetContent(content)),
      NamedChain.direct('editor', ApiChains.cGetContent, 'content'),
      NamedChain.read('content', Assertions.cAssertEq('Href should not be removed', content)),
      NamedChain.read('editor', McEditor.cRemove),
    ]) ])),
  ], success, failure);
});
