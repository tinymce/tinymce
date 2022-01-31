import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as HtmlToData from 'tinymce/plugins/media/core/HtmlToData';
import { MediaData } from 'tinymce/plugins/media/core/Types';

describe('atomic.tinymce.plugins.media.core.HtmlToDataTest', () => {
  const testHtmlToData = (html: string, expected: MediaData) => {
    const actual = HtmlToData.htmlToData(html);
    assert.deepEqual(actual, expected);
  };

  context('ephox embeds', () => {
    it('Convert ephox embed to data', () => testHtmlToData(
      '<div data-ephox-embed-iri="a"></div>',
      {
        type: 'ephox-embed-iri',
        source: 'a',
        altsource: '',
        poster: '',
        width: '',
        height: ''
      }
    ));

    it('Convert ephox embed with styles to data', () => testHtmlToData(
      '<div data-ephox-embed-iri="a" style="max-width: 300px; max-height: 200px"></div>',
      {
        type: 'ephox-embed-iri',
        source: 'a',
        altsource: '',
        poster: '',
        width: '300',
        height: '200'
      }
    ));
  });

  context('iframes', () => {
    it('Convert iframe with URL without protocol to data', () => testHtmlToData(
      '<iframe src="www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>',
      {
        src: 'www.youtube.com/embed/b3XFjWInBog',
        width: '560',
        height: '314',
        allowfullscreen: 'allowfullscreen',
        type: 'iframe',
        source: 'www.youtube.com/embed/b3XFjWInBog',
        altsource: '',
        poster: ''
      }
    ));

    it('Convert iframe with protocol relative URL to data', () => testHtmlToData(
      '<iframe src="//www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>',
      {
        src: '//www.youtube.com/embed/b3XFjWInBog',
        width: '560',
        height: '314',
        allowfullscreen: 'allowfullscreen',
        type: 'iframe',
        source: '//www.youtube.com/embed/b3XFjWInBog',
        altsource: '',
        poster: ''
      }
    ));

    it('Convert iframe with http URL to data', () => testHtmlToData(
      '<iframe src="http://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>',
      {
        src: 'http://www.youtube.com/embed/b3XFjWInBog',
        width: '560',
        height: '314',
        allowfullscreen: 'allowfullscreen',
        type: 'iframe',
        source: 'http://www.youtube.com/embed/b3XFjWInBog',
        altsource: '',
        poster: ''
      }
    ));

    it('Convert iframe with https URL to data', () => testHtmlToData(
      '<iframe src="https://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>',
      {
        src: 'https://www.youtube.com/embed/b3XFjWInBog',
        width: '560',
        height: '314',
        allowfullscreen: 'allowfullscreen',
        type: 'iframe',
        source: 'https://www.youtube.com/embed/b3XFjWInBog',
        altsource: '',
        poster: ''
      }
    ));
  });
});
