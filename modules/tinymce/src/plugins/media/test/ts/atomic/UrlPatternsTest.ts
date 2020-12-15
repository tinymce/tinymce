import { assert, UnitTest } from '@ephox/bedrock-client';
import * as UrlPatterns from 'tinymce/plugins/media/core/UrlPatterns';

UnitTest.test('atomic.tinymce.plugins.media.core.UrlPatternsTest', () => {
  const check = (url, expected) => {
    const pattern = UrlPatterns.matchPattern(url);
    assert.eq(expected, pattern.url);
  };

  check(
    'youtube.com/watch?v=cOTbVN2qZBY&t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT',
    'https://www.youtube.com/embed/cOTbVN2qZBY?t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT'
  );

  check(
    '//www.youtube.com/watch?v=cOTbVN2qZBY&t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT',
    'https://www.youtube.com/embed/cOTbVN2qZBY?t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT'
  );

  check(
    'www.youtube.com/watch?v=cOTbVN2qZBY&t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT',
    'https://www.youtube.com/embed/cOTbVN2qZBY?t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT'
  );

  check(
    'https://www.youtube.com/watch?v=cOTbVN2qZBY&t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT',
    'https://www.youtube.com/embed/cOTbVN2qZBY?t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT'
  );

  check(
    'https://www.youtube.com/watch?v=b3XFjWInBog',
    'https://www.youtube.com/embed/b3XFjWInBog'
  );

  check(
    'https://vimeo.com/12345',
    'https://player.vimeo.com/video/12345?title=0&byline=0&portrait=0&color=8dc7dc'
  );

  check(
    'https://vimeo.com/channels/staffpicks/12345',
    'https://player.vimeo.com/video/12345?title=0&amp;byline=0'
  );

  check(
    'http://www.dailymotion.com/video/x5iscr6',
    'http://www.dailymotion.com/embed/video/x5iscr6'
  );

  check(
    'http://www.dai.ly/x5iscr6',
    'http://www.dailymotion.com/embed/video/x5iscr6'
  );
});
