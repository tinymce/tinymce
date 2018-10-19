import { FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Arr, Cell, Fun, Merger, Option, Result } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import * as DefaultEvents from '../../events/DefaultEvents';
import * as Tagger from '../../registry/Tagger';
import * as CustomSpec from '../../spec/CustomSpec';
import { NoContextApi } from '../system/NoContextApi';
import * as GuiTypes from '../ui/GuiTypes';
import * as Component from './Component';
import { AlloyComponent, ComponentApi } from './ComponentApi';
import { SimpleSpec, SimpleOrSketchSpec, AlloySpec, PremadeSpec } from '../../api/component/SpecTypes';
import { LumberTimers } from '../../alien/LumberTimers';

const buildSubcomponents = (spec: SimpleOrSketchSpec): AlloyComponent[] => {
  const components = Objects.readOr('components', [ ])(spec);
  return Arr.map(components, build);
};

const buildFromSpec = (userSpec: SimpleOrSketchSpec): Result<AlloyComponent, string> => {
  const spec: SimpleOrSketchSpec = CustomSpec.make(userSpec);

  // Build the subcomponents. A spec hierarchy is built from the bottom up.
  const components: AlloyComponent[] = buildSubcomponents(spec);

  const completeSpec: SimpleOrSketchSpec = Merger.deepMerge(
    DefaultEvents,
    spec,
    Objects.wrap('components', components)
  );

  return Result.value(
    Component.build(completeSpec)
  );
};

const text = (textContent: string): PremadeSpec => {
  const element = Element.fromText(textContent);

  return external({
    element
  });
};

// Rename.
export interface ExternalElement { uid ?: string; element: Element; }
const external = (spec: ExternalElement): PremadeSpec => {
  const extSpec: { uid: Option<string>, element: Element } = ValueSchema.asRawOrDie('external.component', ValueSchema.objOfOnly([
    FieldSchema.strict('element'),
    FieldSchema.option('uid')
  ]), spec);

  const systemApi = Cell(NoContextApi());

  const connect = (newApi) => {
    systemApi.set(newApi);
  };

  const disconnect = () => {
    systemApi.set(NoContextApi(() => {
      return me;
    }));
  };

  extSpec.uid.each((uid) => {
    Tagger.writeOnly(extSpec.element, uid);
  });

  const me = ComponentApi({
    getSystem: systemApi.get,
    config: Option.none,
    hasConfigured: Fun.constant(false),
    connect,
    disconnect,
    element: Fun.constant(extSpec.element),
    spec: Fun.constant(spec),
    readState: Fun.constant('No state'),
    syncComponents: Fun.noop,
    components: Fun.constant([ ]),
    events: Fun.constant({ })
  }) as AlloyComponent;
  return GuiTypes.premade(me);
};

const uids = (() => {
  let counter = 0;

  return (prefix) => {
    counter++;
    return prefix + '_' + counter;
  };
})();

// INVESTIGATE: A better way to provide 'meta-specs'
const build = (spec: AlloySpec): AlloyComponent => {
  return GuiTypes.getPremade(spec).fold(() => {
    // EFFICIENCY: Consider not merging here, and passing uid through separately
    const userSpecWithUid = Merger.merge({ uid: uids('') }, spec);
    return buildFromSpec(userSpecWithUid).getOrDie();
  }, (prebuilt) => {
    return prebuilt;
  });
};

const premade = GuiTypes.premade;

export {
  build,
  premade,
  external,
  text
};