import { Mouse } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { Attachment } from '@ephox/alloy';
import { PlatformDetection } from '@ephox/sand';
import { Body } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import TestFrameEditor from '../../module/test/ui/TestFrameEditor';
import TestSelectors from '../../module/test/ui/TestSelectors';
import TestStyles from '../../module/test/ui/TestStyles';
import FontSizeSlider from 'tinymce/themes/mobile/ui/FontSizeSlider';
import IosRealm from 'tinymce/themes/mobile/ui/IosRealm';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('Browser Test: ui.FontSizeSliderTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const detection = PlatformDetection.detect();

  const realm = IosRealm();
  // Make toolbar appear
  Class.add(realm.system().element(), 'tinymce-mobile-fullscreen-maximized');

  const body = Body.body();
  Attachment.attachSystem(body, realm.system());

  TestStyles.addStyles();

  const unload = function () {
    TestStyles.removeStyles();
    Attachment.detachSystem(realm.system());
  };

  const tEditor = TestFrameEditor();

  realm.system().add(tEditor.component());

  realm.setToolbarGroups([
    {
      label: 'group1',
      items: [
        FontSizeSlider.sketch(realm, tEditor.editor())
      ]
    }
  ]);

  Pipeline.async({}, detection.browser.isChrome() ? [
    TestStyles.sWaitForToolstrip(realm),
    Step.sync(function () {
      tEditor.editor().focus();
    }),
    Mouse.sClickOn(realm.system().element(), TestSelectors.fontsize()),
    tEditor.sAssertEq('on first showing, the font size slider should not have fired execCommand', [ ])

    // Think about how to do the slider events
  ] : [], function () {
    unload(); success();
  }, failure);
});
