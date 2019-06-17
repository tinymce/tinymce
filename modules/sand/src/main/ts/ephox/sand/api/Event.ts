import Global from '../util/Global';
import { Event, EventInit } from '@ephox/dom-globals';

export default function (typeArg: string, eventInitDict?: EventInit) {
  const f: typeof Event = Global.getOrDie('Event');
  return new f(typeArg, eventInitDict);
};