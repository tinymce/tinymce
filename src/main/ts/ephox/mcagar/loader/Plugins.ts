import { Option, Obj, Arr } from "@ephox/katamari";
import { getTinymce } from "./Globals";

export interface PluginDetails {
  name: string;
  instance: <T>(editor, url: string) => T;
  url: Option<string>;
}

const readAllPlugins = (): PluginDetails[] => {
  return getTinymce().map((tinymce) => {
    return Obj.mapToArray(tinymce.PluginManager.lookup, (plugin, name) => {
      return {
        name,
        instance: plugin.instance,
        url: Obj.get(tinymce.PluginManager.urls, name)
      };
    });
  }).getOr([]);
};

const readPlugins = (pluginNames: string[]): PluginDetails[] => {
  return Arr.filter(readAllPlugins(), (plugin) => Arr.contains(pluginNames, plugin.name));
};

const registerPlugins = (plugins: PluginDetails[]) => {
  return getTinymce().each((tinymce) => {
    Arr.each(plugins, (plugin) => {
      plugin.url.each((url) => tinymce.PluginManager.urls[plugin.name] = url);
      tinymce.PluginManager.add(plugin.name, plugin.instance);
    });
  });
};

export {
  readAllPlugins,
  readPlugins,
  registerPlugins
};
