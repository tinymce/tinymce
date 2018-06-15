import { ValueSchema } from '@ephox/boulder';
import { Arr, Cell, Fun, Merger, Type } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import { Traverse } from '@ephox/sugar';

import BehaviourBlob from '../../behaviour/common/BehaviourBlob';
import * as ComponentDom from '../../construct/ComponentDom';
import * as ComponentEvents from '../../construct/ComponentEvents';
import * as CustomDefinition from '../../construct/CustomDefinition';
import * as DomModification from '../../dom/DomModification';
import * as DomRender from '../../dom/DomRender';
import { NoContextApi } from '../system/NoContextApi';
import * as GuiTypes from '../ui/GuiTypes';
import * as CompBehaviours from './CompBehaviours';
import { ComponentApi, AlloyComponent } from './ComponentApi';
import { SimpleOrSketchSpec } from '../../api/component/SpecTypes';

const build = (spec: SimpleOrSketchSpec): AlloyComponent => {
  const getMe = () => {
    return me;
  };

  const systemApi = Cell(NoContextApi(getMe));

  const info = ValueSchema.getOrDie(CustomDefinition.toInfo(Merger.deepMerge(
    spec,
    {behaviours: undefined}
  )));

  // The behaviour configuration is put into info.behaviours(). For everything else,
  // we just need the list of static behaviours that this component cares about. The behaviour info
  // to pass through will come from the info.behaviours() obj.
  const bBlob = CompBehaviours.generate(spec);
  const bList = BehaviourBlob.getBehaviours(bBlob);
  const bData = BehaviourBlob.getData(bBlob);

  const definition = CustomDefinition.toDefinition(info);

  const baseModification = {
    'alloy.base.modification': CustomDefinition.toModification(info)
  };

  const modification = ComponentDom.combine(bData, baseModification, bList, definition).getOrDie();

  const modDefinition = DomModification.merge(definition, modification);

  const item = DomRender.renderToDom(modDefinition);

  const baseEvents = {
    'alloy.base.behaviour': CustomDefinition.toEvents(info)
  };

  const events = ComponentEvents.combine(bData, info.eventOrder(), bList, baseEvents).getOrDie();

  const subcomponents = Cell(info.components());

  const connect = (newApi) => {
    systemApi.set(newApi);
  };

  const disconnect = () => {
    systemApi.set(NoContextApi(getMe));
  };

  const syncComponents = () => {
    // Update the component list with the current children
    const children = Traverse.children(item);
    const subs = Arr.bind(children, (child) => {

      return systemApi.get().getByDom(child).fold(() => {
        // INVESTIGATE: Not sure about how to handle text nodes here.
        return [ ];
      }, (c) => {
        return [ c ];
      });
    });
    subcomponents.set(subs);
  };

  const config = (behaviour) => {
    if (behaviour === GuiTypes.apiConfig()) { return info.apis(); }
    const b = bData;
    const f = Type.isFunction(b[behaviour.name()]) ? b[behaviour.name()] : () => {
      throw new Error('Could not find ' + behaviour.name() + ' in ' + Json.stringify(spec, null, 2));
    };
    return f();
  };

  const hasConfigured = (behaviour) => {
    return Type.isFunction(bData[behaviour.name()]);
  };

  const readState = (behaviourName) => {
    return bData[behaviourName]().map((b) => {
      return b.state.readState();
    }).getOr('not enabled');
  };

  const me = ComponentApi({
    getSystem: systemApi.get,
    config,
    hasConfigured,
    spec: Fun.constant(spec),
    readState,

    connect,
    disconnect,
    element: Fun.constant(item),
    syncComponents,
    components: subcomponents.get,
    events: Fun.constant(events)
  });

  return me;
};

export {
  build
};