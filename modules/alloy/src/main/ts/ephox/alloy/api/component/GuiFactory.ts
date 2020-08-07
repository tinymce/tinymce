import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Arr, Cell, Fun, Obj, Optional, Result } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as DefaultEvents from '../../events/DefaultEvents';
import * as Tagger from '../../registry/Tagger';
import * as CustomSpec from '../../spec/CustomSpec';
import { NoContextApi } from '../system/NoContextApi';
import { AlloySystemApi } from '../system/SystemApi';
import * as GuiTypes from '../ui/GuiTypes';
import * as Component from './Component';
import { AlloyComponent } from './ComponentApi';
import { AlloySpec, PremadeSpec, SimpleOrSketchSpec } from './SpecTypes';

const buildSubcomponents = (spec: SimpleOrSketchSpec): AlloyComponent[] => {
  const components = Obj.get(spec, 'components').getOr([ ]);
  return Arr.map(components, build);
};

const buildFromSpec = (userSpec: SimpleOrSketchSpec): Result<AlloyComponent, string> => {
  const { events: specEvents, ...spec }: SimpleOrSketchSpec = CustomSpec.make(userSpec);

  // Build the subcomponents. A spec hierarchy is built from the bottom up.
  const components: AlloyComponent[] = buildSubcomponents(spec);

  const completeSpec = {
    ...spec,
    events:  { ...DefaultEvents, ...specEvents },
    components
  };

  return Result.value(
    // Note, this isn't a spec any more, because it has built children
    Component.build(completeSpec)
  );
};

const text = (textContent: string): PremadeSpec => {
  const element = SugarElement.fromText(textContent);

  return external({
    element
  });
};

// Rename.
export interface ExternalElement { uid?: string; element: SugarElement }
const external = (spec: ExternalElement): PremadeSpec => {
  const extSpec: { uid: Optional<string>; element: SugarElement } = ValueSchema.asRawOrDie('external.component', ValueSchema.objOfOnly([
    FieldSchema.strict('element'),
    FieldSchema.option('uid')
  ]), spec);

  const systemApi = Cell(NoContextApi());

  const connect = (newApi: AlloySystemApi) => {
    systemApi.set(newApi);
  };

  const disconnect = () => {
    systemApi.set(NoContextApi(() => me));
  };

  extSpec.uid.each((uid) => {
    Tagger.writeOnly(extSpec.element, uid);
  });

  const me: AlloyComponent = {
    getSystem: systemApi.get,
    config: Optional.none,
    hasConfigured: Fun.never,
    connect,
    disconnect,
    getApis: <A>(): A => ({ } as any),
    element: extSpec.element,
    spec,
    readState: Fun.constant('No state'),
    syncComponents: Fun.noop,
    components: Fun.constant([ ]),
    events: { }
  };
  return GuiTypes.premade(me);
};

// We experimented with just having a counter for efficiency, but that fails for situations
// where an external JS file is using alloy, and is contained within another
// alloy root container. The ids can conflict, because the counters do not
// know about each other (being parts of separate scripts).
//
// There are other solutions than this ... not sure if they are going to have better performance, though
const uids = Tagger.generate;

// INVESTIGATE: A better way to provide 'meta-specs'
const build = (spec: AlloySpec): AlloyComponent => GuiTypes.getPremade(spec).fold(() => {
  // EFFICIENCY: Consider not merging here, and passing uid through separately
  const userSpecWithUid = spec.hasOwnProperty('uid') ? spec as SimpleOrSketchSpec : {
    uid: uids(''),
    ...spec
  } as SimpleOrSketchSpec;
  return buildFromSpec(userSpecWithUid).getOrDie();
}, (prebuilt) => prebuilt);

const premade = GuiTypes.premade;

export {
  build,
  premade,
  external,
  text
};
