import Global from '../util/Global';
import { URL, File, Blob, MediaSource } from '@ephox/dom-globals';

/*
 * IE10 and above per
 * https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL
 *
 * Also Safari 6.1+
 * Safari 6.0 has 'webkitURL' instead, but doesn't support flexbox so we
 * aren't supporting it anyway
 */
const url = function (): typeof URL {
  return Global.getOrDie('URL');
};

const createObjectURL = function (blob: File | Blob | MediaSource) {
  return url().createObjectURL(blob);
};

const revokeObjectURL = function (u: string) {
  url().revokeObjectURL(u);
};

export default {
  createObjectURL: createObjectURL,
  revokeObjectURL: revokeObjectURL
};