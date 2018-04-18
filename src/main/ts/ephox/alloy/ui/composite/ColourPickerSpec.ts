import * as Memento from 'ephox/alloy/api/component/Memento';
import { Form } from 'ephox/alloy/api/ui/Form';
import { FormField } from 'ephox/alloy/api/ui/FormField';
import { Input } from 'ephox/alloy/api/ui/Input';

import { Slider } from 'ephox/alloy/api/ui/Slider';

const make = function (detail, components, spec, externals) {

  // Making this a simple spec and then we'll introduce where they put the body

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: components
  };
};

export {
  make
};