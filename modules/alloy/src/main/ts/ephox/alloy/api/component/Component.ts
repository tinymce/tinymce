import { StructureSchema } from '@ephox/boulder';
import { Arr, Cell, Optional, Type } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';

import * as BehaviourBlob from '../../behaviour/common/BehaviourBlob';
import { BehaviourState } from '../../behaviour/common/BehaviourState';
import * as ComponentDom from '../../construct/ComponentDom';
import * as ComponentEvents from '../../construct/ComponentEvents';
import * as CustomDefinition from '../../construct/CustomDefinition';
import { DomDefinitionDetail } from '../../dom/DomDefinition';
import * as DomModification from '../../dom/DomModification';
import * as DomRender from '../../dom/DomRender';
import { UncurriedHandler } from '../../events/EventRegistry';
import { AlloyBehaviour } from '../behaviour/Behaviour';
import { NoContextApi, singleton } from '../system/NoContextApi';
import { AlloySystemApi } from '../system/SystemApi';
import * as CompBehaviours from './CompBehaviours';
import { AlloyComponent } from './ComponentApi';
import { ComponentDetail } from './SpecTypes';

// This is probably far too complicated. I think DomModification is probably
// questionable as a concept. Maybe it should be deprecated.
const getDomDefinition = (
  info: CustomDefinition.CustomDetail<any>,
  bList: Array<AlloyBehaviour<any, any>>,
  bData: Record<string, () => Optional<BehaviourBlob.BehaviourConfigAndState<any, BehaviourState>>>
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
  bData: Record<string, () => Optional<BehaviourBlob.BehaviourConfigAndState<any, BehaviourState>>>
): Record<string, UncurriedHandler> => {
  const baseEvents = {
    'alloy.base.behaviour': CustomDefinition.toEvents(info)
  };
  return ComponentEvents.combine(bData, info.eventOrder, bList, baseEvents).getOrDie();
};

const build = (spec: ComponentDetail, obsoleted: Optional<SugarElement<Node>>): AlloyComponent => {
  const getMe = () => me;

  const systemApi = Cell(singleton);

  const info: CustomDefinition.CustomDetail<any> = StructureSchema.getOrDie(CustomDefinition.toInfo(spec));
  const bBlob = CompBehaviours.generate(spec);

  const bList = BehaviourBlob.getBehaviours(bBlob);
  const bData = BehaviourBlob.getData(bBlob);

  const modDefinition = getDomDefinition(info, bList, bData);

  const item = DomRender.renderToDom(modDefinition, obsoleted);
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
    // INVESTIGATE: Not sure about how to handle text nodes here.
    const subs = Arr.bind(children, (child) => systemApi.get().getByDom(child).fold(
      () => [ ],
      Arr.pure
    ));
    subcomponents.set(subs);
  };

  // TYPIFY (any here is for the info.apis() pathway)
  const config = (behaviour: AlloyBehaviour<any, any>): Optional<BehaviourBlob.BehaviourConfigAndState<any, any>> => {
    const b = bData;
    const f = Type.isFunction(b[behaviour.name()]) ? b[behaviour.name()] : () => {
      throw new Error('Could not find ' + behaviour.name() + ' in ' + JSON.stringify(spec, null, 2));
    };
    return f();
  };

  const hasConfigured = (behaviour: AlloyBehaviour<any, any>): boolean => Type.isFunction(bData[behaviour.name()]);

  const getApis = <A>(): A => info.apis;

  const readState = (behaviourName: string): any => bData[behaviourName]().map((b) => b.state.readState()).getOr('not enabled');

  const me: AlloyComponent = {
    uid: spec.uid,
    getSystem: systemApi.get,
    config,
    hasConfigured,
    spec,
    readState,
    getApis,

    connect,
    disconnect,
    element: item,
    syncComponents,
    components: subcomponents.get,
    events
  };

  return me;
};

export {
  build
};
