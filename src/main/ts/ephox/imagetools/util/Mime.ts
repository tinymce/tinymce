import { document } from '@ephox/dom-globals';

function getUriPathName(uri: string): string {
  const a = document.createElement('a');
  a.href = uri;
  return a.pathname;
}

function guessMimeType(uri: string): string {
  if (uri.indexOf('data:') === 0) {
    const parts = uri.split(',');
    const matches = /data:([^;]+)/.exec(parts[0]);
    return matches ? matches[1] : '';
  } else {
    const mimes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png'
    };

    const parts = getUriPathName(uri).split('.');
    let ext = parts[parts.length - 1];

    if (ext) {
      ext = ext.toLowerCase();
    }
    return mimes[ext];
  }
}

export {
  guessMimeType
};