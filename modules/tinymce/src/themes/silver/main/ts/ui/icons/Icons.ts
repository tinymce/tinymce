import { AddEventsBehaviour, AlloyEvents, Behaviour, SimpleSpec } from '@ephox/alloy';
import { Arr, Obj, Optional, Strings } from '@ephox/katamari';
import { Attribute, SelectorFind } from '@ephox/sugar';

import I18n from 'tinymce/core/api/util/I18n';

export type IconProvider = () => Record<string, string>;

interface IconSpec {
  readonly tag: string;
  readonly classes: string[];
  readonly attributes?: Record<string, string>;
  readonly behaviours?: Array<Behaviour.NamedConfiguredBehaviour<any, any, any>>;
}

// Icons that need to be transformed in RTL
const rtlTransform: Record<string, boolean> = {
  'indent': true,
  'outdent': true,
  'table-insert-column-after': true,
  'table-insert-column-before': true,
  'paste-column-after': true,
  'paste-column-before': true,
  'unordered-list': true,
  'list-bull-circle': true,
  'list-bull-default': true,
  'list-bull-square': true
};

const defaultIconName = 'temporary-placeholder';

const defaultIcon = (icons: Record<string, string>) => (): string =>
  Obj.get(icons, defaultIconName).getOr('!not found!');

const getIconName = (name: string, icons: Record<string, string>): string => {
  const lcName = name.toLowerCase();
  // If in rtl mode then try to see if we have a rtl icon to use instead
  if (I18n.isRtl()) {
    const rtlName = Strings.ensureTrailing(lcName, '-rtl');
    return Obj.has(icons, rtlName) ? rtlName : lcName;
  } else {
    return lcName;
  }
};

const lookupIcon = (name: string, icons: Record<string, string>): Optional<string> =>
  Obj.get(icons, getIconName(name, icons));

const get = (name: string, iconProvider: IconProvider): string => {
  const icons = iconProvider();
  return lookupIcon(name, icons).getOrThunk(defaultIcon(icons));
};

const getOr = (name: string, iconProvider: IconProvider, fallbackIcon: Optional<string>): string => {
  const icons = iconProvider();
  return lookupIcon(name, icons).or(fallbackIcon).getOrThunk(defaultIcon(icons));
};

const getFirst = (names: string[], iconProvider: IconProvider): string => {
  const icons = iconProvider();
  return Arr.findMap(names, (name) => lookupIcon(name, icons)).getOrThunk(defaultIcon(icons));
};

const needsRtlTransform = (iconName: string): boolean =>
  I18n.isRtl() ? Obj.has(rtlTransform, iconName) : false;

const addFocusableBehaviour = (): Behaviour.NamedConfiguredBehaviour<any, any, any> =>
  AddEventsBehaviour.config('add-focusable', [
    AlloyEvents.runOnAttached((comp) => {
      // set focusable=false on SVGs to prevent focusing the toolbar when tabbing into the editor
      SelectorFind.child(comp.element, 'svg').each((svg) => Attribute.set(svg, 'focusable', 'false'));
    })
  ]);

const renderIcon = (spec: IconSpec, iconName: string, icons: Record<string, string>, fallbackIcon: Optional<string>): SimpleSpec => {
  // If RTL, add the flip icon class if the icon doesn't have a `-rtl` icon available.
  const rtlIconClasses = needsRtlTransform(iconName) ? [ 'tox-icon--flip' ] : [];
  const iconHtml = Obj.get(icons, getIconName(iconName, icons)).or(fallbackIcon).getOrThunk(defaultIcon(icons));
  return {
    dom: {
      tag: spec.tag,
      attributes: spec.attributes ?? {},
      classes: spec.classes.concat(rtlIconClasses),
      innerHtml: iconHtml
    },
    behaviours: Behaviour.derive([
      ...spec.behaviours ?? [],
      addFocusableBehaviour()
    ])
  };
};

const render = (iconName: string, spec: IconSpec, iconProvider: IconProvider, fallbackIcon: Optional<string> = Optional.none()): SimpleSpec =>
  renderIcon(spec, iconName, iconProvider(), fallbackIcon);

const renderFirst = (iconNames: string[], spec: IconSpec, iconProvider: IconProvider): SimpleSpec => {
  const icons = iconProvider();
  const iconName = Arr.find(iconNames, (name) => Obj.has(icons, getIconName(name, icons)));
  return renderIcon(spec, iconName.getOr(defaultIconName), icons, Optional.none());
};

export {
  get,
  getFirst,
  getOr,
  render,
  renderFirst,
  addFocusableBehaviour,
  needsRtlTransform
};
