import { Mouse, Pipeline, Step } from '@ephox/agar';
import { Attachment } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { PlatformDetection } from '@ephox/sand';
import { Body, Class } from '@ephox/sugar';

import * as FontSizeSlider from 'tinymce/themes/mobile/ui/FontSizeSlider';
import IosRealm from 'tinymce/themes/mobile/ui/IosRealm';

import TestFrameEditor from '../../module/test/ui/TestFrameEditor';
import TestSelectors from '../../module/test/ui/TestSelectors';
import TestStyles from '../../module/test/ui/TestStyles';
import { Fun } from '@ephox/katamari';

UnitTest.asynctest('Browser Test: ui.FontSizeSliderTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const detection = PlatformDetection.detect();

  const realm = IosRealm(Fun.noop);
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
    tEditor.sWaitForEditorLoaded,
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
