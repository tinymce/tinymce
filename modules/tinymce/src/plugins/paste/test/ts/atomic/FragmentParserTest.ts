import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as FragmentParser from 'tinymce/plugins/paste/core/FragmentParser';

describe('atomic.tinymce.plugins.paste.FragmentParserTest', () => {
  context('getFragmentInfo', () => {
    it('should be a body context and the input for text content', () => {
      const result = FragmentParser.getFragmentInfo('abc');
      assert.deepEqual(result, { html: 'abc', context: 'body' });
    });

    it('should be a body context and the content inside the fragment markers for text', () => {
      const text = FragmentParser.getFragmentInfo('<!-- StartFragment -->abc<!-- EndFragment -->');
      assert.deepEqual(text, { html: 'abc', context: 'body' }, 'text with no before/after content');

      const textNoSpaces = FragmentParser.getFragmentInfo('<!--StartFragment-->abc<!--EndFragment-->');
      assert.deepEqual(textNoSpaces, { html: 'abc', context: 'body' }, 'text with no before/after content and no spaces in comments');

      const textWithOuterContent = FragmentParser.getFragmentInfo('X<!--StartFragment-->abc<!--EndFragment-->Y');
      assert.deepEqual(textWithOuterContent, { html: 'abc', context: 'body' }, 'text with before/after content');
    });

    it('should be a body context and the content inside the fragment markers for html', () => {
      const result = FragmentParser.getFragmentInfo('<!DOCTYPE html><BODY><!-- StartFragment --><B>bold</B><I><B>abc</B>This</I><!-- EndFragment --></BODY></HTML>');
      assert.deepEqual(result, { html: '<B>bold</B><I><B>abc</B>This</I>', context: 'body' });
    });

    it('should be a ul context and the content inside the fragment markers for lists', () => {
      const simple = FragmentParser.getFragmentInfo('<BODY><UL><!--StartFragment--><LI>abc</LI><!--EndFragment--></UL></BODY>');
      assert.deepEqual(simple, { html: '<LI>abc</LI>', context: 'ul' }, 'simple list');

      const newLines = FragmentParser.getFragmentInfo('<BODY>\n<UL>\n<!--StartFragment-->\n<LI>abc</LI>\n<!--EndFragment-->\n</UL>\n</BODY>');
      assert.deepEqual(newLines, { html: '\n<LI>abc</LI>\n', context: 'ul' }, 'list with new lines');
    });

    it('should be a p context and the content inside the fragment markers for paragraphs', () => {
      const result = FragmentParser.getFragmentInfo('<BODY><P><!--StartFragment--><B>abc</B><!--EndFragment--></P></BODY>');
      assert.deepEqual(result, { html: '<B>abc</B>', context: 'p' });
    });

    it('should be a h<num> context and the content inside the fragment markers for headings', () => {
      const result = FragmentParser.getFragmentInfo('<BODY><H1><!--StartFragment--><B>abc</B><!--EndFragment--></H1></BODY>');
      assert.deepEqual(result, { html: '<B>abc</B>', context: 'h1' });
    });
  });

  context('getFragmentHtml', () => {
    it('should be the input content', () => {
      const result = FragmentParser.getFragmentHtml('abc');
      assert.equal(result, 'abc');
    });

    it('should be the content inside the fragment markers for text', () => {
      const text = FragmentParser.getFragmentHtml('<!-- StartFragment -->abc<!-- EndFragment -->');
      assert.equal(text, 'abc', 'text with no before/after content');

      const textNoSpaces = FragmentParser.getFragmentHtml('<!--StartFragment-->abc<!--EndFragment-->');
      assert.equal(textNoSpaces, 'abc', 'text with no before/after content and no spaces in comments');

      const textWithOuterContent = FragmentParser.getFragmentHtml('X<!--StartFragment-->abc<!--EndFragment-->Y');
      assert.equal(textWithOuterContent, 'abc', 'text with before/after content');
    });

    it('should be the content inside the fragment markers for html', () => {
      const result = FragmentParser.getFragmentHtml('<!DOCTYPE html><BODY><!-- StartFragment --><B>bold</B><I><B>abc</B>This</I><!-- EndFragment --></BODY></HTML>');
      assert.equal(result, '<B>bold</B><I><B>abc</B>This</I>');
    });

    it('should be the content inside the fragment markers for lists', () => {
      const simple = FragmentParser.getFragmentHtml('<BODY><UL><!--StartFragment--><LI>abc</LI><!--EndFragment--></UL></BODY>');
      assert.equal(simple, '<LI>abc</LI>', 'simple list');

      const newLines = FragmentParser.getFragmentHtml('<BODY>\n<UL>\n<!--StartFragment-->\n<LI>abc</LI>\n<!--EndFragment-->\n</UL>\n</BODY>');
      assert.equal(newLines, '\n<LI>abc</LI>\n', 'list with new lines');

      const withRoot = FragmentParser.getFragmentHtml('<BODY CLASS="x"><!--StartFragment--><UL><LI>abc</LI></UL><!--EndFragment--></BODY>');
      assert.equal(withRoot, '<UL><LI>abc</LI></UL>', 'list with root element');
    });

    it('should be the content inside the body', () => {
      const full = FragmentParser.getFragmentHtml('<!DOCTYPE html><HTML><BODY><UL><LI>abc</LI></UL></BODY></HTML>');
      assert.equal(full, '<UL><LI>abc</LI></UL>', 'full html with doctype and html element');

      const fragment = FragmentParser.getFragmentHtml('<BODY CLASS="x"><UL><LI>abc</LI></UL></BODY>');
      assert.equal(fragment, '<UL><LI>abc</LI></UL>', 'partial html with body only');
    });
  });
});
