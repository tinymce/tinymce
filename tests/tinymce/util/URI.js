module("tinymce.util.URI");

test('protocol relative url', function() {
	var uri = new tinymce.util.URI('//www.site.com/dir1/file?query#hash');

	equal(uri.protocol, "");
	equal(uri.host, "www.site.com");
	equal(uri.path, "/dir1/file");
	equal(uri.query, "query");
	equal(uri.anchor, "hash");
	equal(uri.source, "//www.site.com/dir1/file?query#hash");
	equal(uri.getURI(), "//www.site.com/dir1/file?query#hash");
	equal(uri.toRelative('//www.site.com/dir1/file2'), 'file2');
	equal(uri.toRelative('//www.site2.com/dir1/file2'), '//www.site2.com/dir1/file2');
	equal(uri.toAbsolute('../file2'), '//www.site.com/dir1/file2');
	equal(uri.toAbsolute('//www.site2.com/dir1/file2'), '//www.site2.com/dir1/file2');
});

test('parseFullURLs', 3, function() {
	equal(new tinymce.util.URI('http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash').getURI(), 'http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash');
	ok(new tinymce.util.URI('http://a2bc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash').getURI() != 'http://abc:123@www.site.com:8080/path/dir/file.ext?key1=val1&key2=val2#hash');
	equal(new tinymce.util.URI('chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890:8080/path/dir/file.ext?key1=val1&key2=val2#hash').getURI(), 'chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890:8080/path/dir/file.ext?key1=val1&key2=val2#hash');
});

test('relativeURLs', 31, function() {
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/file.html').toRelative('http://www.site.com/dir1/dir3/file.html'), '../dir3/file.html');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/file.html').toRelative('http://www.site.com/dir3/dir4/file.html'), '../../dir3/dir4/file.html');
	equal(new tinymce.util.URI('http://www.site.com/dir1/').toRelative('http://www.site.com/dir1/dir3/file.htm'), 'dir3/file.htm');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site2.com/dir1/dir3/file.htm'), 'http://www.site2.com/dir1/dir3/file.htm');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site.com:8080/dir1/dir3/file.htm'), 'http://www.site.com:8080/dir1/dir3/file.htm');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('https://www.site.com/dir1/dir3/file.htm'), 'https://www.site.com/dir1/dir3/file.htm');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm'), '../../file.htm');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm?id=1#a'), '../../file.htm?id=1#a');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('mailto:test@test.com'), 'mailto:test@test.com');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('news:test'), 'news:test');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('javascript:void(0);'), 'javascript:void(0);');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('about:blank'), 'about:blank');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('#test'), '#test');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('test.htm'), 'test.htm');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('http://www.site.com/dir1/dir2/test.htm'), 'test.htm');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('dir2/test.htm'), 'dir2/test.htm');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('../dir2/test.htm'), 'test.htm');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('../dir3/'), '../dir3/');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('../../../../../../test.htm'), '../../test.htm');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('//www.site.com/test.htm'), '../../test.htm');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('@@tinymce'), '@@tinymce'); // Zope 3 URL
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('../@@tinymce'), '../@@tinymce'); // Zope 3 URL
	equal(new tinymce.util.URI('http://www.site.com/').toRelative('dir2/test.htm'), 'dir2/test.htm');
	equal(new tinymce.util.URI('http://www.site.com/').toRelative('./'), './');
	equal(new tinymce.util.URI('http://www.site.com/test/').toRelative('../'), '../');
	equal(new tinymce.util.URI('http://www.site.com/test/test/').toRelative('../'), '../');
	equal(new tinymce.util.URI('chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890/dir1/dir2/').toRelative('/dir1', true), '../');
	equal(new tinymce.util.URI('http://www.site.com/').toRelative('http://www.site.com/'), 'http://www.site.com/');
	equal(new tinymce.util.URI('http://www.site.com/').toRelative('http://www.site.com'), 'http://www.site.com/');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm?q=http://site.com/'), '../../file.htm?q=http://site.com/');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toRelative('/file.htm#http://site.com/'), '../../file.htm#http://site.com/');
});

