import { FieldPresence, FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Merger, Result } from '@ephox/katamari';

import * as Fields from '../data/Fields';
import * as DomDefinition from '../dom/DomDefinition';
import * as DomModification from '../dom/DomModification';
import * as AlloyTags from '../ephemera/AlloyTags';
import { SketchSpec } from '../api/component/SpecTypes';

const toInfo = (spec): Result<SketchSpec, any> => {
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

const getUid = (info) => {
  return Objects.wrap(AlloyTags.idAttr(), info.uid());
};

const toDefinition = (info) => {
  const base = {
    tag: info.dom().tag(),
    classes: info.dom().classes(),
    attributes: Merger.deepMerge(
      getUid(info),
      info.dom().attributes()
    ),
    styles: info.dom().styles(),
    domChildren: Arr.map(info.components(), (comp) => { return comp.element(); })
  };

  return DomDefinition.nu(Merger.deepMerge(base,
    info.dom().innerHtml().map((h) => { return Objects.wrap('innerHtml', h); }).getOr({ }),
    info.dom().value().map((h) => { return Objects.wrap('value', h); }).getOr({ })
  ));
};

const toModification = (info) => {
  return info.domModification().fold(() => {
    return DomModification.nu({ });
  }, DomModification.nu);
};

// Probably want to pass info to these at some point.
const toApis = (info) => {
  return info.apis();
};

const toEvents = (info) => {
  return info.events();
};

export {
  toInfo,
  toDefinition,
  toModification,
  toApis,
  toEvents
};