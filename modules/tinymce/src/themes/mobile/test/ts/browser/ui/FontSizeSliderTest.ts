import { Mouse, Pipeline, Step } from '@ephox/agar';
import { Attachment } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Class, SugarBody } from '@ephox/sugar';

import * as FontSizeSlider from 'tinymce/themes/mobile/ui/FontSizeSlider';
import IosRealm from 'tinymce/themes/mobile/ui/IosRealm';

import TestFrameEditor from '../../module/test/ui/TestFrameEditor';
import * as TestSelectors from '../../module/test/ui/TestSelectors';
import * as TestStyles from '../../module/test/ui/TestStyles';

UnitTest.asynctest('Browser Test: ui.FontSizeSliderTest', (success, failure) => {
  const detection = PlatformDetection.detect();

  const realm = IosRealm(Fun.noop);
  // Make toolbar appear
  Class.add(realm.element, 'tinymce-mobile-fullscreen-maximized');

  const body = SugarBody.body();
  Attachment.attachSystem(body, realm.system);

  TestStyles.addStyles();

  const unload = () => {
    TestStyles.removeStyles();
    Attachment.detachSystem(realm.system);
  };

  const tEditor = TestFrameEditor();

  realm.system.add(tEditor.component());

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
    Step.sync(() => {
      tEditor.editor().focus();
    }),
    Mouse.sClickOn(realm.element, TestSelectors.fontsize()),
    tEditor.sAssertEq('on first showing, the font size slider should not have fired execCommand', [ ])

    // Think about how to do the slider events
  ] : [], () => {
    unload(); success();
  }, failure);
});
