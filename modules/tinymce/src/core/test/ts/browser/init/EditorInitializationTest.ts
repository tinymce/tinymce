import { Assertions, GeneralSteps, Logger, Pipeline, Step, ApproxStructure } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { console, document, window } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { LegacyUnit } from '@ephox/mcagar';
import { Element, Attr, SelectorFilter } from '@ephox/sugar';
import EditorManager from 'tinymce/core/api/EditorManager';
import Env from 'tinymce/core/api/Env';
import Tools from 'tinymce/core/api/util/Tools';
import Theme from 'tinymce/themes/silver/Theme';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.init.EditorInitializationTest', function (success, failure) {
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
      skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
      content_css: '/project/tinymce/js/tinymce/skins/content/default',
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
      skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
      content_css: '/project/tinymce/js/tinymce/skins/content/default',
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
      skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
      content_css: '/project/tinymce/js/tinymce/skins/content/default',
      init_instance_callback (ed) {
        LegacyUnit.equalDom(ed.targetElm, elm2);
        teardown(done);
      }
    });
  });

  suite.asyncTest('selector on non existing targets', function (_, done) {
    EditorManager.init({
      selector: '#non-existing-id',
      skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
      content_css: '/project/tinymce/js/tinymce/skins/content/default',
    }).then(function (result) {
      Assertions.assertEq('Should be an result that is zero length', 0, result.length);
      teardown(done);
    });
  });

  if (Env.browser.isIE()) {
    suite.asyncTest('selector on an unsupported browser', function (_, done) {
      // Fake IE 8
      const oldIeValue = Env.browser.version.major;
      Env.browser.version.major = 8;

      EditorManager.init({
        selector: '#elm-2',
        skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
        content_css: '/project/tinymce/js/tinymce/skins/content/default',
      }).then(function (result) {
        Assertions.assertEq('Should be an result that is zero length', 0, result.length);
        Env.browser.version.major = oldIeValue;
        teardown(done);
      });
    });
  }

  suite.asyncTest('target (each editor should have a different target)', function (_, done) {
    const maxCount = document.querySelectorAll('.elm-even').length;
    const elm1 = document.getElementById('elm-1');
    let count = 0;
    const targets = [];

    EditorManager.init({
      selector: '.elm-even',
      target: elm1,
      skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
      content_css: '/project/tinymce/js/tinymce/skins/content/default',
      init_instance_callback (ed) {
        LegacyUnit.equal(ed.targetElm !== elm1, true, 'target option ignored');
        LegacyUnit.equal(Tools.inArray(targets, ed.targetElm), -1);

        targets.push(ed.targetElm);

        if (++count >= maxCount) {
          teardown(done);
        }
      }
    });
  });

  suite.asyncTest('Test base_url and suffix options', function (_, done) {
    const oldBaseURL = EditorManager.baseURL;
    const oldSuffix = EditorManager.suffix;

    EditorManager.init({
      base_url: '/fake/url',
      suffix: '.min',
      selector: '#elm-1',
      skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
      content_css: '/project/tinymce/js/tinymce/skins/content/default',
      init_instance_callback (ed) {

        Assertions.assertEq('Should have set suffix on EditorManager', '.min', EditorManager.suffix);
        Assertions.assertEq('Should have set suffix on editor', '.min', ed.suffix);

        Assertions.assertEq('Should have set baseURL on EditorManager', EditorManager.documentBaseURL + 'fake/url', EditorManager.baseURL);

        Assertions.assertEq('Should have set baseURI on EditorManager', EditorManager.documentBaseURL + 'fake/url', EditorManager.baseURI.source);
        Assertions.assertEq('Should have set baseURI on editor', EditorManager.documentBaseURL + 'fake/url', ed.baseURI.source);

        EditorManager._setBaseUrl(oldBaseURL);
        EditorManager.suffix = oldSuffix;
        teardown(done);
      }
    });
  });

  const getSkinCssFilenames = function () {
    return Arr.bind(SelectorFilter.descendants(Element.fromDom(document), 'link'), function (link) {
      const href = Attr.get(link, 'href');
      const fileName = href.split('/').slice(-1).join('');
      const isSkin = href.indexOf('oxide/') > -1;
      return isSkin ? [ fileName ] : [ ];
    });
  };

  const mCreateInlineModeMultipleInstances = Step.label('mCreateInlineModeMultipleInstances', Step.stateful(function (value, next, die) {
    viewBlock.update('<div class="tinymce-editor"><p>a</p></div><div class="tinymce-editor"><p>b</p></div>');

    EditorManager.init({
      selector: '.tinymce-editor',
      inline: true,
      skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
      content_css: '/project/tinymce/js/tinymce/skins/content/default',
      toolbar_mode: 'wrap'
    }).then(next, die);
  }));

  const mAssertEditors = Step.label('mAssertEditors', Step.stateful(function (editors: any[], next, die) {
    Assertions.assertHtml('Editor contents should be the first div content', '<p>a</p>', editors[0].getContent());
    Assertions.assertHtml('Editor contents should be the second div content', '<p>b</p>', editors[1].getContent());
    // tslint:disable-next-line:no-console
    console.log('Editor container 0:', editors[0].editorContainer);
    const containerApproxStructure = ApproxStructure.build((s, str, arr) => {
      return s.element('div', {
        classes: [ arr.has('tox'), arr.has('tox-tinymce'), arr.has('tox-tinymce-inline') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-editor-container') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-editor-header') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-menubar') ],
                    attrs: {
                      role: str.is('menubar'),
                    },
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-toolbar') ],
                    attrs: {
                      role: str.is('group'),
                    },
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-anchorbar') ]
                  })
                ]
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-throbber') ]
          })
        ]
      });
    });
    Assertions.assertStructure('Editor container should match expected structure', containerApproxStructure, Element.fromDom(editors[0].editorContainer));
    Assertions.assertStructure('Editor container should match expected structure', containerApproxStructure, Element.fromDom(editors[1].editorContainer));

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
  }));

  const sRemoveAllEditors = Step.label('sRemoveAllEditors', Step.sync(function () {
    EditorManager.remove();
  }));

  const mAssertTargets = Step.label('mAssertTargets', Step.stateful(function (targets: any[], next, die) {
    Assertions.assertEq('Targets should be two since there are two editors', 2, targets.length);

    Arr.each(targets, function (target) {
      Assertions.assertEq('Target parent should not be null', true, target.parentNode !== null);
    });

    next({});
  }));

  const sInitAndAssertContent = (html: string, selector: string, expectedEditorContent: string) => {
    return Step.async((done) => {
      viewBlock.update(html);

      EditorManager.init({
        selector,
        skin_url: '/project/tinymce/js/tinymce/skins/ui/oxide',
        content_css: '/project/tinymce/js/tinymce/skins/content/default',
        init_instance_callback (ed) {
          Assertions.assertEq('Expect editor to have content', expectedEditorContent, ed.getContent({ format: 'text' }));
          teardown(done);
        }
      });
    });
  };

  setup();
  Pipeline.async({}, [
    ...suite.toSteps({}),
    Logger.t('Initialize multiple inline editors and remove them', GeneralSteps.sequence([
      mCreateInlineModeMultipleInstances,
      mAssertEditors,
      sRemoveAllEditors,
      mAssertTargets
    ])),
    Logger.t('Initialize on textarea with initial content', GeneralSteps.sequence([
      sInitAndAssertContent('<textarea>Initial Content</textarea>', 'textarea', 'Initial Content')
    ])),
    Logger.t('Initialize on input with initial content', GeneralSteps.sequence([
      sInitAndAssertContent('<input value="Initial Content">', 'input', 'Initial Content')
    ])),
    Logger.t('Initialize on list item with initial content', GeneralSteps.sequence([
      sInitAndAssertContent('<ul><li>Initial Content</li></ul>', 'li', 'Initial Content')
    ])),
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
