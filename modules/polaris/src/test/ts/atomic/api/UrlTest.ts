import { Assert, context, describe, it } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';

import * as Url from 'ephox/polaris/api/Url';

describe('atomic.polaris.api.UrlTest', () => {
  context('extractHost', () => {
    const hostMap: Record<string, string> = {
      'www.google.com.au': 'google.com.au',
      'www.google.com.au:80': 'google.com.au',
      'maurizio@ephox.com': 'ephox.com',
      'http://www.ephox.com': 'ephox.com',
      'https://www.google.it': 'google.it',
      'mailto:maurizio@ephox.com': 'ephox.com',
      'maurizio.napoleoni@ephox.com': 'ephox.com',
      'http://maurizio@ephox.com:3443/mystuff': 'ephox.com',
      'maurizio-napoleoni-email@gmail.com': 'gmail.com',
      'http://link/': 'link',
      'https://www.google.com.au/search?espv=2&q=hello+world&oq=hello+world&gs_l=serp.3..0l10.12435.15279.0.15482.13.9.0.3.3.0.241.1121.0j1j4.5.0.msedr...0...1c.1.64.serp..5.8.1125.GLORIzEXy3Y': 'google.com.au',
      'https://icmobile4.rtp.raleigh.ibm.com/files/app#/file/d0f8ed3e-f6d2-4577-8989-fa21ac332a20': 'icmobile4.rtp.raleigh.ibm.com',
      'https://www.google.com.aa/test.htm?$-_.+!*\'()test,test;test:test@=&': 'google.com.aa',
      'http://-.~_!$&\'()*+,;=:%40:80%2f::::::@example.com?-.~_!$&\'()*+,;=:%40:80%2f::::::@e#-.~_!$&\'()*+,;=:%40:80%2f::::::@e': 'e',
      'http://xn--domain.com': 'xn--domain.com',
      'www.google.ca/index.htm?id=/bla/bla': 'google.ca',
      'https://www.amazon.com.au/gp/product/B0798R2WXG/ref=s9_acsd_top_hd_bw_b5QhTfX_c_x_w?pf_rd_m=ANEGB3WVEVKZB&pf_rd_s=merchandised-search-4&pf_rd_r=KF6SD7C0M69MKF2FR9CC&pf_rd_t=101&pf_rd_p=8ad3bdba-b846-5350-9c00-72c2cb7191dd&pf_rd_i=4975211051':
        'amazon.com.au',
      'https://www.birddoctor.net/refId,56511/refDownload.pml': 'birddoctor.net',
      'https://www.example.com/:w:/s/b026324c6904b2a9cb4b88d6d61c81d1?q=abc123': 'example.com',
      'https://website.com/test/!test': 'website.com',
      'http://foo.com/blah_blah': 'foo.com',
      'http://foo.com/blah_blah/': 'foo.com',
      'http://foo.com/blah_blah_(wikipedia)': 'foo.com',
      'http://foo.com/blah_blah_(wikipedia)_(again)': 'foo.com',
      'http://www.example.com/wpstyle/?p=364': 'example.com',
      'https://www.example.com/foo/?bar=baz&inga=42&quux': 'example.com',
      'http://userid:password@example.com:8080': 'example.com',
      'http://userid:password@example.com:8080/': 'example.com',
      'http://userid@example.com': 'example.com',
      'http://userid@example.com/': 'example.com',
      'http://userid@example.com:8080': 'example.com',
      'http://userid@example.com:8080/': 'example.com',
      'http://userid:password@example.com': 'example.com',
      'http://userid:password@example.com/': 'example.com',
      'http://142.42.1.1/': '142.42.1.1',
      'http://142.42.1.1:8080/': '142.42.1.1',
      'http://foo.com/blah_(wikipedia)#cite-1': 'foo.com',
      'http://foo.com/blah_(wikipedia)_blah#cite-1': 'foo.com',
      'http://foo.com/(something)?after=parens': 'foo.com',
      'http://code.google.com/events/#&product=browser': 'code.google.com',
      'http://j.mp': 'j.mp',
      'ftp://foo.bar/baz': 'foo.bar',
      'http://foo.bar/?q=Test%20URL-encoded%20stuff': 'foo.bar',
      'http://-.~_!$&\'()*+,;=:%40:80%2f::::::@example.com': 'example.com',
      'http://1337.net': '1337.net',
      'http://a.b-c.de': 'a.b-c.de',
      'http://223.255.255.254': '223.255.255.254',
      'h://foo.com': 'foo.com',
      'h1://foo.com': 'foo.com',
      'h1+://foo.com': 'foo.com',
      'h1+.://foo.com': 'foo.com',
      'h1+.-://foo.com': 'foo.com',
      'p72internal://foo.com': 'foo.com',
      'but15characters://foo.com': 'foo.com'
    };

    Obj.each(hostMap, (v, k) => {
      it(`TINY-10350: Should correctly extract ${v} from ${k}`, () => {
        const host = Url.extractHost(k).getOrDie();
        Assert.eq(`expected host to be ${v} but was ${host}`, v, host);
      });
    });
  });
});
