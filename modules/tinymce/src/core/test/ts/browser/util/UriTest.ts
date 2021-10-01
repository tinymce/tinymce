import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import URI from 'tinymce/core/api/util/URI';

describe('browser.tinymce.core.util.UriTest', () => {
  /* eslint max-len: 0 */

  it('protocol relative url', () => {
    const uri = new URI('//www.site.com/dir1/file?query#hash');

    assert.equal(uri.protocol, '');
    assert.equal(uri.host, 'www.site.com');
    assert.equal(uri.path, '/dir1/file');
    assert.equal(uri.query, 'query');
    assert.equal(uri.anchor, 'hash');
    assert.equal(uri.source, '//www.site.com/dir1/file?query#hash');
    assert.equal(uri.getURI(), '//www.site.com/dir1/file?query#hash');
    assert.equal(uri.toRelative('//www.site.com/dir1/file2'), 'file2');
    assert.equal(uri.toRelative('//www.site2.com/dir1/file2'), '//www.site2.com/dir1/file2');
    assert.equal(uri.toAbsolute('../file2'), '//www.site.com/dir1/file2');
    assert.equal(uri.toAbsolute('//www.site2.com/dir1/file2'), '//www.site2.com/dir1/file2');
  });

  it('parseFullURLs', () => {
    assert.equal(new URI('http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash').getURI(), 'http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash');
    assert.notEqual(new URI('http://a2bc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash').getURI(), 'http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash');
    assert.equal(new URI('chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890:8080/path/dir/file.ext?key1=val1&key2=val2#hash').getURI(), 'chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890:8080/path/dir/file.ext?key1=val1&key2=val2#hash');
    assert.equal(new URI('http://admin:supersecret@[3c62:5655:8695:0f39:b065:1654:2d23:9f34]:9999/bar/index.html#foo').getURI(), 'http://admin:supersecret@[3c62:5655:8695:0f39:b065:1654:2d23:9f34]:9999/bar/index.html#foo');
  });

  it('parseRelativeURLs', () => {
    assert.equal(new URI('./test.html').getURI(), 'http://mce_host/test.html');
    assert.equal(new URI('test.html').getURI(), 'http://mce_host/test.html');
    assert.equal(new URI('/assets/test.html').getURI(), 'http://mce_host/assets/test.html');
  });

  it('relativeURLs', () => {
    assert.equal(new URI('http://www.site.com/dir1/dir2/file.html').toRelative('http://www.site.com/dir1/dir3/file.html'), '../dir3/file.html');
    assert.equal(new URI('http://www.site.com/dir1/dir2/file.html').toRelative('http://www.site.com/dir3/dir4/file.html'), '../../dir3/dir4/file.html');
    assert.equal(new URI('http://www.site.com/dir1/').toRelative('http://www.site.com/dir1/dir3/file.htm'), 'dir3/file.htm');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site2.com/dir1/dir3/file.htm'), 'http://www.site2.com/dir1/dir3/file.htm');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site.com:8080/dir1/dir3/file.htm'), 'http://www.site.com:8080/dir1/dir3/file.htm');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('https://www.site.com/dir1/dir3/file.htm'), 'https://www.site.com/dir1/dir3/file.htm');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm'), '../../file.htm');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm?id=1#a'), '../../file.htm?id=1#a');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('mailto:test@test.com'), 'mailto:test@test.com');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('news:test'), 'news:test');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('javascript:void(0);'), 'javascript:void(0);');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('about:blank'), 'about:blank');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('#test'), '#test');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('test.htm'), 'test.htm');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site.com/dir1/dir2/test.htm'), 'test.htm');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('dir2/test.htm'), 'dir2/test.htm');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('../dir2/test.htm'), 'test.htm');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('../dir3/'), '../dir3/');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('../../../../../../test.htm'), '../../test.htm');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('//www.site.com/test.htm'), '../../test.htm');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('@@tinymce'), '@@tinymce'); // Zope 3 URL
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('../@@tinymce'), '../@@tinymce'); // Zope 3 URL
    assert.equal(new URI('http://www.site.com/').toRelative('dir2/test.htm'), 'dir2/test.htm');
    assert.equal(new URI('http://www.site.com/').toRelative('./'), './');
    assert.equal(new URI('http://www.site.com/test/').toRelative('../'), '../');
    assert.equal(new URI('http://www.site.com/test/test/').toRelative('../'), '../');
    assert.equal(new URI('chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890/dir1/dir2/').toRelative('/dir1'), '../');
    assert.equal(new URI('http://www.site.com/').toRelative('http://www.site.com/'), 'http://www.site.com/');
    assert.equal(new URI('http://www.site.com/').toRelative('http://www.site.com'), 'http://www.site.com/');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm?q=http://site.com/'), '../../file.htm?q=http://site.com/');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm#http://site.com/'), '../../file.htm#http://site.com/');
  });

  it('absoluteURLs', () => {
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute(''), 'http://www.site.com/dir1/dir2/');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../dir3'), 'http://www.site.com/dir1/dir3');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../dir3', true), '/dir1/dir3');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../../../../dir3'), 'http://www.site.com/dir3');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../abc/def/../../abc/../dir3/file.htm'), 'http://www.site.com/dir1/dir3/file.htm');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('http://www.site.com/dir2/dir3'), 'http://www.site.com/dir2/dir3');
    assert.equal(new URI('http://www.site2.com/dir1/dir2/').toAbsolute('http://www.site2.com/dir2/dir3'), 'http://www.site2.com/dir2/dir3');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('mailto:test@test.com'), 'mailto:test@test.com');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('news:test'), 'news:test');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('javascript:void(0);'), 'javascript:void(0);');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('about:blank'), 'about:blank');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('#test'), '#test');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('test.htm'), 'http://www.site.com/dir1/dir2/test.htm');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../@@tinymce'), 'http://www.site.com/dir1/@@tinymce'); // Zope 3 URL
    assert.equal(new URI('http://www.site.com/dir1/dir2/').getURI(), 'http://www.site.com/dir1/dir2/');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('/dir1/dir1/'), 'http://www.site.com/dir1/dir1/');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('https://www.site.com/dir1/dir2/', true), 'https://www.site.com/dir1/dir2/');
    assert.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('http://www.site.com/dir1/dir2/', true), '/dir1/dir2/');
    assert.equal(new URI('chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890/dir1/dir2/').toAbsolute('chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890/dir1/dir2/', true), '/dir1/dir2/');
  });

  it('strangeURLs', () => {
    assert.equal(new URI('//www.site.com').getURI(), '//www.site.com');
    assert.equal(new URI('mailto:test@test.com').getURI(), 'mailto:test@test.com');
    assert.equal(new URI('news:somegroup').getURI(), 'news:somegroup');
    assert.equal(new URI('skype:somegroup').getURI(), 'skype:somegroup');
    assert.equal(new URI('tel:somegroup').getURI(), 'tel:somegroup');
    assert.equal(new URI('//www.site.com/a@b').getURI(), '//www.site.com/a@b');
  });

  it('isSameOrigin', () => {
    assert.isTrue(new URI('http://www.site.com').isSameOrigin(new URI('http://www.site.com')));
    assert.isTrue(new URI('//www.site.com').isSameOrigin(new URI('//www.site.com')));
    assert.isTrue(new URI('http://www.site.com:80').isSameOrigin(new URI('http://www.site.com')));
    assert.isTrue(new URI('https://www.site.com:443').isSameOrigin(new URI('https://www.site.com')));
    assert.isTrue(new URI('//www.site.com:80').isSameOrigin(new URI('//www.site.com:80')));
    assert.isTrue(new URI('mailto:test@site.com').isSameOrigin(new URI('mailto:test@site.com')));
    assert.isTrue(new URI('mailto:test@site.com:25').isSameOrigin(new URI('mailto:test@site.com')));
    assert.isTrue(new URI('ftp://www.site.com').isSameOrigin(new URI('ftp://www.site.com')));
    assert.isTrue(new URI('ftp://www.site.com:21').isSameOrigin(new URI('ftp://www.site.com')));
    assert.isFalse(new URI('https://www.site.com').isSameOrigin(new URI('http://www.site.com')));
    assert.isFalse(new URI('http://www.site.com:8080').isSameOrigin(new URI('http://www.site.com')));
    assert.isFalse(new URI('https://www.site.com:8080').isSameOrigin(new URI('https://www.site.com')));
    assert.isFalse(new URI('ftp://www.site.com:1021').isSameOrigin(new URI('ftp://www.site.com')));
  });

  it('getDocumentBaseUrl', () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const getDocumentBaseUrl = URI.getDocumentBaseUrl;

    assert.deepEqual(getDocumentBaseUrl({ protocol: 'file:', host: '', pathname: '/dir/path1/path2' }), 'file:///dir/path1/');
    assert.deepEqual(getDocumentBaseUrl({ protocol: 'http:', host: 'localhost', pathname: '/dir/path1/path2' }), 'http://localhost/dir/path1/');
    assert.deepEqual(getDocumentBaseUrl({ protocol: 'https:', host: 'localhost', pathname: '/dir/path1/path2' }), 'https://localhost/dir/path1/');
    assert.deepEqual(getDocumentBaseUrl({ protocol: 'https:', host: 'localhost', pathname: '/dir/path1/path2/' }), 'https://localhost/dir/path1/path2/');
    assert.deepEqual(getDocumentBaseUrl({ protocol: 'http:', host: 'localhost:8080', pathname: '/dir/path1/path2' }), 'http://localhost:8080/dir/path1/');
    assert.deepEqual(getDocumentBaseUrl({ protocol: 'http:', host: 'localhost', pathname: '/dir/path1/path2/file.html' }), 'http://localhost/dir/path1/path2/');
    assert.deepEqual(getDocumentBaseUrl({ protocol: 'http:', host: 'localhost', pathname: '/' }), 'http://localhost/');
    assert.deepEqual(getDocumentBaseUrl({ protocol: 'applewebdata:', href: 'applewebdata://something//dir/path1#hash' }), 'applewebdata://something//dir/');
    assert.deepEqual(getDocumentBaseUrl({ protocol: 'applewebdata:', href: 'applewebdata://something//dir/path1' }), 'applewebdata://something//dir/');
    assert.deepEqual(getDocumentBaseUrl({ protocol: 'https:', host: '[::1]', pathname: '/dir/path1/path2/' }), 'https://[::1]/dir/path1/path2/');
    assert.deepEqual(getDocumentBaseUrl({ protocol: 'http:', host: '[::1]:8080', pathname: '/dir/path1/path2' }), 'http://[::1]:8080/dir/path1/');
  });

  context('isDomSafe', () => {
    it('simple cases', () => {
      assert.isTrue(URI.isDomSafe('http://www.site.com/'));
      assert.isTrue(URI.isDomSafe('https://www.site.com/'));
      assert.isTrue(URI.isDomSafe('https://www.site.com:8000/'));
      assert.isTrue(URI.isDomSafe('ftp://www.site.com:21'));
      assert.isTrue(URI.isDomSafe('mailto:test@test.com'));
      assert.isTrue(URI.isDomSafe('//www.site.com/dir1/file2.html'));
      assert.isTrue(URI.isDomSafe('/path/file.txt'));
      assert.isTrue(URI.isDomSafe('data:image/png;base64,R3/yw=='));
      assert.isFalse(URI.isDomSafe('javascript:alert(1)'));
      assert.isFalse(URI.isDomSafe('jav&#x09;ascript:alert(1)'));
      assert.isFalse(URI.isDomSafe('data:image/svg+xml;base64,R3/yw=='));
      assert.isFalse(URI.isDomSafe('data:text/html;%3Ch1%3EHello%2C%20World%21%3C%2Fh1%3E'));
    });

    it('should be safe for SVG data URIs with allow_svg_data_urls', () => {
      assert.isTrue(URI.isDomSafe('data:image/svg+xml;base64,R3/yw==', 'img'));
      assert.isTrue(URI.isDomSafe('data:image/svg+xml;base64,R3/yw==', 'video'));
      assert.isFalse(URI.isDomSafe('data:image/svg+xml;base64,R3/yw==', 'a'));

      const options = { allow_svg_data_urls: true };
      assert.isTrue(URI.isDomSafe('data:image/svg+xml;base64,R3/yw==', 'img', options));
      assert.isTrue(URI.isDomSafe('data:image/svg+xml;base64,R3/yw==', 'video', options));
      assert.isTrue(URI.isDomSafe('data:image/svg+xml;base64,R3/yw==', 'a', options));
    });

    it('should always be safe with allow_script_urls', () => {
      const options = { allow_script_urls: true };
      assert.isTrue(URI.isDomSafe('javascript:alert(1)', 'p', options));
      assert.isTrue(URI.isDomSafe('data:image/svg+xml;base64,R3/yw==', 'a', options));
      assert.isTrue(URI.isDomSafe('data:text/html;%3Ch1%3EHello%2C%20World%21%3C%2Fh1%3E', 'a', options));
    });

    it('should be safe for HTML data URIs with allow_html_data_urls', () => {
      const options = { allow_html_data_urls: true };
      assert.isTrue(URI.isDomSafe('data:text/html;%3Ch1%3EHello%2C%20World%21%3C%2Fh1%3E', 'a', options));
    });
  });
});
