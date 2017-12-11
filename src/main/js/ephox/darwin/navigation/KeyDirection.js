import Retries from '../keyboard/Retries';
import BeforeAfter from './BeforeAfter';
import { DomGather } from '@ephox/phoenix';
import { Traverse } from '@ephox/sugar';
import { Situ } from '@ephox/sugar';



export default <any> {
  down: {
    traverse: Traverse.nextSibling,
    gather: DomGather.after,
    relative: Situ.before,
    otherRetry: Retries.tryDown,
    ieRetry: Retries.ieTryDown,
    failure: BeforeAfter.adt.failedDown
  },
  up: {
    traverse: Traverse.prevSibling,
    gather: DomGather.before,
    relative: Situ.before,
    otherRetry: Retries.tryUp,
    ieRetry: Retries.ieTryUp,
    failure: BeforeAfter.adt.failedUp
  }
};