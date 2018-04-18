import * as Memento from 'ephox/alloy/api/component/Memento';
import { Form } from 'ephox/alloy/api/ui/Form';
import { FormField } from 'ephox/alloy/api/ui/FormField';
import { Input } from 'ephox/alloy/api/ui/Input';

import { Slider } from 'ephox/alloy/api/ui/Slider';

import * as Behaviour from '../../api/behaviour/Behaviour';


import * as AlloyParts from '../../parts/AlloyParts';


import { Composing } from '../../api/behaviour/Composing';

const make = function (detail, components, spec, externals) {

  // Making this a simple spec and then we'll introduce where they put the body

  return {
    uid: detail.uid(),
    dom: detail.dom(),

    behaviours: Behaviour.derive([
      Composing.config({
        find: function (comp) {
          // Make Composing.getCurrent return the form
          return AlloyParts.getPart(comp, detail, 'body');
        }
      })
    ]),

    components: components
  };
};

export {
  make
};