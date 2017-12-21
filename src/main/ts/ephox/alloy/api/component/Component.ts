import CompBehaviours from './CompBehaviours';
import ComponentApi from './ComponentApi';
import NoContextApi from '../system/NoContextApi';
import GuiTypes from '../ui/GuiTypes';
import BehaviourBlob from '../../behaviour/common/BehaviourBlob';
import ComponentDom from '../../construct/ComponentDom';
import ComponentEvents from '../../construct/ComponentEvents';
import CustomDefinition from '../../construct/CustomDefinition';
import DomModification from '../../dom/DomModification';
import DomRender from '../../dom/DomRender';
import { ValueSchema } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Cell } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Type } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import { Traverse } from '@ephox/sugar';

var build = function (spec) {
  var getMe = function () {
    return me;
  };

  var systemApi = Cell(NoContextApi(getMe));


  var info = ValueSchema.getOrDie(CustomDefinition.toInfo(Merger.deepMerge(
    spec,
    {behaviours: undefined}
  )));

  // The behaviour configuration is put into info.behaviours(). For everything else,
  // we just need the list of static behaviours that this component cares about. The behaviour info
  // to pass through will come from the info.behaviours() obj.
  var bBlob = CompBehaviours.generate(spec);
  var bList = BehaviourBlob.getBehaviours(bBlob);
  var bData = BehaviourBlob.getData(bBlob);

  var definition = CustomDefinition.toDefinition(info);

  var baseModification = {
    'alloy.base.modification': CustomDefinition.toModification(info)
  };

  var modification = ComponentDom.combine(bData, baseModification, bList, definition).getOrDie();

  var modDefinition = DomModification.merge(definition, modification);

  var item = DomRender.renderToDom(modDefinition);

  var baseEvents = {
    'alloy.base.behaviour': CustomDefinition.toEvents(info)
  };

  var events = ComponentEvents.combine(bData, info.eventOrder(), bList, baseEvents).getOrDie();

  var subcomponents = Cell(info.components());

  var connect = function (newApi) {
    systemApi.set(newApi);
  };

  var disconnect = function () {
    systemApi.set(NoContextApi(getMe));
  };

  var syncComponents = function () {
    // Update the component list with the current children
    var children = Traverse.children(item);
    var subs = Arr.bind(children, function (child) {

      return systemApi.get().getByDom(child).fold(function () {
        // INVESTIGATE: Not sure about how to handle text nodes here.
        return [ ];
      }, function (c) {
        return [ c ];
      });
    });
    subcomponents.set(subs);
  };

  var config = function (behaviour) {
    if (behaviour === GuiTypes.apiConfig()) return info.apis();
    var b = bData;
    var f = Type.isFunction(b[behaviour.name()]) ? b[behaviour.name()] : function () {
      throw new Error('Could not find ' + behaviour.name() + ' in ' + Json.stringify(spec, null, 2));
    };
    return f();
    // });
  };

  var hasConfigured = function (behaviour) {
    return Type.isFunction(bData[behaviour.name()]);
  };

  var readState = function (behaviourName) {
    return bData[behaviourName]().map(function (b) {
      return b.state.readState();
    }).getOr('not enabled');
  };

  var me = ComponentApi({
    getSystem: systemApi.get,
    config: config,
    hasConfigured: hasConfigured,
    spec: Fun.constant(spec),
    readState: readState,

    connect: connect,
    disconnect: disconnect,
    element: Fun.constant(item),
    syncComponents: syncComponents,
    components: subcomponents.get,
    events: Fun.constant(events)
  });

  return me;
};

export default <any> {
  build: build
};