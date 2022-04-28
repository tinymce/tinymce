import { Optional } from '@ephox/katamari';

/**
 * Converts blob/uris back and forth.
 *
 * @private
 * @class tinymce.file.Conversions
 */

interface DataUriResult {
  readonly type: string | undefined;
  readonly data: string;
}

const blobUriToBlob = (url: string): Promise<Blob> =>
  fetch(url)
    .then((res) => res.ok ? res.blob() : Promise.reject())
    .catch(() => Promise.reject(`Cannot convert ${url} to Blob. Resource might not exist or is inaccessible.`));

const parseDataUri = (uri: string): DataUriResult => {
  let type: string | undefined;

  const uriParts = decodeURIComponent(uri).split(',');

  const matches = /data:([^;]+)/.exec(uriParts[0]);
  if (matches) {
    type = matches[1];
  }

  return {
    type,
    data: uriParts[1]
  };
};

const buildBlob = (type: string, data: string): Optional<Blob> => {
  let str: string;

  // Might throw error if data isn't proper base64
  try {
    str = atob(data);
  } catch (e) {
    return Optional.none();
  }

  const arr = new Uint8Array(str.length);

  for (let i = 0; i < arr.length; i++) {
    arr[i] = str.charCodeAt(i);
  }

  return Optional.some(new Blob([ arr ], { type }));
};

const dataUriToBlob = (uri: string): Promise<Blob> => {
  return new Promise((resolve) => {
    const { type, data } = parseDataUri(uri);

    buildBlob(type, data).fold(
      () => resolve(new Blob([])), // TODO: Consider rejecting here instead
      resolve
    );
  });
};

const uriToBlob = (url: string): Promise<Blob> => {
  if (url.indexOf('blob:') === 0) {
    return blobUriToBlob(url);
  }

  if (url.indexOf('data:') === 0) {
    return dataUriToBlob(url);
  }

  return null;
};

const blobToDataUri = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    reader.readAsDataURL(blob);
  });
};

export {
  buildBlob,
  uriToBlob,
  blobToDataUri,
  parseDataUri
};
