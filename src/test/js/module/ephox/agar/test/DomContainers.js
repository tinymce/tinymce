import Step from 'ephox/agar/api/Step';
import { Attr } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';

var mSetup = Step.stateful(function (state, next, die) {
  var container = Element.fromTag('div');
  Attr.set(container, 'tabindex', '-1');
  Attr.set(container, 'test-id', 'true');

  var input = Element.fromTag('input');
  Insert.append(container, input);

  Insert.append(Element.fromDom(document.body), container);
  next({
    container: container,
    input: input
  });
});

var mTeardown = Step.stateful(function (state, next, die) {
  Remove.remove(state.container);
  next(state);
});

export default <any> {
  mSetup: mSetup,
  mTeardown: mTeardown
};