import { UnitTest, assert } from '@ephox/bedrock';
import * as UrlPatterns from 'tinymce/plugins/media/core/UrlPatterns';

UnitTest.test('atomic.core.UrlPatternsTest', function () {
  const check = (url, expected) => {
    const pattern = UrlPatterns.matchPattern(url);
    assert.eq(expected, pattern.url);
  };

  check(
    'https://www.youtube.com/watch?v=cOTbVN2qZBY&t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT',
    '//www.youtube.com/embed/cOTbVN2qZBY?t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT'
  );
  check(
    'https://www.youtube.com/watch?v=b3XFjWInBog',
    '//www.youtube.com/embed/b3XFjWInBog'
  );

  check(
    'https://vimeo.com/12345',
    '//player.vimeo.com/video/12345?title=0&byline=0&portrait=0&color=8dc7dc'
  );

  check(
    'https://vimeo.com/channels/staffpicks/12345',
    '//player.vimeo.com/video/12345?title=0&amp;byline=0'
  );

  check(
    'http://www.dailymotion.com/video/x5iscr6',
    '//www.dailymotion.com/embed/video/x5iscr6'
  );

  check(
    'http://www.dai.ly/x5iscr6',
    '//www.dailymotion.com/embed/video/x5iscr6'
  );
});
