import * as HtmlToData from 'tinymce/plugins/media/core/HtmlToData';
import { Assert, UnitTest } from '@ephox/bedrock-client';

UnitTest.test('atomic.core.HtmlToDataTest', function () {
  const testHtmlToData = function (html, expected) {
    const actual = HtmlToData.htmlToData([], html);
    Assert.eq('Assert equal', expected, actual);
  };

  testHtmlToData('<div data-ephox-embed-iri="a"></div>', {
    type: 'ephox-embed-iri',
    source: 'a',
    altsource: '',
    poster: '',
    width: '',
    height: ''
  });

  testHtmlToData('<div data-ephox-embed-iri="a" style="max-width: 300px; max-height: 200px"></div>', {
    type: 'ephox-embed-iri',
    source: 'a',
    altsource: '',
    poster: '',
    width: '300',
    height: '200'
  });

  testHtmlToData('<iframe src="www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>', {
    src: 'www.youtube.com/embed/b3XFjWInBog',
    width: '560',
    height: '314',
    allowfullscreen: '1',
    type: 'iframe',
    source: 'www.youtube.com/embed/b3XFjWInBog',
    altsource: '',
    poster: ''
  });

  testHtmlToData('<iframe src="//www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>', {
    src: '//www.youtube.com/embed/b3XFjWInBog',
    width: '560',
    height: '314',
    allowfullscreen: '1',
    type: 'iframe',
    source: '//www.youtube.com/embed/b3XFjWInBog',
    altsource: '',
    poster: ''
  });

  testHtmlToData('<iframe src="http://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>', {
    src: 'http://www.youtube.com/embed/b3XFjWInBog',
    width: '560',
    height: '314',
    allowfullscreen: '1',
    type: 'iframe',
    source: 'http://www.youtube.com/embed/b3XFjWInBog',
    altsource: '',
    poster: ''
  });

  testHtmlToData('<iframe src="https://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>', {
    src: 'https://www.youtube.com/embed/b3XFjWInBog',
    width: '560',
    height: '314',
    allowfullscreen: '1',
    type: 'iframe',
    source: 'https://www.youtube.com/embed/b3XFjWInBog',
    altsource: '',
    poster: ''
  });
});
