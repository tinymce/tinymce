import { Chain, Guard, Pipeline, Log, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import ApiChains from 'ephox/mcagar/api/ApiChains';
import Editor from 'ephox/mcagar/api/Editor';
import UiChains from 'ephox/mcagar/api/UiChains';
import { TinyVersions } from 'ephox/mcagar/api/Main';
import { cAssertEditorVersion } from '../../module/AssertVersion';

UnitTest.asynctest('UiChainsTest', (success, failure) => {
  const sTestStep = (major, minor, ariaLabel, url) => Chain.asStep({}, Log.chains('', 'Test UiChains', [
    Editor.cFromSettings({
      plugins: 'link',
      toolbar: 'undo redo | bold | link unlink'
    }),
    cAssertEditorVersion(major, minor),
    ApiChains.cSetContent('<p>some text</p>'),
    ApiChains.cSetSelection([0, 0], 0, [0, 0], 4),
    UiChains.cClickOnToolbar("click Bold button", '[aria-label="Bold"]'),
    ApiChains.cAssertContent('<p><strong>some</strong> text</p>'),
    UiChains.cClickOnToolbar("click Link button", '[aria-label="' + ariaLabel + '"]'),
    UiChains.cFillActiveDialog({
      title: "Example URL",
      target: '_blank',
      ...url
    }),
    // selector is optional, if not specified current active popup will be processed
    UiChains.cSubmitDialog(),
    Chain.control(
      // dialog takes a few ms to close - wait for it
      ApiChains.cAssertContent('<p><a title="Example URL" href="http://example.com" target="_blank" rel="noopener"><strong>some</strong></a> text</p>'),
      Guard.tryUntil('Link was not inserted', 10, 1000)
    ),
    Editor.cRemove
  ]));

  Pipeline.async({}, [
    TinyVersions.sWithVersion('4.8.x', sTestStep(4, 8, 'Insert/edit link', { href: 'http://example.com' })),
    TinyVersions.sWithVersion('5.0.x', sTestStep(5, 0, 'Insert/edit link', { url: { value: 'http://example.com' } }))
  ],  () => {
    success();
  }, failure);
});

