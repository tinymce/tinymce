import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import * as FontInfo from 'tinymce/core/fmt/FontInfo';

UnitTest.asynctest('browser.tinymce.core.fmt.FontInfoTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  const assertComputedFontProp = (fontProp, html, path, expected) => {
    const div = document.createElement('div');
    const fontGetProp = fontProp === 'fontSize' ? FontInfo.getFontSize : FontInfo.getFontFamily;

    document.body.appendChild(div);
    div.style[fontProp] = expected;
    div.innerHTML = html;
    const elm = Hierarchy.follow(SugarElement.fromDom(div), path).getOrDie('oh no! ' + path.toString() + '  path was bad');
    const actual = fontGetProp(div, elm.dom);
    LegacyUnit.equal(
      actual,
      expected,
      `Doesn't match the expected computed runtime style`
    );
    div.parentNode.removeChild(div);
  };

  const assertSpecificFontProp = (fontProp, html, path, expected) => {
    const div = document.createElement('div');
    const fontGetProp = fontProp === 'fontSize' ? FontInfo.getFontSize : FontInfo.getFontFamily;

    document.body.appendChild(div);
    div.innerHTML = html;
    const elm = Hierarchy.follow(SugarElement.fromDom(div), path).getOrDie('oh no! ' + path.toString() + '  path was bad');
    const actual = fontGetProp(div, elm.dom);
    LegacyUnit.equal(
      actual,
      expected,
      `Doesn't match the expected specific element style`
    );
    div.parentNode.removeChild(div);
  };

  suite.test('toPt', () => {
    LegacyUnit.equal(FontInfo.toPt('10px'), '8pt');
    LegacyUnit.equal(FontInfo.toPt('10px', 1), '7.5pt');
    LegacyUnit.equal(FontInfo.toPt('11px'), '8pt');
    LegacyUnit.equal(FontInfo.toPt('12px'), '9pt');
    LegacyUnit.equal(FontInfo.toPt('13px', 2), '9.75pt');
    LegacyUnit.equal(FontInfo.toPt('13px', 1), '9.8pt');
    LegacyUnit.equal(FontInfo.toPt('14px'), '11pt');
    LegacyUnit.equal(FontInfo.toPt('36px'), '27pt');
  });

  suite.test('getFontSize', () => {
    assertComputedFontProp('fontSize', '<mark></mark>', [ 0 ], '10px');
    assertComputedFontProp('fontSize', '<span><mark></mark></span>', [ 0, 0 ], '10px');
    assertSpecificFontProp('fontSize', '<mark style="font-size: 10px"></mark>', [ 0 ], '10px');
    assertSpecificFontProp('fontSize', '<mark style="font-size: 14px"></mark>', [ 0 ], '14px');
    assertSpecificFontProp('fontSize', '<mark style="font-size: 14pt"></mark>', [ 0 ], '14pt');
    assertSpecificFontProp('fontSize', '<mark style="font-size: 14em"></mark>', [ 0 ], '14em');
    assertSpecificFontProp('fontSize', '<span style="font-size: 10px"><mark></mark></span>', [ 0, 0 ], '10px');
    assertSpecificFontProp('fontSize', '<span style="font-size: 14px"><mark></mark></span>', [ 0, 0 ], '14px');
    assertSpecificFontProp('fontSize', '<span style="font-size: 10px"><span><mark></mark></span></span>', [ 0, 0, 0 ], '10px');
    assertSpecificFontProp('fontSize', '<span style="font-size: 14px"><span><mark></mark></span></span>', [ 0, 0, 0 ], '14px');
    assertSpecificFontProp('fontSize', '<font size="2"></font>', [ 0 ], '2');
    assertSpecificFontProp('fontSize', '<font size="4"><mark></mark></font>', [ 0, 0 ], '4');
  });

  suite.test('getFontFamily', () => {
    assertComputedFontProp('fontFamily', '<mark></mark>', [ 0 ], 'Arial,Verdana');
    assertComputedFontProp('fontFamily', '<span><mark></mark></span>', [ 0, 0 ], 'Arial,Helvetica,Verdana');
    assertSpecificFontProp('fontFamily', '<mark style="font-family: Arial, Verdana"></mark>', [ 0 ], 'Arial,Verdana');
    assertSpecificFontProp('fontFamily', '<mark style="font-family: Comic Sans MS"></mark>', [ 0 ], 'Comic Sans MS');
    assertSpecificFontProp('fontFamily', '<mark style="font-family: Arial, Helvetica, Verdana"></mark>', [ 0 ], 'Arial,Helvetica,Verdana');
    assertSpecificFontProp('fontFamily', '<span style="font-family: Arial, Verdana"><mark></mark></span>', [ 0, 0 ], 'Arial,Verdana');
    assertSpecificFontProp(
      'fontFamily',
      '<span style="font-family: Arial, Helvetica, Verdana"><mark></mark></span>',
      [ 0, 0 ],
      'Arial,Helvetica,Verdana'
    );
    assertSpecificFontProp(
      'fontFamily',
      '<span style="font-family: Arial, Verdana"><span><mark></mark></span>',
      [ 0, 0, 0 ],
      'Arial,Verdana'
    );
    assertSpecificFontProp(
      'fontFamily',
      '<span style="font-family: Arial, Helvetica, Verdana"><span><mark></mark></span></span>',
      [ 0, 0, 0 ],
      'Arial,Helvetica,Verdana'
    );
    assertSpecificFontProp('fontFamily', '<font face="Comic Sans MS"></font>', [ 0 ], 'Comic Sans MS');
    assertSpecificFontProp('fontFamily', '<font face="Arial, Verdana"><mark></mark></font>', [ 0, 0 ], 'Arial,Verdana');
  });

  suite.asyncTest('getFontFamily should always return string even if display: none (firefox specific bug)', (_, done) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    iframe.addEventListener('load', () => {
      const fontFamily = FontInfo.getFontFamily(iframe.contentDocument.body, iframe.contentDocument.body.firstChild);
      LegacyUnit.equal(typeof fontFamily, 'string', 'Should always be a string');
      iframe.parentNode.removeChild(iframe);

      done();
    }, false);

    iframe.contentDocument.open();
    iframe.contentDocument.write('<html><body><p>a</p></body></html>');
    iframe.contentDocument.close();
  });

  suite.asyncTest('getFontFamily should return a string when run on element in removed iframe', (_, done, die) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    iframe.addEventListener('load', () => {
      const body = iframe.contentDocument.body;
      const firstChildElement = iframe.contentDocument.body.firstChild;

      iframe.parentNode.removeChild(iframe);

      try {
        const fontFamily = FontInfo.getFontFamily(body, firstChildElement);
        LegacyUnit.equal(typeof fontFamily, 'string', 'Should return a string');
        done();
      } catch (error) {
        die('getFontFamily did not return a string');
      }
    }, false);

    iframe.contentDocument.open();
    iframe.contentDocument.write('<html><body><p>a</p></body></html>');
    iframe.contentDocument.close();
  });

  suite.test('comments should always return empty string', () => {
    assertComputedFontProp('fontFamily', '<!-- comment -->', [ 0 ], '');
    assertComputedFontProp('fontSize', '<!-- comment -->', [ 0 ], '');
    assertSpecificFontProp('fontFamily', '<!-- comment -->', [ 0 ], '');
    assertSpecificFontProp('fontSize', '<!-- comment -->', [ 0 ], '');
  });

  suite.test('should not throw error when passed in element without parent', () => {
    const rootDiv = document.createElement('div');
    const element = document.createElement('p');

    const actual = FontInfo.getFontSize(rootDiv, element);

    LegacyUnit.equal('string', typeof actual, 'should return always string');
  });

  Pipeline.async({}, suite.toSteps({}), success, failure);
});
