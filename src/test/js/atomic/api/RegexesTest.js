test(
  'RegexesTest',

  [
    'ephox.compass.Arr',
    'ephox.polaris.api.Regexes'
  ],

  function (Arr, Regexes) {
    var ephoxCases = [
      'www.google.com.au',
      'maurizio@ephox.com',
      'http://www.ephox.com',
      'https://www.google.it',
      'mailto:maurizio@ephox.com',
      'maurizio.napoleoni@ephox.com',
      'http://maurizio@ephox.com:3443/mystuff',
      'maurizio-napoleoni-email@gmail.com',
      'http://link/',
      'https://www.google.com.au/search?espv=2&q=hello+world&oq=hello+world&gs_l=serp.3..0l10.12435.15279.0.15482.13.9.0.3.3.0.241.1121.0j1j4.5.0.msedr...0...1c.1.64.serp..5.8.1125.GLORIzEXy3Y',
      'https://icmobile4.rtp.raleigh.ibm.com/files/app#/file/d0f8ed3e-f6d2-4577-8989-fa21ac332a20',
      "https://www.google.com.aa/test.htm?$-_.+!*'()test,test;test:test@=&",
      "http://-.~_!$&'()*+,;=:%40:80%2f::::::@example.com?-.~_!$&'()*+,;=:%40:80%2f::::::@e#-.~_!$&'()*+,;=:%40:80%2f::::::@e",
      'http://xn--domain.com'
    ];

    // More cases, http://formvalidation.io/validators/uri/
    var mathiasBynens = [
      'http://foo.com/blah_blah',
      'http://foo.com/blah_blah/',
      'http://foo.com/blah_blah_(wikipedia)',
      'http://foo.com/blah_blah_(wikipedia)_(again)',
      'http://www.example.com/wpstyle/?p=364',
      'https://www.example.com/foo/?bar=baz&inga=42&quux',
      'http://userid:password@example.com:8080',
      'http://userid:password@example.com:8080/',
      'http://userid@example.com',
      'http://userid@example.com/',
      'http://userid@example.com:8080',
      'http://userid@example.com:8080/',
      'http://userid:password@example.com',
      'http://userid:password@example.com/',
      'http://142.42.1.1/',
      'http://142.42.1.1:8080/',
      'http://foo.com/blah_(wikipedia)#cite-1',
      'http://foo.com/blah_(wikipedia)_blah#cite-1',
      'http://foo.com/(something)?after=parens',
      'http://code.google.com/events/#&product=browser',
      'http://j.mp',
      'ftp://foo.bar/baz',
      'http://foo.bar/?q=Test%20URL-encoded%20stuff',
      "http://-.~_!$&'()*+,;=:%40:80%2f::::::@example.com",
      'http://1337.net',
      'http://a.b-c.de',
      'http://223.255.255.254'

      // TODO: unicode matches for true multilingal matches, ES6 should have this ability
      // 'http://مثال.إختبار',
      // 'http://例子.测试',
      // 'http://उदाहरण.परीक्षा',
      // 'http://✪df.ws/123',
      // 'http://➡.ws/䨹',
      // 'http://⌘.ws',
      // 'http://⌘.ws/',
      // 'http://foo.com/unicode_(✪)_in_parens',
      // // 'http://☺.damowmow.com/',
    ];

    var trueCases = ephoxCases.concat(mathiasBynens);

    var ephoxFalseCases = [
      'I am not a link',
      '#hashtag',
      '@mention',
      '[~jiramention]',
      'aSimpleString',
      'something.containing.dots',
      '',
      '\n',
      '',
      'http://google.com.',
      'http://google.com)'
    ];

    var mathiasBynensFalse = [
      'http://',
      'http://foo.bar?q=Spaces should be encoded',
      'http:// shouldfail.com',
      'http://foo.bar/foo(bar)baz quux',
      'foo.com',
      'h://test',
      ':// should fail',
      'http://?',
      'http://??',
      'http://??/',
      'http://#',
      'http://##',
      'http://##/',
      '//',
      '//a',
      '///a',
      '///',
      'http:///a'


      // TODO: requires more lookbehind assertions and much permutations.
      // 'http://.',
      // 'http://..',
      // 'http://../',
      // 'rdar://1234',
      // 'ftps://foo.bar/',
      // 'http://-error-.invalid/',
      // 'http://a.b--c.de/',
      // 'http://-a.b.co',
      // 'http://a.b-.co',
      // 'http://0.0.0.0',
      // 'http://10.1.1.0',
      // 'http://10.1.1.255',
      // 'http://224.1.1.1',
      // 'http://1.1.1.1.1',
      // 'http://123.123.123',
      // 'http://3628126748',
      // 'http://.www.foo.bar/',
      // 'http://www.foo.bar./',
      // 'http://.www.foo.bar./',
      // 'http://10.1.1.1'
    ];

    var falseCases = ephoxFalseCases.concat(mathiasBynensFalse);

    Arr.each(trueCases, function (cs) {
      var matched = cs.match(Regexes.link());
      assert.eq(cs, matched !== null && matched[0], 'expected true but was false: ' + cs);
    });

    Arr.each(falseCases, function (cs) {
      var match = Regexes.link().test(cs);
      var asserter = match === false ? match : (cs === cs.match(Regexes.link())[0]);
      assert.eq(false, asserter, 'expected false but was true: ' + cs);
    });

  }
);