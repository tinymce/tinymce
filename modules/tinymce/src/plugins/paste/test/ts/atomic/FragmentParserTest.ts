import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as FragmentParser from 'tinymce/plugins/paste/core/FragmentParser';

UnitTest.test('atomic.tinymce.plugins.paste.FragmentParserTest', () => {
  const testGetFragmentInfo = () => {
    Assert.eq(
      'Should be the input string and context body',
      {
        html: 'abc',
        context: 'body'
      },
      FragmentParser.getFragmentInfo('abc')
    );

    Assert.eq(
      'Should be the input string without fragment markers and context body', {
        html: 'abc',
        context: 'body'
      },
      FragmentParser.getFragmentInfo('<!-- StartFragment -->abc<!-- EndFragment -->')
    );

    Assert.eq(
      'Should be the input string without fragment markers and context body', {
        html: 'abc',
        context: 'body'
      },
      FragmentParser.getFragmentInfo('<!--StartFragment-->abc<!--EndFragment-->')
    );

    Assert.eq(
      'Should be the input string without fragment markers and contents before/after fragment markers', {
        html: 'abc',
        context: 'body'
      },
      FragmentParser.getFragmentInfo('X<!--StartFragment-->abc<!--EndFragment-->Y')
    );

    Assert.eq(
      'Should be the input string without fragment markers and contents before/after fragment markers',
      {
        html: '<B>bold</B><I><B>abc</B>This</I>',
        context: 'body'
      },
      FragmentParser.getFragmentInfo('<!DOCTYPE html><BODY><!-- StartFragment --><B>bold</B><I><B>abc</B>This</I><!-- EndFragment --></BODY></HTML>')
    );

    Assert.eq(
      'Should be the input string without fragment markers and contents before/after them but with the ul context',
      {
        html: '<LI>abc</LI>',
        context: 'ul'
      },
      FragmentParser.getFragmentInfo('<BODY><UL><!--StartFragment--><LI>abc</LI><!--EndFragment--></UL></BODY>')
    );

    Assert.eq(
      'Should be the input string without fragment markers and contents before/after them but with the ul context',
      {
        html: '\n<LI>abc</LI>\n',
        context: 'ul'
      },
      FragmentParser.getFragmentInfo('<BODY>\n<UL>\n<!--StartFragment-->\n<LI>abc</LI>\n<!--EndFragment-->\n</UL>\n</BODY>')
    );

    Assert.eq(
      'Should be the input string without fragment markers and contents before/after them but with the p context',
      {
        html: '<B>abc</B>',
        context: 'p'
      },
      FragmentParser.getFragmentInfo('<BODY><P><!--StartFragment--><B>abc</B><!--EndFragment--></P></BODY>')
    );

    Assert.eq(
      'Should be the input string without fragment markers and contents before/after them but with the h1 context',
      {
        html: '<B>abc</B>',
        context: 'h1'
      },
      FragmentParser.getFragmentInfo('<BODY><H1><!--StartFragment--><B>abc</B><!--EndFragment--></H1></BODY>')
    );
  };

  const testGetFragmentHtml = () => {
    Assert.eq(
      'Should be the input string',
      'abc',
      FragmentParser.getFragmentHtml('abc')
    );

    Assert.eq(
      'Should be the input without fragment markers',
      'abc',
      FragmentParser.getFragmentHtml('<!-- StartFragment -->abc<!-- EndFragment -->')
    );

    Assert.eq(
      'Should be the input string without fragment markers',
      'abc',
      FragmentParser.getFragmentHtml('<!--StartFragment-->abc<!--EndFragment-->')
    );

    Assert.eq(
      'Should be the input string without fragment markers and suffix/prefix contents',
      'abc',
      FragmentParser.getFragmentHtml('X<!--StartFragment-->abc<!--EndFragment-->Y')
    );

    Assert.eq(
      'Should be the input string without fragment markers and suffix/prefix contents',
      '<B>bold</B><I><B>abc</B>This</I>',
      FragmentParser.getFragmentHtml('<!DOCTYPE html><BODY><!-- StartFragment --><B>bold</B><I><B>abc</B>This</I><!-- EndFragment --></BODY></HTML>')
    );

    Assert.eq(
      'Should be the input string without fragment markers and suffix/prefix contents',
      '<LI>abc</LI>',
      FragmentParser.getFragmentHtml('<BODY><UL><!--StartFragment--><LI>abc</LI><!--EndFragment--></UL></BODY>')
    );

    Assert.eq(
      'Should be the input string without fragment markers and suffix/prefix contents',
      '\n<LI>abc</LI>\n',
      FragmentParser.getFragmentHtml('<BODY>\n<UL>\n<!--StartFragment-->\n<LI>abc</LI>\n<!--EndFragment-->\n</UL>\n</BODY>')
    );

    Assert.eq(
      'Should be the input string with body element removed',
      '<UL><LI>abc</LI></UL>',
      FragmentParser.getFragmentHtml('<!DOCTYPE html><HTML><BODY><UL><LI>abc</LI></UL></BODY></HTML>')
    );

    Assert.eq(
      'Should be the input string with body element removed',
      '<UL><LI>abc</LI></UL>',
      FragmentParser.getFragmentHtml('<BODY CLASS="x"><UL><LI>abc</LI></UL></BODY>')
    );

    Assert.eq(
      'Should be the input string with fragments and body element removed',
      '<UL><LI>abc</LI></UL>',
      FragmentParser.getFragmentHtml('<BODY CLASS="x"><!--StartFragment--><UL><LI>abc</LI></UL><!--EndFragment--></BODY>')
    );
  };

  testGetFragmentInfo();
  testGetFragmentHtml();
});
