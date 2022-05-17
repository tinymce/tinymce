import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';

import * as Regexes from 'ephox/polaris/api/Regexes';

UnitTest.test('RegexesTest', () => {
  const ephoxCases = [
    'www.google.com.au',
    'www.google.com.au:80',
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
    `https://www.google.com.aa/test.htm?$-_.+!*'()test,test;test:test@=&`,
    `http://-.~_!$&'()*+,;=:%40:80%2f::::::@example.com?-.~_!$&'()*+,;=:%40:80%2f::::::@e#-.~_!$&'()*+,;=:%40:80%2f::::::@e`,
    'http://xn--domain.com',
    'www.google.ca/index.htm?id=/bla/bla',
    'https://www.amazon.com.au/gp/product/B0798R2WXG/ref=s9_acsd_top_hd_bw_b5QhTfX_c_x_w?pf_rd_m=ANEGB3WVEVKZB&pf_rd_s=merchandised-search-4&pf_rd_r=KF6SD7C0M69MKF2FR9CC&pf_rd_t=101&pf_rd_p=8ad3bdba-b846-5350-9c00-72c2cb7191dd&pf_rd_i=4975211051',
    'https://www.birddoctor.net/refId,56511/refDownload.pml',
    'https://www.example.com/:w:/s/b026324c6904b2a9cb4b88d6d61c81d1?q=abc123',
    'https://website.com/test/!test'
  ];

  // More cases, http://formvalidation.io/validators/uri/
  const mathiasBynens = [
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
    `http://-.~_!$&'()*+,;=:%40:80%2f::::::@example.com`,
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
    // 'http://☺.damowmow.com/',
  ];

  const validSchemes = [
    'h://foo.com',
    'h1://foo.com',
    'h1+://foo.com',
    'h1+.://foo.com',
    'h1+.-://foo.com',
    'p72internal://foo.com',
    'but15characters://foo.com',
  ];

  const trueCases = ephoxCases.concat(mathiasBynens).concat(validSchemes);

  const ephoxFalseCases = [
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
    'http://google.com)',
    'www.google.com.',
    'www.google.com)',
    'asdf:one'
  ];

  const mathiasBynensFalse = [
    'http://',
    'http://foo.bar?q=Spaces should be encoded',
    'http:// shouldfail.com',
    'http://foo.bar/foo(bar)baz quux',
    'foo.com',
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

  const invalidSchemes = [
    '1h://foo.com',
    '+h://foo.com',
    '.h://foo.com',
    '-h://foo.com',
    'h!://foo.com',
    'h/://foo.com',
    'h_://foo.com',
    'morethanfifteencharacters://foo.com',
  ];

  const falseCases = ephoxFalseCases.concat(mathiasBynensFalse).concat(invalidSchemes);

  Arr.each(trueCases, (cs) => {
    const matched = Regexes.link().exec(cs);
    Assert.eq('expected true but was false: ' + cs, cs, matched !== null && matched[0]);
    if (matched !== null && matched.length > 1) {
      // eslint-disable-next-line no-console
      console.log('matched groups:');
      Arr.each(matched, (s, i) => {
        // eslint-disable-next-line no-console
        console.log(i, s);
      });
      Assert.fail('link regex must not capture any groups');
    }
  });

  Arr.each(falseCases, (cs) => {
    const match = Regexes.link().exec(cs);
    Assert.eq('expected false but was true: ' + cs, false, match !== null && cs === match[0]);
  });

  const autolinks = { // Ignore trailing: \-_.~*+=!&;:\'%@?#^${}(),
    'http://google.com\\': 'http://google.com',
    // 'http://google.com-': 'http://google.com', // TODO: change Regexes so domain cant end in '-'
    'http://google.com_': 'http://google.com',
    'http://google.com.': 'http://google.com',
    'http://google.com~': 'http://google.com',
    'http://google.com*': 'http://google.com',
    'http://google.com+': 'http://google.com',
    'http://google.com=': 'http://google.com',
    'http://google.com!': 'http://google.com',
    'http://google.com&': 'http://google.com',
    'http://google.com;': 'http://google.com',
    'http://google.com:': 'http://google.com',
    'http://google.com\'': 'http://google.com',
    'http://google.com%': 'http://google.com',
    'http://google.com@': 'http://google.com',
    'http://google.com?': 'http://google.com',
    'http://google.com#': 'http://google.com',
    'http://google.com^': 'http://google.com',
    'http://google.com$': 'http://google.com',
    'http://google.com{': 'http://google.com',
    'http://google.com}': 'http://google.com',
    'http://google.com(': 'http://google.com',
    'http://google.com)': 'http://google.com',
    'http://google.com?x=y': 'http://google.com?x=y',
    'http://google.com#a-b_c': 'http://google.com#a-b_c',
    'http://google.com?x=y#a-b_c%20': 'http://google.com?x=y#a-b_c%20',
    'http://google.com?x=y&a=1&c=2#a-b_c%20': 'http://google.com?x=y&a=1&c=2#a-b_c%20',
    'http://google.com:80/a/path/ok/?x=y#a-b_c%20': 'http://google.com:80/a/path/ok/?x=y#a-b_c%20',
    'https://mike:pass@google.com:80/a/path/ok/?x=y#a-b_c%20': 'https://mike:pass@google.com:80/a/path/ok/?x=y#a-b_c%20',
    'http://eg.com?cc=you%40eg.com&x=y': 'http://eg.com?cc=you%40eg.com&x=y',
    'http://eg.com?m=bob%40eg.com': 'http://eg.com?m=bob%40eg.com',
    // same again with www.
    'www.google.com\\': 'www.google.com',
    // 'www.google.com-': 'www.google.com',  // see above comment for http://
    'www.google.com_': 'www.google.com',
    'www.google.com.': 'www.google.com',
    'www.google.com~': 'www.google.com',
    'www.google.com*': 'www.google.com',
    'www.google.com+': 'www.google.com',
    'www.google.com=': 'www.google.com',
    'www.google.com!': 'www.google.com',
    'www.google.com&': 'www.google.com',
    'www.google.com;': 'www.google.com',
    'www.google.com:': 'www.google.com',
    'www.google.com\'': 'www.google.com',
    'www.google.com%': 'www.google.com',
    'www.google.com@': 'www.google.com',
    'www.google.com?': 'www.google.com',
    'www.google.com#': 'www.google.com',
    'www.google.com^': 'www.google.com',
    'www.google.com$': 'www.google.com',
    'www.google.com{': 'www.google.com',
    'www.google.com}': 'www.google.com',
    'www.google.com(': 'www.google.com',
    'www.google.com)': 'www.google.com',
    'www.google.com:80/a/path/ok/?x=y#a-b_c%20': 'www.google.com:80/a/path/ok/?x=y#a-b_c%20',
    // Mailto
    'mailto:me@eg.com': 'mailto:me@eg.com',
    'mailto:me@eg.com.': 'mailto:me@eg.com',
    'mailto:me@eg.com?': 'mailto:me@eg.com',
    'mailto:me@eg.com)': 'mailto:me@eg.com',
    'mailto:me@eg.com?cc=you%40eg.com': 'mailto:me@eg.com?cc=you%40eg.com',
    // 'mailto:me@eg.com,you@eg.com': 'mailto:me@eg.com,you@eg.com', // not supported at the moment
    'mailto:me@eg.com?cc=you%40eg.com&x=y': 'mailto:me@eg.com?cc=you%40eg.com&x=y',
    // ftp
    'ftp://google.com': 'ftp://google.com',
    'ftp://google.com.': 'ftp://google.com',
    'ftp://google.com?': 'ftp://google.com',
    'ftp://google.com/a/b/c/d.e?v=2': 'ftp://google.com/a/b/c/d.e?v=2'
  };

  // remember don't inline the module function execution, JS regexes have state!
  Obj.each(autolinks, (v, k) => {
    const match = Regexes.autolink().exec(k);
    if (match !== null) {
      const url = match[1];
      Assert.eq('expected ' + v + ' but was "' + url + '"', true, v === url);
    } else {
      Assert.fail('expected ' + v + ' but did not match "' + k + '"');
    }
  });

  // Ignore trailing punctuation such as a comma, period and exclamation mark at the end of the URL path
  const onlyWithPathLinks = {
    'http://google.com': 'http://google.com',
    'http://google.com.': 'http://google.com',
    'http://google.com,': 'http://google.com',
    'http://google.com!': 'http://google.com',
    'http://google.com;': 'http://google.com',
    'http://google.com:': 'http://google.com',
    'http://google.com/,': 'http://google.com/',
    'http://google.com/,,': 'http://google.com/',
    'http://google.com/.': 'http://google.com/',
    'http://google.com/..': 'http://google.com/',
    'http://google.com/!': 'http://google.com/',
    'http://google.com/:': 'http://google.com/',
    'http://google.com/;': 'http://google.com/',
    'http://google.com/,/': 'http://google.com/,/',
    'http://google.com/,/,': 'http://google.com/,/',
    'http://google.com/abc': 'http://google.com/abc',
    'http://google.com/abc,': 'http://google.com/abc',
    'http://google.com/abc.': 'http://google.com/abc',
    'http://google.com/abc!': 'http://google.com/abc',
    'http://google.com/abc;': 'http://google.com/abc',
    'http://google.com/abc:': 'http://google.com/abc',
    'http://google.com/,ab,c': 'http://google.com/,ab,c',
    'http://google.com/ab,c': 'http://google.com/ab,c',
    'http://google.com/ab,c,': 'http://google.com/ab,c',
    'http://google.com/ab,c.': 'http://google.com/ab,c',
    'http://google.com/abc,d/,': 'http://google.com/abc,d/',
    'http://google.com/abc,d/.': 'http://google.com/abc,d/',
    'http://google.com/a,bc,d/,': 'http://google.com/a,bc,d/',
    'http://google.com/a,bc,d/.': 'http://google.com/a,bc,d/',
    'Visit, please, http://google.com/a,bc,d/. Good luck!': 'http://google.com/a,bc,d/',
  };

  Obj.each(onlyWithPathLinks, (v, k) => {
    const match = Regexes.link().exec(k);
    if (match !== null) {
      const url = match[0];
      Assert.eq('expected ' + v + ' but was "' + url + '"', true, v === url);
    } else {
      Assert.fail('expected ' + v + ' but did not match "' + k + '"');
    }
  });
});
