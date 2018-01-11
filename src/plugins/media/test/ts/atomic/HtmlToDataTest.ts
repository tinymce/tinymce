import HtmlToData from 'tinymce/plugins/media/core/HtmlToData';
import { RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('atomic.core.HtmlToDataTest', function () {
  const testHtmlToData = function (html, expected) {
    const actual = HtmlToData.htmlToData([], html);
    RawAssertions.assertEq('Assert equal', expected, actual);
  };

  testHtmlToData('<div data-ephox-embed-iri="a"></div>', {
    type: 'ephox-embed-iri',
    source1: 'a',
    source2: '',
    poster: '',
    width: '',
    height: ''
  });

  testHtmlToData('<div data-ephox-embed-iri="a" style="max-width: 300px; max-height: 200px"></div>', {
    type: 'ephox-embed-iri',
    source1: 'a',
    source2: '',
    poster: '',
    width: '300',
    height: '200'
  });

  testHtmlToData('<iframe src="//www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>', {
    src: '//www.youtube.com/embed/b3XFjWInBog',
    width: '560',
    height: '314',
    allowfullscreen: '1',
    type: 'iframe',
    source1: '//www.youtube.com/embed/b3XFjWInBog',
    source2: '',
    poster: ''
  });
});
