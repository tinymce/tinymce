import { Assertions, GeneralSteps, Pipeline, Step, Waiter, Logger, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/fullpage/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.fullpage.FullPagePluginTest', function (success, failure) {

  const suite = LegacyUnit.createSuite();

  Plugin();
  Theme();

  const teardown = function (editor) {
    editor.getBody().rtl = '';
  };

  suite.test('TestCase-TBA: FullPage: Keep header/footer intact', function (editor) {
    const normalizeHTML = function (html) {
      return html.replace(/\s/g, '');
    };

    editor.setContent('<html><body><p>Test</p>');
    LegacyUnit.equal(normalizeHTML(editor.getContent()), '<html><body><p>Test</p>', 'Invalid HTML content is still editable.');

    editor.setContent('<html><body><p>Test</p></body></html>');
    LegacyUnit.equal(normalizeHTML(editor.getContent()), '<html><body><p>Test</p></body></html>', 'Header/footer is intact.');
  });

  suite.test('TestCase-TBA: FullPage: Default header/footer', function (editor) {
    editor.setContent('<p>Test</p>');
    LegacyUnit.equal(
      editor.getContent(),
      '<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n<p>Test</p>\n</body>\n</html>',
      'Invalid HTML content is still editable.'
    );
  });

  suite.test('TestCase-TBA: FullPage: Parse body attributes', function (editor) {
    editor.setContent('<html><body><p>Test</p></body></html>');
    LegacyUnit.equal(editor.getBody().style.color, '', 'No color on body.');
    LegacyUnit.equal(editor.getBody().dir, '', 'No dir on body.');
    LegacyUnit.equal(editor.dom.getStyle(editor.getBody().firstChild, 'display', true), 'block', 'No styles added to iframe document');

    editor.setContent('<html><body style="color:#FF0000"><p>Test</p></body></html>');
    LegacyUnit.equal(editor.getBody().style.color.length > 0, true, 'Color added to body');

    editor.setContent('<html><body dir="rtl"><p>Test</p></body></html>');
    LegacyUnit.equal(editor.getBody().dir, 'rtl', 'Dir added to body');

    editor.setContent('<html><body><p>Test</p></body></html>');
    LegacyUnit.equal(editor.getBody().style.color, '', 'No color on body.');
    LegacyUnit.equal(editor.getBody().dir, '', 'No dir on body.');
    LegacyUnit.equal(editor.dom.getStyle(editor.getBody().firstChild, 'display', true), 'block', 'No styles added to iframe document');
  });

  suite.test('TestCase-TBA: FullPage: fullpage_hide_in_source_view: false', function (editor) {
    editor.settings.fullpage_hide_in_source_view = false;
    editor.setContent('<html><body><p>1</p></body></html>');
    LegacyUnit.equal(editor.getContent({ source_view: true }), '<html><body>\n<p>1</p>\n</body></html>');
  });

  suite.test('TestCase-TBA: FullPage: fullpage_hide_in_source_view: false', function (editor) {
    editor.settings.fullpage_hide_in_source_view = true;
    editor.setContent('<html><body><p>1</p></body></html>');
    LegacyUnit.equal(editor.getContent({ source_view: true }), '<p>1</p>');
  });

  suite.test('TestCase-TBA: FullPage: link elements', function (editor) {
    editor.setContent('<html><head><link rel="stylesheet" href="a.css"><link rel="something"></head><body><p>c</p></body></html>');
    LegacyUnit.equal(
      editor.getContent(),
      '<html><head><link rel="stylesheet" href="a.css"><link rel="something"></head><body>\n<p>c</p>\n</body></html>'
    );
  });

  suite.test('TestCase-TBA: FullPage: add/remove stylesheets', function (editor) {
    const hasLink = function hasink(href) {
      const links = editor.getDoc().getElementsByTagName('link');

      for (let i = 0; i < links.length; i++) {
        if (links[i].href.indexOf('/' + href) !== -1) {
          return true;
        }
      }

      return false;
    };

    editor.setContent('<html><head><link rel="stylesheet" href="a.css"></head><body><p>c</p></body></html>');
    LegacyUnit.equal(hasLink('a.css'), true);
    LegacyUnit.equal(hasLink('b.css'), false);
    LegacyUnit.equal(hasLink('c.css'), false);

    editor.setContent(
      '<html><head><link rel="stylesheet" href="a.css"><link rel="stylesheet" href="b.css"></head><body><p>c</p></body></html>'
    );
    LegacyUnit.equal(hasLink('a.css'), true);
    LegacyUnit.equal(hasLink('b.css'), true);
    LegacyUnit.equal(hasLink('c.css'), false);

    editor.setContent(
      '<html><head>' +
      '<link rel="stylesheet" href="a.css">' +
      '<link rel="stylesheet" href="b.css">' +
      '<link rel="stylesheet" href="c.css">' +
      '</head>' +
      '<body><p>c</p></body></html>'
    );
    LegacyUnit.equal(hasLink('a.css'), true);
    LegacyUnit.equal(hasLink('b.css'), true);
    LegacyUnit.equal(hasLink('c.css'), true);

    editor.setContent('<html><head><link rel="stylesheet" href="a.css"></head><body><p>c</p></body></html>');
    LegacyUnit.equal(hasLink('a.css'), true);
    LegacyUnit.equal(hasLink('b.css'), false);
    LegacyUnit.equal(hasLink('c.css'), false);

    editor.setContent('<html><head></head><body><p>c</p></body></html>');
    LegacyUnit.equal(hasLink('a.css'), false);
    LegacyUnit.equal(hasLink('b.css'), false);
    LegacyUnit.equal(hasLink('c.css'), false);
  });

  const sParseStyles = function (editor) {
    return Logger.t('Parse styles', GeneralSteps.sequence([
      Step.sync(function () {
        editor.setContent('<html><head><style>p {text-transform: uppercase}</style></head><body dir="rtl"><p>Test</p></body></html>');
      }),
      Waiter.sTryUntil(
        'Expected styles were added',
        Step.sync(function () {
          Assertions.assertEq('Styles added to iframe document', 'uppercase', editor.dom.getStyle(editor.getBody().firstChild, 'text-transform', true));
          Assertions.assertEq('Styles not added to actual element', '', editor.dom.getStyle(editor.getBody().firstChild, 'text-transform', false));
        }
      ), 10, 3000)
    ]));
  };

  const sProtectConditionalCommentsInHeadFoot = function (editor) {
    return Logger.t('Set and assert styles were added to iframe document', GeneralSteps.sequence([
      Step.sync(function () {
        editor.setContent([
          '<!DOCTYPE html>',
          '<html>',
          '<!--[if mso]>',
          '<body class="mso-container" style="background-color:#FFFFFF;">',
          '<![endif]-->',
          '<!--[if !mso]><!-->',
          '<body class="clean-body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #FFFFFF">',
          '<!--<![endif]--><p>text</p>',
          '</body>',
          '</html>'
        ].join('\n'));
      }),
      Step.sync(function () {
        const expectedContent = [
          '<!DOCTYPE html>',
          '<html>',
          '<!--[if mso]>',
          '<body class="mso-container" style="background-color:#FFFFFF;">',
          '<![endif]-->',
          '<!--[if !mso]><!-->',
          '<body class="clean-body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #FFFFFF">',
          '<!--<![endif]--><p>text</p>',
          '</body>',
          '</html>'
        ].join('\n');

        Assertions.assertHtml('Styles added to iframe document', expectedContent, editor.getContent());
      })
    ]));
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'FullPage: Test full page header, footer, body attributes, hide in source view and adding and removing stylesheets',
      [
        sParseStyles(editor),
        sProtectConditionalCommentsInHeadFoot(editor)
      ].concat(suite.toSteps(editor))
    ), onSuccess, onFailure);

    teardown(editor);
  }, {
    plugins: 'fullpage',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    theme: 'silver',
    protect: [
      /<!--([\s\S]*?)-->/g
    ]
  }, success, failure);
});
