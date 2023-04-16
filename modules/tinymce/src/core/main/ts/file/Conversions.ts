import { Optional, Strings } from '@ephox/katamari';

/**
 * Converts blob/uris back and forth.
 *
 * @private
 * @class tinymce.file.Conversions
 */

interface DataUriResult {
  readonly type: string;
  readonly data: string;
  readonly base64Encoded: boolean;
}

const blobUriToBlob = (url: string): Promise<Blob> =>
  fetch(url)
    .then((res) => res.ok ? res.blob() : Promise.reject())
    .catch(() => Promise.reject({
      message: `Cannot convert ${url} to Blob. Resource might not exist or is inaccessible.`,
      uriType: 'blob'
    }));

const extractBase64Data = (data: string): string => {
  const matches = /([a-z0-9+\/=\s]+)/i.exec(data);
  return matches ? matches[1] : '';
};

const parseDataUri = (uri: string): Optional<DataUriResult> => {
  const [ type, ...rest ] = uri.split(',');
  const data = rest.join(',');

  const matches = /data:([^/]+\/[^;]+)(;.+)?/.exec(type);
  if (matches) {
    const base64Encoded = matches[2] === ';base64';
    const extractedData = base64Encoded ? extractBase64Data(data) : decodeURIComponent(data);
    return Optional.some({
      type: matches[1],
      data: extractedData,
      base64Encoded
    });
  } else {
    return Optional.none();
  }
};

const buildBlob = (type: string, data: string, base64Encoded: boolean = true): Optional<Blob> => {
  let str = data;

  if (base64Encoded) {
    // Might throw error if data isn't proper base64
    try {
      str = atob(data);
    } catch (e) {
      return Optional.none();
    }
  }

  const arr = new Uint8Array(str.length);

  for (let i = 0; i < arr.length; i++) {
    arr[i] = str.charCodeAt(i);
  }

  return Optional.some(new Blob([ arr ], { type }));
};

const dataUriToBlob = (uri: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    parseDataUri(uri)
      .bind(({ type, data, base64Encoded }) => buildBlob(type, data, base64Encoded))
      .fold(
        () => reject('Invalid data URI'),
        resolve
      );
  });
};

const uriToBlob = (url: string): Promise<Blob> => {
  if (Strings.startsWith(url, 'blob:')) {
    return blobUriToBlob(url);
  } else if (Strings.startsWith(url, 'data:')) {
    return dataUriToBlob(url);
  } else {
    return Promise.reject('Unknown URI format');
  }
};

const blobToDataUri = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(reader.error?.message);
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