test('absoluteURLs', 19, function() {
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute(''), 'http://www.site.com/dir1/dir2/');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('../dir3'), 'http://www.site.com/dir1/dir3');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('../dir3', 1), '/dir1/dir3');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('../../../../dir3'), 'http://www.site.com/dir3');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('../abc/def/../../abc/../dir3/file.htm'), 'http://www.site.com/dir1/dir3/file.htm');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('http://www.site.com/dir2/dir3'), 'http://www.site.com/dir2/dir3');
	equal(new tinymce.util.URI('http://www.site2.com/dir1/dir2/').toAbsolute('http://www.site2.com/dir2/dir3'), 'http://www.site2.com/dir2/dir3');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('mailto:test@test.com'), 'mailto:test@test.com');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('news:test'), 'news:test');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('javascript:void(0);'), 'javascript:void(0);');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('about:blank'), 'about:blank');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('#test'), '#test');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('test.htm'), 'http://www.site.com/dir1/dir2/test.htm');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('../@@tinymce'), 'http://www.site.com/dir1/@@tinymce'); // Zope 3 URL
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').getURI(), 'http://www.site.com/dir1/dir2/');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('/dir1/dir1/'), 'http://www.site.com/dir1/dir1/');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('https://www.site.com/dir1/dir2/', true), 'https://www.site.com/dir1/dir2/');
	equal(new tinymce.util.URI('http://www.site.com/dir1/dir2/').toAbsolute('http://www.site.com/dir1/dir2/', true), '/dir1/dir2/');
	equal(new tinymce.util.URI('chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890/dir1/dir2/').toAbsolute('chrome-extension://abcdefghijklmnopqrstuvwzyz1234567890/dir1/dir2/', true), '/dir1/dir2/');
});

test('strangeURLs', 6, function() {
	equal(new tinymce.util.URI('//www.site.com').getURI(), '//www.site.com');
	equal(new tinymce.util.URI('mailto:test@test.com').getURI(), 'mailto:test@test.com');
	equal(new tinymce.util.URI('news:somegroup').getURI(), 'news:somegroup');
	equal(new tinymce.util.URI('skype:somegroup').getURI(), 'skype:somegroup');
	equal(new tinymce.util.URI('tel:somegroup').getURI(), 'tel:somegroup');
	equal(new tinymce.util.URI('//www.site.com/a@b').getURI(), '//www.site.com/a@b');
});

test('isSameOrigin', function() {
	ok(new tinymce.util.URI('http://www.site.com').isSameOrigin(new tinymce.util.URI('http://www.site.com')));
	ok(new tinymce.util.URI('//www.site.com').isSameOrigin(new tinymce.util.URI('//www.site.com')));
	ok(new tinymce.util.URI('http://www.site.com:80').isSameOrigin(new tinymce.util.URI('http://www.site.com')));
	ok(new tinymce.util.URI('https://www.site.com:443').isSameOrigin(new tinymce.util.URI('https://www.site.com')));
	ok(new tinymce.util.URI('//www.site.com:80').isSameOrigin(new tinymce.util.URI('//www.site.com:80')));
	ok(new tinymce.util.URI('mailto:test@site.com').isSameOrigin(new tinymce.util.URI('mailto:test@site.com')));
	ok(new tinymce.util.URI('mailto:test@site.com:25').isSameOrigin(new tinymce.util.URI('mailto:test@site.com')));
	ok(new tinymce.util.URI('ftp://www.site.com').isSameOrigin(new tinymce.util.URI('ftp://www.site.com')));
	ok(new tinymce.util.URI('ftp://www.site.com:21').isSameOrigin(new tinymce.util.URI('ftp://www.site.com')));
	ok(new tinymce.util.URI('https://www.site.com').isSameOrigin(new tinymce.util.URI('http://www.site.com')) == false);
	ok(new tinymce.util.URI('http://www.site.com:8080').isSameOrigin(new tinymce.util.URI('http://www.site.com')) == false);
	ok(new tinymce.util.URI('https://www.site.com:8080').isSameOrigin(new tinymce.util.URI('https://www.site.com')) == false);
	ok(new tinymce.util.URI('ftp://www.site.com:1021').isSameOrigin(new tinymce.util.URI('ftp://www.site.com')) == false);
});
