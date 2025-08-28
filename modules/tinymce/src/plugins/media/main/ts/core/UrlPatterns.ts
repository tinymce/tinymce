import { Type } from '@ephox/katamari';

import Tools from 'tinymce/core/api/util/Tools';

export interface UrlPattern {
  readonly regex: RegExp;
  readonly type: 'iframe';
  readonly w: number;
  readonly h: number;
  readonly url: string;
  readonly allowFullscreen: boolean;
}

const urlPatterns: UrlPattern[] = [
  {
    regex: /youtu\.be\/([\w\-_\?&=.]+)/i,
    type: 'iframe', w: 560, h: 314,
    url: 'www.youtube.com/embed/$1',
    allowFullscreen: true
  },
  {
    regex: /youtube\.com(.+)v=([^&]+)(&([a-z0-9&=\-_]+))?/i,
    type: 'iframe', w: 560, h: 314,
    url: 'www.youtube.com/embed/$2?$4',
    allowFullscreen: true
  },
  {
    regex: /youtube.com\/embed\/([a-z0-9\?&=\-_]+)/i,
    type: 'iframe', w: 560, h: 314,
    url: 'www.youtube.com/embed/$1',
    allowFullscreen: true
  },
  {
    regex: /vimeo\.com\/([0-9]+)\?h=(\w+)/,
    type: 'iframe', w: 425, h: 350,
    url: 'player.vimeo.com/video/$1?h=$2&title=0&byline=0&portrait=0&color=8dc7dc',
    allowFullscreen: true
  },
  {
    regex: /vimeo\.com\/(.*)\/([0-9]+)\?h=(\w+)/,
    type: 'iframe', w: 425, h: 350,
    url: 'player.vimeo.com/video/$2?h=$3&title=0&amp;byline=0',
    allowFullscreen: true
  },
  {
    regex: /vimeo\.com\/([0-9]+)/,
    type: 'iframe', w: 425, h: 350,
    url: 'player.vimeo.com/video/$1?title=0&byline=0&portrait=0&color=8dc7dc',
    allowFullscreen: true
  },
  {
    regex: /vimeo\.com\/(.*)\/([0-9]+)/,
    type: 'iframe', w: 425, h: 350,
    url: 'player.vimeo.com/video/$2?title=0&amp;byline=0',
    allowFullscreen: true
  },
  {
    regex: /maps\.google\.([a-z]{2,3})\/maps\/(.+)msid=(.+)/,
    type: 'iframe', w: 425, h: 350,
    url: 'maps.google.com/maps/ms?msid=$2&output=embed"',
    allowFullscreen: false
  },
  {
    regex: /dailymotion\.com\/video\/([^_]+)/,
    type: 'iframe', w: 480, h: 270,
    url: 'www.dailymotion.com/embed/video/$1',
    allowFullscreen: true
  },
  {
    regex: /dai\.ly\/([^_]+)/,
    type: 'iframe', w: 480, h: 270,
    url: 'www.dailymotion.com/embed/video/$1',
    allowFullscreen: true
  }
];

const getProtocol = (url: string): string => {
  const protocolMatches = url.match(/^(https?:\/\/|www\.)(.+)$/i);
  if (protocolMatches && protocolMatches.length > 1) {
    return protocolMatches[1] === 'www.' ? 'https://' : protocolMatches[1];
  } else {
    return 'https://';
  }
};

const getUrl = (pattern: UrlPattern, url: string): string => {
  const protocol = getProtocol(url);

  const match = pattern.regex.exec(url);
  let newUrl = protocol + pattern.url;
  if (Type.isNonNullable(match)) {
    for (let i = 0; i < match.length; i++) {
      newUrl = newUrl.replace('$' + i, () => match[i] ? match[i] : '');
    }
  }

  return newUrl.replace(/\?$/, '');
};

const matchPattern = (url: string): UrlPattern | null => {
  const patterns = urlPatterns.filter((pattern) => pattern.regex.test(url));

  if (patterns.length > 0) {
    return Tools.extend({}, patterns[0], { url: getUrl(patterns[0], url) });
  } else {
    return null;
  }
};

export {
  matchPattern
};
