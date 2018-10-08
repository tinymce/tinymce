import { Chain, Guard, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import ApiChains from 'ephox/mcagar/api/ApiChains';
import Editor from 'ephox/mcagar/api/Editor';
import UiChains from 'ephox/mcagar/api/UiChains';

UnitTest.asynctest('UiChainsTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Pipeline.async({}, [
    Chain.asStep({}, [
      Editor.cFromSettings({
        plugins: 'link',
        toolbar: 'undo redo | bold | link unlink'
      }),
      ApiChains.cSetContent('<p>some text</p>'),
      ApiChains.cSetSelection([0, 0], 0, [0, 0], 4),
      UiChains.cClickOnToolbar("click Bold button", '[role="button"][aria-label="Bold"]'),
      ApiChains.cAssertContent('<p><strong>some</strong> text</p>'),

      UiChains.cClickOnToolbar("click Link button", '[role="button"][aria-label="Link"]'),
      UiChains.cFillActiveDialog({
        url: { value: 'http://example.com' },
        title: "Example URL",
        target: '_blank'
      }),
      // selector is optional, if not specified current active popup will be processed
      UiChains.cSubmitDialog(),
      Chain.control(
        // dialog takes a few ms to close - wait for it
        ApiChains.cAssertContent('<p><a title="Example URL" href="http://example.com" target="_blank" rel="noopener"><strong>some</strong></a> text</p>'),
        Guard.tryUntil('Link was not inserted', 10, 1000)
      ),
      Editor.cRemove
    ])
  ], function () {
    success();
  }, failure);
});

