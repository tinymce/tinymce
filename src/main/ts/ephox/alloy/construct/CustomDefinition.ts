import { FieldPresence, FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Merger, Result } from '@ephox/katamari';

import * as Fields from '../data/Fields';
import * as DomDefinition from '../dom/DomDefinition';
import * as DomModification from '../dom/DomModification';
import * as AlloyTags from '../ephemera/AlloyTags';
import { SketchSpec } from 'ephox/alloy/api/ui/Sketcher';

const toInfo = function (spec): Result<SketchSpec, any> {
  return ValueSchema.asStruct('custom.definition', ValueSchema.objOfOnly([
    FieldSchema.field('dom', 'dom', FieldPresence.strict(), ValueSchema.objOfOnly([
      // Note, no children.
      FieldSchema.strict('tag'),
      FieldSchema.defaulted('styles', {}),
      FieldSchema.defaulted('classes', []),
      FieldSchema.defaulted('attributes', {}),
      FieldSchema.option('value'),
      FieldSchema.option('innerHtml')
    ])),
    FieldSchema.strict('components'),
    FieldSchema.strict('uid'),

    FieldSchema.defaulted('events', {}),
    FieldSchema.defaulted('apis', Fun.constant({})),

    // Use mergeWith in the future when pre-built behaviours conflict
    FieldSchema.field(
      'eventOrder',
      'eventOrder',
      FieldPresence.mergeWith({
        // Note, not using constant behaviour names to avoid code size of unused behaviours
        'alloy.execute': [ 'disabling', 'alloy.base.behaviour', 'toggling' ],
        'alloy.focus': [ 'alloy.base.behaviour', 'focusing', 'keying' ],
        'alloy.system.init': [ 'alloy.base.behaviour', 'disabling', 'toggling', 'representing' ],
        'input': [ 'alloy.base.behaviour', 'representing', 'streaming', 'invalidating' ],
        'alloy.system.detached': [ 'alloy.base.behaviour', 'representing' ]
      }),
      ValueSchema.anyValue()
    ),

    FieldSchema.option('domModification'),
    Fields.snapshot('originalSpec'),

    // Need to have this initially
    FieldSchema.defaulted('debug.sketcher', 'unknown')
  ]), spec);
};

const getUid = function (info) {
  return Objects.wrap(AlloyTags.idAttr(), info.uid());
};

const toDefinition = function (info) {
  const base = {
    tag: info.dom().tag(),
    classes: info.dom().classes(),
    attributes: Merger.deepMerge(
      getUid(info),
      info.dom().attributes()
    ),
    styles: info.dom().styles(),
    domChildren: Arr.map(info.components(), function (comp) { return comp.element(); })
  };

  return DomDefinition.nu(Merger.deepMerge(base,
    info.dom().innerHtml().map(function (h) { return Objects.wrap('innerHtml', h); }).getOr({ }),
    info.dom().value().map(function (h) { return Objects.wrap('value', h); }).getOr({ })
  ));
};

const toModification = function (info) {
  return info.domModification().fold(function () {
    return DomModification.nu({ });
  }, DomModification.nu);
};

// Probably want to pass info to these at some point.
const toApis = function (info) {
  return info.apis();
};

const toEvents = function (info) {
  return info.events();
};

export {
  toInfo,
  toDefinition,
  toModification,
  toApis,
  toEvents
};