import { Arr, Obj, Type } from '@ephox/katamari';
import { Attribute, DomEvent, Insert, Remove, SugarDocument, SugarElement, SugarHead } from '@ephox/sugar';

import ScriptLoader from '../api/dom/ScriptLoader';
import type Editor from '../api/Editor';
import * as ErrorReporter from '../ErrorReporter';

class ComponentLoadError extends Error {
  public url: string;

  public constructor(message: string, url: string) {
    super(message);
    this.url = url;
  }
}

const hostWindowComponentScripts: Record<string, Promise<string>> = {};

const loadScript = (url: string, doc: SugarElement<Document>, extraAtts: Record<string, string>): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const script = SugarElement.fromTag('script');

    Attribute.setAll(script, {
      type: 'text/javascript',
      src: url,
      ...extraAtts
    });

    const clean = () => {
      Remove.remove(script);
    };

    DomEvent.bind(script, 'load', () => {
      clean();
      resolve();
    });

    DomEvent.bind(script, 'error', () => {
      clean();
      reject(new Error(`Failed to load script url: ${url}`));
    });

    Insert.append(SugarHead.getHead(doc), script);
  });
};

const loadComponent = async (url: string, doc: SugarElement<Document>): Promise<string> => {
  const extraAtts: Record<string, string> = ScriptLoader.ScriptLoader.getScriptAttributes(url);
  await loadScript(url, doc, extraAtts).catch(() => Promise.reject(new ComponentLoadError(`Failed to load component url: ${url}`, url)));
  return url;
};

const loadComponentsForInlineEditor = (componentUrls: Record<string, string>): Array<Promise<string>> => {
  return Obj.mapToArray(componentUrls, (url, elementName) => {
    return Obj.get(hostWindowComponentScripts, url).getOrThunk(() => {
      // Only load the component if it hasn't already been loaded in inline mode the page might have already loaded it
      if (Type.isNullable(window.customElements.get(elementName))) {
        const loadPromise = loadComponent(url, SugarDocument.getDocument());

        hostWindowComponentScripts[url] = loadPromise;
        return loadPromise;
      } else {
        return Promise.resolve(url);
      }
    }).catch((err) => {
      // Remove from cache if the component failed to load so we can try again later
      delete hostWindowComponentScripts[url];

      return Promise.reject(err);
    });
  });
};

const loadComponentsForIframeEditor = (componentUrls: Record<string, string>, doc: Document): Array<Promise<string>> => {
  const urls = Arr.unique(Obj.values(componentUrls));
  return Arr.map(urls, (url) => loadComponent(url, SugarElement.fromDom(doc)));
};

const loadComponentsForEditor = (editor: Editor): Array<Promise<string>> => {
  const componentUrls = editor.schema.getComponentUrls();

  if (editor.inline) {
    return loadComponentsForInlineEditor(componentUrls);
  } else {
    return loadComponentsForIframeEditor(componentUrls, editor.getDoc());
  }
};

const loadComponentsAsync = async (editor: Editor): Promise<void> => {
  const loadPromises = loadComponentsForEditor(editor);
  const rejected = Arr.filter(await Promise.allSettled(loadPromises), (r) => r.status === 'rejected');

  if (rejected.length > 0) {
    Arr.each(rejected, (rejection) => {
      if (rejection.reason instanceof ComponentLoadError) {
        const { url } = rejection.reason;
        ErrorReporter.componentLoadError(editor, url);
      }
    });
  }
};

export const loadComponents = (editor: Editor): void => {
  // Since we are handling the errors in the promise rejections inside the loadComponentsAsync we can ignore the errors here
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  loadComponentsAsync(editor);
};
