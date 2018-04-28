import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import ScriptLoader from 'tinymce/core/api/dom/ScriptLoader';
import EditorManager from 'tinymce/core/api/EditorManager';
import Factory from 'tinymce/core/api/ui/Factory';
import I18n from 'tinymce/core/api/util/I18n';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.EditorRtlTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  const teardown = function () {
    I18n.rtl = false;
    I18n.setCode('en');
    Factory.get('Control').rtl = false;
  };

  suite.test('UI rendered in RTL mode', function () {
    LegacyUnit.equal(EditorManager.activeEditor.getContainer().className.indexOf('mce-rtl') !== -1, true, 'Should have a mce-rtl class');
    LegacyUnit.equal(EditorManager.activeEditor.rtl, true, 'Should have the rtl property set');
  });

  EditorManager.addI18n('ar', {
    Bold: 'Bold test',
    _dir: 'rtl'
  });

  // Prevents the arabic language pack from being loaded
  EditorManager.overrideDefaults({
    base_url: '/project/tinymce'
  });
  ScriptLoader.ScriptLoader.markDone('http://' + document.location.host + '/project/tinymce/langs/ar.js');

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), function () {
      teardown();
      onSuccess();
    }, onFailure);
  }, {
    language: 'ar',
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
