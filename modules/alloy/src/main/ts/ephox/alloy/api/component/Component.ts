import { ValueSchema } from '@ephox/boulder';
import { Arr, Cell, Fun, Option, Type } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import { Traverse } from '@ephox/sugar';

import { AlloyBehaviour } from '../../api/behaviour/Behaviour';
import { AlloySystemApi } from '../../api/system/SystemApi';
import * as BehaviourBlob from '../../behaviour/common/BehaviourBlob';
import { BehaviourState } from '../../behaviour/common/BehaviourState';
import * as ComponentDom from '../../construct/ComponentDom';
import * as ComponentEvents from '../../construct/ComponentEvents';
import * as CustomDefinition from '../../construct/CustomDefinition';
import { DomDefinitionDetail } from '../../dom/DomDefinition';
import * as DomModification from '../../dom/DomModification';
import * as DomRender from '../../dom/DomRender';
import { UncurriedHandler } from '../../events/EventRegistry';
import { NoContextApi, singleton } from '../system/NoContextApi';
import * as GuiTypes from '../ui/GuiTypes';
import * as CompBehaviours from './CompBehaviours';
import { AlloyComponent } from './ComponentApi';

// This is probably far too complicated. I think DomModification is probably
// questionable as a concept. Maybe it should be deprecated.
const getDomDefinition = (
  info: CustomDefinition.CustomDetail<any>,
  bList: Array<AlloyBehaviour<any, any>>,
  bData: Record<string, () => Option<BehaviourBlob.BehaviourConfigAndState<any, BehaviourState>>>
): DomDefinitionDetail => {
  // Get the current DOM definition from the spec
  const definition = CustomDefinition.toDefinition(info);

  // Get the current DOM modification definition from the spec
  const infoModification = CustomDefinition.toModification(info);

  // Treat the DOM modification like it came from a behaviour
  const baseModification = {
    'alloy.base.modification': infoModification
  };

  // Combine the modifications from any defined behaviours
  const modification = bList.length > 0 ? ComponentDom.combine(bData, baseModification, bList, definition) : infoModification;

  // Transform the DOM definition with the combined dom modifications to make a new DOM definition
  return DomModification.merge(definition, modification);
};

const getEvents = (
  info: CustomDefinition.CustomDetail<any>,
  bList: Array<AlloyBehaviour<any, any>>,
  bData: Record<string, () => Option<BehaviourBlob.BehaviourConfigAndState<any, BehaviourState>>>
): Record<string, UncurriedHandler> => {
  const baseEvents = {
    'alloy.base.behaviour': CustomDefinition.toEvents(info)
  };
  return ComponentEvents.combine(bData, info.eventOrder, bList, baseEvents).getOrDie();
};

const build = (spec): AlloyComponent => {
  const getMe = () => {
    return me;
  };

  const systemApi = Cell(singleton);

  const info: CustomDefinition.CustomDetail<any> = ValueSchema.getOrDie(CustomDefinition.toInfo(spec));
  const bBlob = CompBehaviours.generate(spec);


  const bList = BehaviourBlob.getBehaviours(bBlob);
  const bData = BehaviourBlob.getData(bBlob);

  const modDefinition = getDomDefinition(info, bList, bData);

  const item = DomRender.renderToDom(modDefinition);
  const events = getEvents(info, bList, bData);

  const subcomponents = Cell(info.components);

  const connect = (newApi: AlloySystemApi): void => {
    systemApi.set(newApi);
  };

  const disconnect = (): void => {
    systemApi.set(NoContextApi(getMe));
  };

  const syncComponents = (): void => {
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

  // TYPIFY (any here is for the info.apis() pathway)
  const config = <D>(behaviour: AlloyBehaviour<any, D>): D | any => {
    const b = bData;
    const f = Type.isFunction(b[behaviour.name()]) ? b[behaviour.name()] : () => {
      throw new Error('Could not find ' + behaviour.name() + ' in ' + Json.stringify(spec, null, 2));
    };
    return f();
  };

  const hasConfigured = (behaviour: AlloyBehaviour<any, any>): boolean => {
    return Type.isFunction(bData[behaviour.name()]);
  };

  const getApis = <A>(): A => {
    return info.apis;
  };

  // TYPIFY
  const readState = (behaviourName: string): Option<any> => {
    return bData[behaviourName]().map((b) => {
      return b.state.readState();
    }).getOr('not enabled');
  };

  const me: AlloyComponent = {
    getSystem: systemApi.get,
    config,
    hasConfigured,
    spec: Fun.constant(spec),
    readState,
    getApis,

    connect,
    disconnect,
    element: Fun.constant(item),
    syncComponents,
    components: subcomponents.get,
    events: Fun.constant(events)
  };

  return me;
};

export {
  build
};