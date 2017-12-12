import Component from './Component';
import ComponentApi from './ComponentApi';
import NoContextApi from '../system/NoContextApi';
import GuiTypes from '../ui/GuiTypes';
import DefaultEvents from '../../events/DefaultEvents';
import Tagger from '../../registry/Tagger';
import CustomSpec from '../../spec/CustomSpec';
import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Cell } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

var buildSubcomponents = function (spec) {
  var components = Objects.readOr('components', [ ])(spec);
  return Arr.map(components, build);
};

var buildFromSpec = function (userSpec) {
  var spec = CustomSpec.make(userSpec);

  // Build the subcomponents
  var components = buildSubcomponents(spec);

  var completeSpec = Merger.deepMerge(
    DefaultEvents,
    spec,
    Objects.wrap('components', components)
  );

  return Result.value(
    Component.build(completeSpec)
  );
};

var text = function (textContent) {
  var element = Element.fromText(textContent);

  return external({
    element: element
  });
};

var external = function (spec) {
  var extSpec = ValueSchema.asStructOrDie('external.component', ValueSchema.objOfOnly([
    FieldSchema.strict('element'),
    FieldSchema.option('uid')
  ]), spec);

  var systemApi = Cell(NoContextApi());

  var connect = function (newApi) {
    systemApi.set(newApi);
  };

  var disconnect = function () {
    systemApi.set(NoContextApi(function () {
      return me;
    }));
  };

  extSpec.uid().each(function (uid) {
    Tagger.writeOnly(extSpec.element(), uid);
  });

  var me = ComponentApi({
    getSystem: systemApi.get,
    config: Option.none,
    hasConfigured: Fun.constant(false),
    connect: connect,
    disconnect: disconnect,
    element: Fun.constant(extSpec.element()),
    spec: Fun.constant(spec),
    readState: Fun.constant('No state'),
    syncComponents: Fun.noop,
    components: Fun.constant([ ]),
    events: Fun.constant({ })
  });

  return GuiTypes.premade(me);
};

// INVESTIGATE: A better way to provide 'meta-specs'
var build = function (rawUserSpec) {

  return GuiTypes.getPremade(rawUserSpec).fold(function () {
    var userSpecWithUid = Merger.deepMerge({ uid: Tagger.generate('') }, rawUserSpec);
    return buildFromSpec(userSpecWithUid).getOrDie();
  }, function (prebuilt) {
    return prebuilt;
  });
};

export default <any> {
  build: build,
  premade: GuiTypes.premade,
  external: external,
  text: text
};