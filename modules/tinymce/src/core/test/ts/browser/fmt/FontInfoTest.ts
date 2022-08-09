import { describe, it } from '@ephox/bedrock-client';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as FontInfo from 'tinymce/core/fmt/FontInfo';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.fmt.FontInfoTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const assertComputedFontProp = (fontProp: 'fontSize' | 'fontFamily', html: string, path: number[], expected: string) => {
    const fontGetProp = fontProp === 'fontSize' ? FontInfo.getFontSize : FontInfo.getFontFamily;

    const div = viewBlock.get();
    div.style[fontProp] = expected;
    viewBlock.update(html);
    const elm = Hierarchy.follow(SugarElement.fromDom(div), path).getOrDie('oh no! ' + path.toString() + '  path was bad');
    const actual = fontGetProp(div, elm.dom);
    assert.equal(
      actual,
      expected,
      `Doesn't match the expected computed runtime style`
    );
  };

  const assertSpecificFontProp = (fontProp: 'fontSize' | 'fontFamily', html: string, path: number[], expected: string) => {
    const fontGetProp = fontProp === 'fontSize' ? FontInfo.getFontSize : FontInfo.getFontFamily;

    const div = viewBlock.get();
    viewBlock.update(html);
    const elm = Hierarchy.follow(SugarElement.fromDom(div), path).getOrDie('oh no! ' + path.toString() + '  path was bad');
    const actual = fontGetProp(div, elm.dom);
    assert.equal(
      actual,
      expected,
      `Doesn't match the expected specific element style`
    );
  };

  it('toPt', () => {
    assert.equal(FontInfo.toPt('10px'), '8pt');
    assert.equal(FontInfo.toPt('10px', 1), '7.5pt');
    assert.equal(FontInfo.toPt('11px'), '8pt');
    assert.equal(FontInfo.toPt('12px'), '9pt');
    assert.equal(FontInfo.toPt('13px', 2), '9.75pt');
    assert.equal(FontInfo.toPt('13px', 1), '9.8pt');
    assert.equal(FontInfo.toPt('14px'), '11pt');
    assert.equal(FontInfo.toPt('36px'), '27pt');
  });

  it('getFontSize', () => {
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

  it('getFontFamily', () => {
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

  it('getFontFamily should always return string even if display: none (firefox specific bug)', (done) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentDocument as Document;

    iframe.addEventListener('load', () => {
      const body = iframeDoc.body;
      const firstChildElement = iframeDoc.body.firstChild as Element;
      const fontFamily = FontInfo.getFontFamily(body, firstChildElement);
      assert.typeOf(fontFamily, 'string', 'Should always be a string');
      iframe.parentNode?.removeChild(iframe);

      done();
    }, false);

    iframeDoc.open();
    iframeDoc.write('<html><body><p>a</p></body></html>');
    iframeDoc.close();
  });

  it('getFontFamily should return a string when run on element in removed iframe', (done) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentDocument as Document;

    iframe.addEventListener('load', () => {
      const body = iframeDoc.body;
      const firstChildElement = iframeDoc.body.firstChild as Element;

      iframe.parentNode?.removeChild(iframe);

      try {
        const fontFamily = FontInfo.getFontFamily(body, firstChildElement);
        assert.typeOf(fontFamily, 'string', 'Should return a string');
        done();
      } catch (error) {
        done('getFontFamily did not return a string');
      }
    }, false);

    iframeDoc.open();
    iframeDoc.write('<html><body><p>a</p></body></html>');
    iframeDoc.close();
  });

  it('comments should always return empty string', () => {
    assertComputedFontProp('fontFamily', '<!-- comment -->', [ 0 ], '');
    assertComputedFontProp('fontSize', '<!-- comment -->', [ 0 ], '');
    assertSpecificFontProp('fontFamily', '<!-- comment -->', [ 0 ], '');
    assertSpecificFontProp('fontSize', '<!-- comment -->', [ 0 ], '');
  });

  it('should not throw error when passed in element without parent', () => {
    const rootDiv = document.createElement('div');
    const element = document.createElement('p');

    const actual = FontInfo.getFontSize(rootDiv, element);

    assert.typeOf(actual, 'string', 'should return always string');
  });
});
