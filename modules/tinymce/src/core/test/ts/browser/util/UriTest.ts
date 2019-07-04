import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import URI from 'tinymce/core/api/util/URI';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.util.UriTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  const ok = function (value, label?) {
    // console.log(value, label);
    return LegacyUnit.equal(value, true, label);
  };

  /* eslint max-len: 0 */

  suite.test('protocol relative url', function () {
    const uri = new URI('//www.site.com/dir1/file?query#hash');

    LegacyUnit.equal(uri.protocol, '');
    LegacyUnit.equal(uri.host, 'www.site.com');
    LegacyUnit.equal(uri.path, '/dir1/file');
    LegacyUnit.equal(uri.query, 'query');
    LegacyUnit.equal(uri.anchor, 'hash');
    LegacyUnit.equal(uri.source, '//www.site.com/dir1/file?query#hash');
    LegacyUnit.equal(uri.getURI(), '//www.site.com/dir1/file?query#hash');
    LegacyUnit.equal(uri.toRelative('//www.site.com/dir1/file2'), 'file2');
    LegacyUnit.equal(uri.toRelative('//www.site2.com/dir1/file2'), '//www.site2.com/dir1/file2');
    LegacyUnit.equal(uri.toAbsolute('../file2'), '//www.site.com/dir1/file2');
    LegacyUnit.equal(uri.toAbsolute('//www.site2.com/dir1/file2'), '//www.site2.com/dir1/file2');
  });

  suite.test('parseFullURLs', function () {
    LegacyUnit.equal(new URI('http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash').getURI(), 'http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash');
    ok(new URI('http://a2bc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash').getURI() !== 'http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash');
    LegacyUnit.equal(new URI('chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890:8080/path/dir/file.ext?key1=val1&key2=val2#hash').getURI(), 'chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890:8080/path/dir/file.ext?key1=val1&key2=val2#hash');
  });

  suite.test('parseRelativeURLs', function () {
    LegacyUnit.equal(new URI('./test.html').getURI(), 'http://mce_host/test.html');
    LegacyUnit.equal(new URI('test.html').getURI(), 'http://mce_host/test.html');
    LegacyUnit.equal(new URI('/assets/test.html').getURI(), 'http://mce_host/assets/test.html');
  });

  suite.test('relativeURLs', function () {
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/file.html').toRelative('http://www.site.com/dir1/dir3/file.html'), '../dir3/file.html');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/file.html').toRelative('http://www.site.com/dir3/dir4/file.html'), '../../dir3/dir4/file.html');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/').toRelative('http://www.site.com/dir1/dir3/file.htm'), 'dir3/file.htm');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site2.com/dir1/dir3/file.htm'), 'http://www.site2.com/dir1/dir3/file.htm');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site.com:8080/dir1/dir3/file.htm'), 'http://www.site.com:8080/dir1/dir3/file.htm');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('https://www.site.com/dir1/dir3/file.htm'), 'https://www.site.com/dir1/dir3/file.htm');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm'), '../../file.htm');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm?id=1#a'), '../../file.htm?id=1#a');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('mailto:test@test.com'), 'mailto:test@test.com');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('news:test'), 'news:test');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('javascript:void(0);'), 'javascript:void(0);');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('about:blank'), 'about:blank');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('#test'), '#test');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('test.htm'), 'test.htm');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site.com/dir1/dir2/test.htm'), 'test.htm');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('dir2/test.htm'), 'dir2/test.htm');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('../dir2/test.htm'), 'test.htm');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('../dir3/'), '../dir3/');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('../../../../../../test.htm'), '../../test.htm');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('//www.site.com/test.htm'), '../../test.htm');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('@@tinymce'), '@@tinymce'); // Zope 3 URL
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('../@@tinymce'), '../@@tinymce'); // Zope 3 URL
    LegacyUnit.equal(new URI('http://www.site.com/').toRelative('dir2/test.htm'), 'dir2/test.htm');
    LegacyUnit.equal(new URI('http://www.site.com/').toRelative('./'), './');
    LegacyUnit.equal(new URI('http://www.site.com/test/').toRelative('../'), '../');
    LegacyUnit.equal(new URI('http://www.site.com/test/test/').toRelative('../'), '../');
    LegacyUnit.equal(new URI('chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890/dir1/dir2/').toRelative('/dir1'), '../');
    LegacyUnit.equal(new URI('http://www.site.com/').toRelative('http://www.site.com/'), 'http://www.site.com/');
    LegacyUnit.equal(new URI('http://www.site.com/').toRelative('http://www.site.com'), 'http://www.site.com/');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm?q=http://site.com/'), '../../file.htm?q=http://site.com/');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm#http://site.com/'), '../../file.htm#http://site.com/');
  });

  suite.test('absoluteURLs', function () {
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute(''), 'http://www.site.com/dir1/dir2/');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../dir3'), 'http://www.site.com/dir1/dir3');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../dir3', true), '/dir1/dir3');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../../../../dir3'), 'http://www.site.com/dir3');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../abc/def/../../abc/../dir3/file.htm'), 'http://www.site.com/dir1/dir3/file.htm');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('http://www.site.com/dir2/dir3'), 'http://www.site.com/dir2/dir3');
    LegacyUnit.equal(new URI('http://www.site2.com/dir1/dir2/').toAbsolute('http://www.site2.com/dir2/dir3'), 'http://www.site2.com/dir2/dir3');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('mailto:test@test.com'), 'mailto:test@test.com');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('news:test'), 'news:test');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('javascript:void(0);'), 'javascript:void(0);');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('about:blank'), 'about:blank');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('#test'), '#test');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('test.htm'), 'http://www.site.com/dir1/dir2/test.htm');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('../@@tinymce'), 'http://www.site.com/dir1/@@tinymce'); // Zope 3 URL
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').getURI(), 'http://www.site.com/dir1/dir2/');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('/dir1/dir1/'), 'http://www.site.com/dir1/dir1/');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('https://www.site.com/dir1/dir2/', true), 'https://www.site.com/dir1/dir2/');
    LegacyUnit.equal(new URI('http://www.site.com/dir1/dir2/').toAbsolute('http://www.site.com/dir1/dir2/', true), '/dir1/dir2/');
    LegacyUnit.equal(new URI('chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890/dir1/dir2/').toAbsolute('chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890/dir1/dir2/', true), '/dir1/dir2/');
  });

  suite.test('strangeURLs', function () {
    LegacyUnit.equal(new URI('//www.site.com').getURI(), '//www.site.com');
    LegacyUnit.equal(new URI('mailto:test@test.com').getURI(), 'mailto:test@test.com');
    LegacyUnit.equal(new URI('news:somegroup').getURI(), 'news:somegroup');
    LegacyUnit.equal(new URI('skype:somegroup').getURI(), 'skype:somegroup');
    LegacyUnit.equal(new URI('tel:somegroup').getURI(), 'tel:somegroup');
    LegacyUnit.equal(new URI('//www.site.com/a@b').getURI(), '//www.site.com/a@b');
  });

  suite.test('isSameOrigin', function () {
    ok(new URI('http://www.site.com').isSameOrigin(new URI('http://www.site.com')));
    ok(new URI('//www.site.com').isSameOrigin(new URI('//www.site.com')));
    ok(new URI('http://www.site.com:80').isSameOrigin(new URI('http://www.site.com')));
    ok(new URI('https://www.site.com:443').isSameOrigin(new URI('https://www.site.com')));
    ok(new URI('//www.site.com:80').isSameOrigin(new URI('//www.site.com:80')));
    ok(new URI('mailto:test@site.com').isSameOrigin(new URI('mailto:test@site.com')));
    ok(new URI('mailto:test@site.com:25').isSameOrigin(new URI('mailto:test@site.com')));
    ok(new URI('ftp://www.site.com').isSameOrigin(new URI('ftp://www.site.com')));
    ok(new URI('ftp://www.site.com:21').isSameOrigin(new URI('ftp://www.site.com')));
    ok(new URI('https://www.site.com').isSameOrigin(new URI('http://www.site.com')) === false);
    ok(new URI('http://www.site.com:8080').isSameOrigin(new URI('http://www.site.com')) === false);
    ok(new URI('https://www.site.com:8080').isSameOrigin(new URI('https://www.site.com')) === false);
    ok(new URI('ftp://www.site.com:1021').isSameOrigin(new URI('ftp://www.site.com')) === false);
  });

  suite.test('getDocumentBaseUrl', function () {
    const getDocumentBaseUrl = URI.getDocumentBaseUrl;

    LegacyUnit.equal(getDocumentBaseUrl({ protocol: 'file:', host: '', pathname: '/dir/path1/path2' }), 'file:///dir/path1/');
    LegacyUnit.equal(getDocumentBaseUrl({ protocol: 'http:', host: 'localhost', pathname: '/dir/path1/path2' }), 'http://localhost/dir/path1/');
    LegacyUnit.equal(getDocumentBaseUrl({ protocol: 'https:', host: 'localhost', pathname: '/dir/path1/path2' }), 'https://localhost/dir/path1/');
    LegacyUnit.equal(getDocumentBaseUrl({ protocol: 'https:', host: 'localhost', pathname: '/dir/path1/path2/' }), 'https://localhost/dir/path1/path2/');
    LegacyUnit.equal(getDocumentBaseUrl({ protocol: 'http:', host: 'localhost:8080', pathname: '/dir/path1/path2' }), 'http://localhost:8080/dir/path1/');
    LegacyUnit.equal(getDocumentBaseUrl({ protocol: 'http:', host: 'localhost', pathname: '/dir/path1/path2/file.html' }), 'http://localhost/dir/path1/path2/');
    LegacyUnit.equal(getDocumentBaseUrl({ protocol: 'http:', host: 'localhost', pathname: '/' }), 'http://localhost/');
    LegacyUnit.equal(getDocumentBaseUrl({ protocol: 'applewebdata:', href: 'applewebdata://something//dir/path1#hash' }), 'applewebdata://something//dir/');
    LegacyUnit.equal(getDocumentBaseUrl({ protocol: 'applewebdata:', href: 'applewebdata://something//dir/path1' }), 'applewebdata://something//dir/');
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
