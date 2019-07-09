import { Fun, Strings } from '@ephox/katamari';

export interface PlatformInfo {
  name: string;
  versionRegexes: RegExp[];
  search: (uastring: string) => boolean;
}

const normalVersionRegex = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/;

const checkContains = function (target: string) {
  return function (uastring: string) {
    return Strings.contains(uastring, target);
  };
};

const browsers: PlatformInfo[] = [
  {
    name : 'Edge',
    versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
    search (uastring) {
      return Strings.contains(uastring, 'edge/') && Strings.contains(uastring, 'chrome') && Strings.contains(uastring, 'safari') && Strings.contains(uastring, 'applewebkit');
    }
  },
  {
    name : 'Chrome',
    versionRegexes: [/.*?chrome\/([0-9]+)\.([0-9]+).*/, normalVersionRegex],
    search (uastring) {
      return Strings.contains(uastring, 'chrome') && !Strings.contains(uastring, 'chromeframe');
    }
  },
  {
    name : 'IE',
    versionRegexes: [/.*?msie\ ?([0-9]+)\.([0-9]+).*/, /.*?rv:([0-9]+)\.([0-9]+).*/],
    search (uastring) {
      return Strings.contains(uastring, 'msie') || Strings.contains(uastring, 'trident');
    }
  },
  // INVESTIGATE: Is this still the Opera user agent?
  {
    name : 'Opera',
    versionRegexes: [normalVersionRegex, /.*?opera\/([0-9]+)\.([0-9]+).*/],
    search : checkContains('opera')
  },
  {
    name : 'Firefox',
    versionRegexes: [/.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/],
    search : checkContains('firefox')
  },
  {
    name : 'Safari',
    versionRegexes: [normalVersionRegex, /.*?cpu os ([0-9]+)_([0-9]+).*/],
    search (uastring) {
      return (Strings.contains(uastring, 'safari') || Strings.contains(uastring, 'mobile/')) && Strings.contains(uastring, 'applewebkit');
    }
  }
];

const oses: PlatformInfo[] = [
  {
    name : 'Windows',
    search : checkContains('win'),
    versionRegexes: [/.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/]
  },
  {
    name : 'iOS',
    search (uastring) {
      return Strings.contains(uastring, 'iphone') || Strings.contains(uastring, 'ipad');
    },
    versionRegexes: [/.*?version\/\ ?([0-9]+)\.([0-9]+).*/, /.*cpu os ([0-9]+)_([0-9]+).*/, /.*cpu iphone os ([0-9]+)_([0-9]+).*/]
  },
  {
    name : 'Android',
    search : checkContains('android'),
    versionRegexes: [/.*?android\ ?([0-9]+)\.([0-9]+).*/]
  },
  {
    name : 'OSX',
    search : checkContains('os x'),
    versionRegexes: [/.*?os\ x\ ?([0-9]+)_([0-9]+).*/]
  },
  {
    name : 'Linux',
    search : checkContains('linux'),
    versionRegexes: [ ]
  },
  { name : 'Solaris',
    search : checkContains('sunos'),
    versionRegexes: [ ]
  },
  {
   name : 'FreeBSD',
   search : checkContains('freebsd'),
   versionRegexes: [ ]
  }
];

export const PlatformInfo = {
  browsers: Fun.constant(browsers),
  oses: Fun.constant(oses)
};
