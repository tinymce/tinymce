import Global from '../util/Global';
import { XMLHttpRequest } from '@ephox/dom-globals';

export default function () {
  const f: typeof XMLHttpRequest = Global.getOrDie('XMLHttpRequest');
  return new f();
};