import { ValueSchema } from '@ephox/boulder';
import { Arr, Cell, Fun, Merger, Type, Option } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import { Traverse } from '@ephox/sugar';

import * as BehaviourBlob from '../../behaviour/common/BehaviourBlob';
import * as ComponentDom from '../../construct/ComponentDom';
import * as ComponentEvents from '../../construct/ComponentEvents';
import * as CustomDefinition from '../../construct/CustomDefinition';
import * as DomModification from '../../dom/DomModification';
import * as DomRender from '../../dom/DomRender';
import { NoContextApi, singleton } from '../system/NoContextApi';
import * as GuiTypes from '../ui/GuiTypes';
import * as CompBehaviours from './CompBehaviours';
import { ComponentApi, AlloyComponent } from './ComponentApi';
import { SimpleOrSketchSpec } from '../../api/component/SpecTypes';
import { AlloyBehaviour } from '../../api/behaviour/Behaviour';
import { BehaviourState } from '../../behaviour/common/BehaviourState';
import { DomDefinitionDetail } from '../../dom/DomDefinition';
import { AlloySystemApi } from '../../api/system/SystemApi';
import { UncurriedHandler } from '../../events/EventRegistry';
import { LumberTimers } from '../../alien/LumberTimers';

// This is probably far too complicated. I think DomModification is probably
// questionable as a concept. Maybe it should be deprecated.
const getDomDefinition = (
  info: CustomDefinition.CustomDetail,
  bList: Array<AlloyBehaviour<any, any>>,
  bData: Record<string, () => Option<BehaviourBlob.BehaviourConfigAndState<any, BehaviourState>>>
): DomDefinitionDetail => {
  // const definition = LumberTimers.run('modDef.def', () => {
  //   return CustomDefinition.toDefinition(info);
  // });
  // // return definition
  // const modDef = LumberTimers.run('modDef.mod', () => {
  //   return CustomDefinition.toModification(info);
  // });

  // // const baseModification = {
  // //   'alloy.base.modification': modDef
  // // };

  // // This optimisation seems to improve this.
  // // const modification = LumberTimers.run('modDef.modification', () => modDef);
  // return LumberTimers.run('modDef.merge', () => DomModification.merge(definition, modDef));
  // // return definition;
  const definition = CustomDefinition.toDefinition(info);
  const baseModification = {
    'alloy.base.modification': CustomDefinition.toModification(info)
  };
  const modification = ComponentDom.combine(bData, baseModification, bList, definition).getOrDie();
  return DomModification.merge(definition, modification);

//
  // const definition = LumberTimers.run('modDef.def', () => {
    //   return CustomDefinition.toDefinition(info);
    // });
    // // return definition
    // const modDef = LumberTimers.run('modDef.mod', () => {
    //   return CustomDefinition.toModification(info);
    // });

    // // const baseModification = {
    // //   'alloy.base.modification': modDef
    // // };

    // // This optimisation seems to improve this.
    // // const modification = LumberTimers.run('modDef.modification', () => modDef);
    // return LumberTimers.run('modDef.merge', () => DomModification.merge(definition, modDef));
    // // return de
};

const getEvents = (
  info: CustomDefinition.CustomDetail,
  bList: Array<AlloyBehaviour<any, any>>,
  bData: Record<string, () => Option<BehaviourBlob.BehaviourConfigAndState<any, BehaviourState>>>
): Record<string, UncurriedHandler> => {
  const baseEvents = {
    'alloy.base.behaviour': LumberTimers.run('baseEvents', () => CustomDefinition.toEvents(info))
  };
  // return baseEvents;
  return LumberTimers.run('combineEvents', () => ComponentEvents.combine(bData, info.eventOrder, bList, baseEvents).getOrDie());
};

const build = (spec: SimpleOrSketchSpec): AlloyComponent => {
  const getMe = () => {
    return me;
  };

  const systemApi = LumberTimers.run('nocontext', () => {
    return Cell(singleton);
  });

  const info: CustomDefinition.CustomDetail = LumberTimers.run('info', () => {
      return ValueSchema.getOrDie(CustomDefinition.toInfo(spec))
    }
  );

  // FIX: this comment is outdated.

  // The behaviour configuration is put into info.behaviours(). For everything else,
  // we just need the list of static behaviours that this component cares about. The behaviour info
  // to pass through will come from the info.behaviours() obj.
  const bBlob = LumberTimers.run('bBlob', () => CompBehaviours.generate(spec));


  const bList = LumberTimers.run('bList', () => BehaviourBlob.getBehaviours(bBlob));
  const bData = LumberTimers.run('bData', () => BehaviourBlob.getData(bBlob));

  const modDefinition = LumberTimers.run('modDefinition', () => {
    return getDomDefinition(info, bList, bData);
  });
  // const modDefinition = '';
  const item = LumberTimers.run('renderToDom', () => DomRender.renderToDom(modDefinition));
  const events = LumberTimers.run('events', () => getEvents(info, bList, bData));

  const subcomponents = LumberTimers.run('subcomponents', () => Cell(info.components));

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
  const config = <D>(behaviour: AlloyBehaviour<any, D> | string): D | any => {
    if (behaviour === GuiTypes.apiConfig()) {
      return info.apis;
    } else if (Type.isString(behaviour)) {
      throw new Error('Invalid input: only API constant is allowed');
    }
    const b = bData;
    const f = Type.isFunction(b[behaviour.name()]) ? b[behaviour.name()] : () => {
      throw new Error('Could not find ' + behaviour.name() + ' in ' + Json.stringify(spec, null, 2));
    };
    return f();
  };

  const hasConfigured = (behaviour: AlloyBehaviour<any, any>): boolean => {
    return Type.isFunction(bData[behaviour.name()]);
  };

  // TYPIFY
  const readState = (behaviourName: string): Option<any> => {
    return bData[behaviourName]().map((b) => {
      return b.state.readState();
    }).getOr('not enabled');
  };

  const me = LumberTimers.run('me', () => ComponentApi({
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
  }));

  return me;
};

export {
  build
};