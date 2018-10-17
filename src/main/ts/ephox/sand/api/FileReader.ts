import Global from '../util/Global';
import { FileReader } from '@ephox/dom-globals';

export default function () {
  const f: typeof FileReader = Global.getOrDie('FileReader');
  return new f();
};