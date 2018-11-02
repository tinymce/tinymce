import { GeneralSteps, Step } from '@ephox/agar';
import { Arr, Strings } from '@ephox/katamari';
import { Attr, Body, DomEvent, Element, Insert, Remove, SelectorFilter } from '@ephox/sugar';
import { deleteTinymceGlobals, getTinymce } from '../loader/Globals';
import { readAllPlugins, sRegisterPlugins } from '../loader/Plugins';
import { updateTinymceUrls } from '../loader/Urls';

const loadScript = (url: string, success: () => void, failure: (err: Error) => void) => {
  const script = Element.fromTag('script');

  Attr.set(script, 'src', url);

  DomEvent.bind(script, 'load', () => {
    success();
  });

  DomEvent.bind(script, 'error', () => {
    failure(new Error(`Failed to load script: ${url}`));
  });

  Insert.append(Body.body(), script);
};

const versionToPackageName = (version: string) => version === 'latest' ? 'tinymce' : `tinymce-${version}`;

const load = (version: string, success: () => void, failure: (err: Error) => void) => {
  const packageName = versionToPackageName(version);

  unload();
  loadScript(`/project/node_modules/${packageName}/tinymce.min.js`, () => {
    updateTinymceUrls(versionToPackageName(version));
    success();
  }, failure);
};

const isTinymcePackageUrl = (url: string) => Strings.contains(url, '/node_modules/tinymce/') || Strings.contains(url, '/node_modules/tinymce-');
const hasPackageUrl = (name: string) => (elm: Element) => {
  return Attr.has(elm, name) && isTinymcePackageUrl(Attr.get(elm, name));
};

const removeTinymceElements = () => {
  const elements = Arr.flatten([
    // Some older versions of tinymce leaves elements behind in the dom
    SelectorFilter.all('.mce-notification,.mce-window,#mce-modal-block'),
    Arr.filter(SelectorFilter.all('script'), hasPackageUrl('src')),
    Arr.filter(SelectorFilter.all('link'), hasPackageUrl('href')),
  ]);

  Arr.each(elements, Remove.remove);
};

const unload = () => {
  getTinymce().each((tinymce) => tinymce.remove());
  removeTinymceElements();
  deleteTinymceGlobals();
};

const sUnload = Step.sync(unload);

const sLoad = (version: string) => {
  return GeneralSteps.sequence([
    sUnload,
    Step.async((next, die) => {
      load(version, next, die);
    })
  ]);
};

const sWithVersion = (version: string, step: Step<any, any>) => {
  const plugins = readAllPlugins();

  return GeneralSteps.sequence([
    sLoad(version),
    step,
    sLoad('latest'),
    sRegisterPlugins(plugins)
  ]);
};

const getMajorVersion = () => {
  const tinymce = getTinymce().getOrDie('Failed to get global tinymce');
  return parseInt(tinymce.majorVersion, 10);
};

const isModern = () => {
  return getMajorVersion() < 5;
}

const isSilver = () => {
  return getMajorVersion() >= 5;
}

export {
  isModern,
  isSilver,

  sWithVersion,
  sLoad,
  sUnload
};
