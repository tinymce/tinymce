import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { LegacyUnit } from '@ephox/mcagar';
import { Element, Attr, SelectorFilter } from '@ephox/sugar';
import EditorManager from 'tinymce/core/api/EditorManager';
import Env from 'tinymce/core/api/Env';
import ViewBlock from '../../module/test/ViewBlock';
import Tools from 'tinymce/core/api/util/Tools';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';
import { window, document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.init.EditorInitializationTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  Theme();

  const setup = function () {
    let i, htmlReset = '', odd;
    for (i = 1; i < 9; i++) {
      odd = i % 2 !== 0;
      htmlReset += '<textarea id="elm-' + i + '" class="' + (odd ? 'elm-odd' : 'elm-even') + '"></textarea>';
    }

    viewBlock.attach();
    viewBlock.update(htmlReset);
  };

  const teardown = function (done) {
    window.setTimeout(function () {
      EditorManager.remove();
      done();
    }, 0);
  };

  suite.asyncTest('target (initialised properly)', function (_, done) {
    const elm1 = viewBlock.get().querySelector('#elm-1');

    EditorManager.init({
      target: elm1,
      skin_url: '/project/js/tinymce/skins/lightgray',
      init_instance_callback (ed) {
        LegacyUnit.equalDom(ed.targetElm, elm1);
        teardown(done);
      }
    });
  });

  suite.asyncTest('target (initialise on element without id)', function (_, done) {
    const elm = document.createElement('textarea');
    viewBlock.get().appendChild(elm);

    EditorManager.init({
      target: elm,
      skin_url: '/project/js/tinymce/skins/lightgray',
      init_instance_callback (ed) {
        LegacyUnit.equal(ed.id.length > 0, true, 'editors id set to: ' + ed.id);
        LegacyUnit.equalDom(ed.targetElm, elm);
        teardown(done);
      }
    });
  });

  suite.asyncTest('target (selector option takes precedence over target option)', function (_, done) {
    const elm1 = document.getElementById('elm-1');
    const elm2 = document.getElementById('elm-2');

    EditorManager.init({
      selector: '#elm-2',
      target: elm1,
      skin_url: '/project/js/tinymce/skins/lightgray',
      init_instance_callback (ed) {
        LegacyUnit.equalDom(ed.targetElm, elm2);
        teardown(done);
      }
    });
  });

  suite.asyncTest('selector on non existing targets', function (_, done) {
    EditorManager.init({
      selector: '#non-existing-id',
      skin_url: '/project/js/tinymce/skins/lightgray'
    }).then(function (result) {
      Assertions.assertEq('Should be an result that is zero length', 0, result.length);
      teardown(done);
    });
  });

  suite.asyncTest('selector on an unsupported browser', function (_, done) {
    // Fake IE 8
    const oldIeValue = Env.ie;
    Env.ie = 8;

    EditorManager.init({
      selector: '#elm-2',
      skin_url: '/project/js/tinymce/skins/lightgray'
    }).then(function (result) {
      Assertions.assertEq('Should be an result that is zero length', 0, result.length);
      Env.ie = oldIeValue;
      teardown(done);
    });
  });

  suite.asyncTest('target (each editor should have a different target)', function (_, done) {
    const maxCount = document.querySelectorAll('.elm-even').length;
    const elm1 = document.getElementById('elm-1');
    let count = 0;
    const targets = [];

    EditorManager.init({
      selector: '.elm-even',
      target: elm1,
      skin_url: '/project/js/tinymce/skins/lightgray',
      init_instance_callback (ed) {
        LegacyUnit.equal(ed.targetElm !== elm1, true, 'target option ignored');
        LegacyUnit.equal(Tools.inArray(ed.targetElm, targets), -1);

        targets.push(ed.targetElm);

        if (++count >= maxCount) {
          teardown(done);
        }
      }
    });
  });

  const getSkinCssFilenames = function () {
    return Arr.bind(SelectorFilter.descendants(Element.fromDom(document), 'link'), function (link) {
      const href = Attr.get(link, 'href');
      const fileName = href.split('/').slice(-1).join('');
      const isSkin = href.indexOf('lightgray/') > -1;
      return isSkin ? [ fileName ] : [ ];
    });
  };

  const mCreateInlineModeMultipleInstances = Step.stateful(function (value, next, die) {
    viewBlock.update('<div class="tinymce-editor"><p>a</p></div><div class="tinymce-editor"><p>b</p></div>');

    EditorManager.init({
      selector: '.tinymce-editor',
      inline: true,
      skin_url: '/project/js/tinymce/skins/lightgray'
    }).then(next, die);
  });

  const mAssertEditors = Step.stateful(function (editors: any[], next, die) {
    Assertions.assertHtml('Editor contents should be the first div content', '<p>a</p>', editors[0].getContent());
    Assertions.assertHtml('Editor contents should be the second div content', '<p>b</p>', editors[1].getContent());
    Assertions.assertEq('Editor container should be null', null, editors[0].editorContainer);
    Assertions.assertEq('Editor container should be null', null, editors[1].editorContainer);

    Assertions.assertEq(
      'Should only be two skin files the skin and the content for inline mode',
      ['skin.min.css', 'content.inline.min.css'],
      getSkinCssFilenames()
    );

    const targets = Arr.map(editors, function (editor) {
      return editor.getElement();
    });

    Assertions.assertEq('Targets should be two since there are two editors', 2, targets.length);

    next(targets);
  });

  const sRemoveAllEditors = Step.sync(function () {
    EditorManager.remove();
  });

  const mAssertTargets = Step.stateful(function (targets: any[], next, die) {
    Assertions.assertEq('Targets should be two since there are two editors', 2, targets.length);

    Arr.each(targets, function (target) {
      Assertions.assertEq('Target parent should not be null', true, target.parentNode !== null);
    });

    next({});
  });

  setup();
  Pipeline.async({}, [
    Logger.t('Initialize multiple inline editors and remove them', GeneralSteps.sequence([
      mCreateInlineModeMultipleInstances,
      mAssertEditors,
      sRemoveAllEditors,
      mAssertTargets
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
