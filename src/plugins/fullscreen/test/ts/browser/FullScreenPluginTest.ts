import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Plugin from 'tinymce/plugins/fullscreen/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.fullscreen.FullScreenPluginTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  LinkPlugin();
  Plugin();
  Theme();

  suite.test('Fullscreen class on html and body tag', function (editor) {
    const bodyTag = document.body;
    const htmlTag = document.documentElement;
    let lastEventArgs;

    editor.on('FullscreenStateChanged', function (e) {
      lastEventArgs = e;
    });

    LegacyUnit.equal(
      DOMUtils.DOM.hasClass(bodyTag, 'mce-fullscreen'),
      false,
      'Body tag should not have "mce-fullscreen" class before fullscreen command'
    );
    LegacyUnit.equal(
      DOMUtils.DOM.hasClass(htmlTag, 'mce-fullscreen'),
      false,
      'Html tag should not have "mce-fullscreen" class before fullscreen command'
    );

    editor.execCommand('mceFullScreen');

    LegacyUnit.equal(editor.plugins.fullscreen.isFullscreen(), true, 'Should be true');
    LegacyUnit.equal(lastEventArgs.state, true, 'Should be true');

    LegacyUnit.equal(
      DOMUtils.DOM.hasClass(bodyTag, 'mce-fullscreen'),
      true,
      'Body tag should have "mce-fullscreen" class after fullscreen command'
    );
    LegacyUnit.equal(
      DOMUtils.DOM.hasClass(htmlTag, 'mce-fullscreen'),
      true,
      'Html tag should have "mce-fullscreen" class after fullscreen command'
    );

    editor.execCommand('mceLink', true);

    const windows = editor.windowManager.getWindows();
    const linkWindow = windows[0];

    LegacyUnit.equal(typeof linkWindow, 'object', 'Link window is an object');

    linkWindow.close();

    LegacyUnit.equal(windows.length, 0, 'No windows exist');

    LegacyUnit.equal(
      DOMUtils.DOM.hasClass(bodyTag, 'mce-fullscreen'),
      true,
      'Body tag should still have "mce-fullscreen" class after window is closed'
    );
    LegacyUnit.equal(
      DOMUtils.DOM.hasClass(htmlTag, 'mce-fullscreen'),
      true,
      'Html tag should still have "mce-fullscreen" class after window is closed'
    );

    editor.execCommand('mceFullScreen');

    LegacyUnit.equal(editor.plugins.fullscreen.isFullscreen(), false, 'Should be false');
    LegacyUnit.equal(lastEventArgs.state, false, 'Should be false');
    LegacyUnit.equal(
      DOMUtils.DOM.hasClass(bodyTag, 'mce-fullscreen'),
      false,
      'Body tag should have "mce-fullscreen" class after fullscreen command'
    );
    LegacyUnit.equal(
      DOMUtils.DOM.hasClass(htmlTag, 'mce-fullscreen'),
      false,
      'Html tag should have "mce-fullscreen" class after fullscreen command'
    );
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    plugins: 'fullscreen link',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
