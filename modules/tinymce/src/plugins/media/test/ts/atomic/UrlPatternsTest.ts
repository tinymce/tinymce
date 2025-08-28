import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as UrlPatterns from 'tinymce/plugins/media/core/UrlPatterns';

describe('atomic.tinymce.plugins.media.core.UrlPatternsTest', () => {
  const check = (url: string, expected: string) => {
    const pattern = UrlPatterns.matchPattern(url);
    assert.equal(pattern?.url, expected);
  };

  it('Matches youtube URL without protocol', () => check(
    'youtube.com/watch?v=cOTbVN2qZBY&t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT',
    'https://www.youtube.com/embed/cOTbVN2qZBY?t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT'
  ));

  it('Matches youtube URL without protocol, but with www subdomain', () => check(
    'www.youtube.com/watch?v=cOTbVN2qZBY&t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT',
    'https://www.youtube.com/embed/cOTbVN2qZBY?t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT'
  ));

  it('Matches youtube URL with protocol relative URL', () => check(
    '//www.youtube.com/watch?v=cOTbVN2qZBY&t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT',
    'https://www.youtube.com/embed/cOTbVN2qZBY?t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT'
  ));

  it('Matches youtube URL with https protocol', () => check(
    'https://www.youtube.com/watch?v=cOTbVN2qZBY&t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT',
    'https://www.youtube.com/embed/cOTbVN2qZBY?t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT'
  ));

  it('Matches youtube URL with https protocol and only video id', () => check(
    'https://www.youtube.com/watch?v=b3XFjWInBog',
    'https://www.youtube.com/embed/b3XFjWInBog'
  ));

  it('Matches vimeo ID only URL', () => check(
    'https://vimeo.com/12345',
    'https://player.vimeo.com/video/12345?title=0&byline=0&portrait=0&color=8dc7dc'
  ));

  it('Matches vimeo ID with hash parameter URL', () => check(
    'https://vimeo.com/12345?h=abcd',
    'https://player.vimeo.com/video/12345?h=abcd&title=0&byline=0&portrait=0&color=8dc7dc'
  ));

  it('Matches vimeo channel with ID URL', () => check(
    'https://vimeo.com/channels/staffpicks/12345',
    'https://player.vimeo.com/video/12345?title=0&amp;byline=0'
  ));

  it('Matches vimeo channel with ID and hash parameter URL', () => check(
    'https://vimeo.com/channels/staffpicks/12345?h=abcd',
    'https://player.vimeo.com/video/12345?h=abcd&title=0&amp;byline=0'
  ));

  it('Matches dailymotion URL', () => check(
    'http://www.dailymotion.com/video/x5iscr6',
    'http://www.dailymotion.com/embed/video/x5iscr6'
  ));

  it('Matches dailymotion shortened URL', () => check(
    'http://www.dai.ly/x5iscr6',
    'http://www.dailymotion.com/embed/video/x5iscr6'
  ));
});
