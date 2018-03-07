import { FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Arr, Cell, Fun, Merger, Option, Result } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import DefaultEvents from '../../events/DefaultEvents';
import * as Tagger from '../../registry/Tagger';
import * as CustomSpec from '../../spec/CustomSpec';
import NoContextApi from '../system/NoContextApi';
import * as GuiTypes from '../ui/GuiTypes';
import * as Component from './Component';
import { ComponentApi, AlloyComponent } from './ComponentApi';
import { SketchSpec, RawDomSchema } from 'ephox/alloy/api/ui/Sketcher';
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';

export interface AlloyPremadeComponent {
  [key: string]: AlloyComponent;
}

export type AlloyPremade =  (component: AlloyComponent) => AlloyPremadeComponent;

export interface AlloyExternalSpec {
  element: SugarElement;
  [key: string]: any;
}

const buildSubcomponents = function (spec) {
  const components = Objects.readOr('components', [ ])(spec);
  return Arr.map(components, build);
};

const buildFromSpec = function (userSpec) {
  const spec = CustomSpec.make(userSpec);

  // Build the subcomponents
  const components = buildSubcomponents(spec);

  const completeSpec = Merger.deepMerge(
    DefaultEvents,
    spec,
    Objects.wrap('components', components)
  );

  return Result.value(
    Component.build(completeSpec)
  );
};

const text = function (textContent: string): AlloyPremadeComponent {
  const element = Element.fromText(textContent);

  return external({
    element
  });
};

const external = function (spec: AlloyExternalSpec): AlloyPremadeComponent {
  const extSpec = ValueSchema.asStructOrDie('external.component', ValueSchema.objOfOnly([
    FieldSchema.strict('element'),
    FieldSchema.option('uid')
  ]), spec);

  const systemApi = Cell(NoContextApi());

  const connect = function (newApi) {
    systemApi.set(newApi);
  };

  const disconnect = function () {
    systemApi.set(NoContextApi(function () {
      return me;
    }));
  };

  extSpec.uid().each(function (uid) {
    Tagger.writeOnly(extSpec.element(), uid);
  });

  const me = ComponentApi({
    getSystem: systemApi.get,
    config: Option.none,
    hasConfigured: Fun.constant(false),
    connect,
    disconnect,
    element: Fun.constant(extSpec.element()),
    spec: Fun.constant(spec),
    readState: Fun.constant('No state'),
    syncComponents: Fun.noop,
    components: Fun.constant([ ]),
    events: Fun.constant({ })
  }) as AlloyComponent;
  return GuiTypes.premade(me);
};

// INVESTIGATE: A better way to provide 'meta-specs'
const build = function (rawUserSpec: AlloyPremadeComponent | SketchSpec | RawDomSchema): AlloyComponent {
  return GuiTypes.getPremade(rawUserSpec).fold(function () {
    const userSpecWithUid = Merger.deepMerge({ uid: Tagger.generate('') }, rawUserSpec);
    return buildFromSpec(userSpecWithUid).getOrDie();
  }, function (prebuilt) {
    return prebuilt;
  });
};

const premade = GuiTypes.premade as AlloyPremade;

export {
  build,
  premade,
  external,
  text
};