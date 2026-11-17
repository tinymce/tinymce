// Builds an inventory ("manifest") of every CSS custom property, private or public, in a
// skin compiled with @custom-properties-enabled forced on: where each property is
// declared, its default value, which properties it derives from, and which rules
// consume it. Grouping is by the LESS file a property is declared in (found through the
// LESS source map), so a group matches a component file such as
// components/notification/notification.less.
const fs = require('node:fs');
const path = require('node:path');
const less = require('less');
const postcss = require('postcss');

const { lessOptions } = require('../less-options');

const oxideRoot = path.resolve(__dirname, '../..');
const skinsDir = path.resolve(oxideRoot, 'src/less/skins');
const themeDir = path.resolve(oxideRoot, 'src/less/theme');

// Properties that are referenced from LESS but deliberately never declared in CSS,
// because their value is written at runtime by JavaScript.
const RUNTIME_PROPERTIES = {
  '--tox-private-requested-sidebar-width': 'Set by editor/modules/tinymce/src/themes/silver/main/ts/ui/sidebar/SidebarResize.ts',
  '--tox-private-resolved-sidebar-width': 'Set by editor/modules/tinymce/src/themes/silver/main/ts/ui/sidebar/SidebarResize.ts'
};

// The build's less.render() options, plus the forced flag and a source map. `oxideRoot`
// is added to `paths` because this may run with any cwd.
const compileSkin = async (skin, file = 'skin.less') => {
  const filename = path.resolve(skinsDir, 'ui', skin, file);
  const output = await less.render(fs.readFileSync(filename, 'utf8'), {
    ...lessOptions([ skinsDir, oxideRoot ]),
    filename,
    modifyVars: { 'custom-properties-enabled': 'true' },
    sourceMap: { outputSourceFiles: false }
  });
  return { css: output.css, map: output.map };
};

const VAR_REFERENCE = /var\(\s*(--[a-zA-Z0-9_-]+)/g;

const shortName = (name) => name.replace(/^--(?:tox-(?:private-)?)?/, '');

const referencedProperties = (value) => [ ...new Set([ ...value.matchAll(VAR_REFERENCE) ].map((m) => m[1])) ];

const normaliseSelector = (selector) => selector.split(',').map((s) => s.trim().replace(/\s+/g, ' ')).join(', ');

const atRuleChain = (node) => {
  const chain = [];
  for (let parent = node.parent; parent && parent.type !== 'root'; parent = parent.parent) {
    if (parent.type === 'atrule') {
      chain.unshift(`@${parent.name} ${parent.params}`);
    }
  }
  return chain;
};

const sourceOf = (node) => {
  const start = node.source && node.source.start;
  const origin = start && node.source.input.origin(start.line, start.column);
  if (!origin || !origin.file) {
    return { file: null, line: null };
  }
  const absolute = origin.file.startsWith('file://') ? new URL(origin.file).pathname : path.resolve(origin.file);
  return { file: path.relative(oxideRoot, absolute).split(path.sep).join('/'), line: origin.line };
};

const words = (id) => id.replace(/[-_/]+/g, ' ').trim();
const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// src/less/theme/globals/* -> 'global'; src/less/theme/components/<dir>/<file>.less ->
// '<dir>' (or '<dir>/<file>' when the file isn't named after its directory).
const groupForFile = (file) => {
  if (file === null) {
    return { id: 'unknown', label: 'Unknown source' };
  }
  const relativeToTheme = path.relative(themeDir, path.resolve(oxideRoot, file)).split(path.sep).join('/');
  if (relativeToTheme.startsWith('globals/')) {
    return { id: 'global', label: 'Global' };
  }
  const component = /^components\/([^/]+)\/(?:.*\/)?([^/]+)\.less$/.exec(relativeToTheme);
  if (component) {
    const [ , dir, name ] = component;
    const id = dir === name ? dir : `${dir}/${name}`;
    return { id, label: capitalise(dir === name ? words(dir) : `${words(dir)} / ${words(name)}`) };
  }
  const id = relativeToTheme.replace(/\.less$/, '');
  return { id, label: capitalise(words(id)) };
};

const buildManifest = ({ css, map, skin }) => {
  const root = postcss.parse(css, { from: `skins/ui/${skin}/skin.css`, map: { prev: map, inline: false, annotation: false } });

  const properties = new Map();
  const ensure = (name) => {
    if (!properties.has(name)) {
      properties.set(name, { name, short: shortName(name), group: null, declarations: [], uses: [], usedBy: { properties: [], rules: [] } });
    }
    return properties.get(name);
  };
  const references = [];

  root.walkDecls((decl) => {
    const selector = decl.parent.type === 'rule' ? normaliseSelector(decl.parent.selector) : `@${decl.parent.name} ${decl.parent.params}`;
    const source = sourceOf(decl);
    const used = referencedProperties(decl.value);

    if (decl.prop.startsWith('--')) {
      const entry = ensure(decl.prop);
      entry.declarations.push({ selector, value: decl.value.trim(), atRules: atRuleChain(decl), file: source.file, line: source.line });
      used.forEach((name) => {
        if (!entry.uses.includes(name)) {
          entry.uses.push(name);
        }
        references.push({ name, from: { property: decl.prop }, source });
      });
    } else {
      used.forEach((name) => references.push({ name, from: { selector, property: decl.prop }, source }));
    }
  });

  references.forEach(({ name, from }) => {
    const target = properties.get(name);
    if (!target) {
      return;
    }
    if (from.selector === undefined) {
      if (!target.usedBy.properties.includes(from.property)) {
        target.usedBy.properties.push(from.property);
      }
    } else if (!target.usedBy.rules.some((r) => r.selector === from.selector && r.property === from.property)) {
      target.usedBy.rules.push(from);
    }
  });

  // Groups, in declaration order.
  const groups = new Map();
  properties.forEach((entry) => {
    const { id, label } = groupForFile(entry.declarations[0].file);
    entry.group = id;
    if (!groups.has(id)) {
      groups.set(id, { id, label, file: entry.declarations[0].file, selectors: [], properties: [] });
    }
    const group = groups.get(id);
    group.properties.push(entry.name);
    entry.declarations.forEach((d) => {
      if (!group.selectors.includes(d.selector)) {
        group.selectors.push(d.selector);
      }
    });
  });

  const undeclared = new Map();
  references.forEach(({ name, from, source }) => {
    if (properties.has(name) || Object.prototype.hasOwnProperty.call(RUNTIME_PROPERTIES, name)) {
      return;
    }
    if (!undeclared.has(name)) {
      undeclared.set(name, { name, locations: [] });
    }
    const location = `${source.file}:${source.line} (${from.selector === undefined ? from.property : `${from.selector} { ${from.property} }`})`;
    if (!undeclared.get(name).locations.includes(location)) {
      undeclared.get(name).locations.push(location);
    }
  });

  const unused = [ ...properties.values() ]
    .filter((p) => p.usedBy.properties.length === 0 && p.usedBy.rules.length === 0)
    .map((p) => ({ name: p.name, location: `${p.declarations[0].file}:${p.declarations[0].line}` }));

  return {
    skin,
    groups: [ ...groups.values() ],
    properties: Object.fromEntries(properties),
    runtime: RUNTIME_PROPERTIES,
    issues: { undeclared: [ ...undeclared.values() ], unused }
  };
};

// Properties another skin declares but the default skin doesn't. types.ts is generated
// from the default skin only, so these are missing from it.
const missingFromDefault = (manifests) => {
  const base = manifests.find((m) => m.skin === 'default');
  if (base === undefined) {
    return [];
  }
  return manifests
    .filter((m) => m !== base)
    .flatMap((m) => Object.values(m.properties)
      .filter((p) => !Object.prototype.hasOwnProperty.call(base.properties, p.name))
      .map((p) => ({ skin: m.skin, name: p.name, location: `${p.declarations[0].file}:${p.declarations[0].line}` })));
};

const union = (names) => names.length === 0 ? 'never' : names.map((n) => `\n  | '${n}'`).join('');

const buildTypes = (manifest) => {
  const groupLines = manifest.groups.map((g) => `  '${g.id}':${union(g.properties).replace(/\n {2}/g, '\n    ')};`).join('\n');
  return [
    `// Generated by tasks/custom-properties.js from the '${manifest.skin}' skin. Do not edit.`,
    '',
    `export type CustomPropertyName =${union(Object.keys(manifest.properties))};`,
    '',
    '/** Properties written at runtime by JavaScript; referenced by the skin but never declared in it. */',
    `export type RuntimeCustomPropertyName =${union(Object.keys(manifest.runtime))};`,
    '',
    '/** Declared properties, keyed by the group (LESS file) that declares them. */',
    'export interface CustomPropertyGroups {',
    groupLines,
    '}',
    ''
  ].join('\n');
};

// The TypeScript shape of buildManifest's return value, for code that reads the JSON
// (the oxide-components Storybook panel). Update it together with buildManifest.
const buildManifestTypes = () => `// Generated by tasks/custom-properties.js. Do not edit.

export interface ManifestDeclaration {
  selector: string;
  value: string;
  atRules: string[];
  file: string | null;
  line: number | null;
}

export interface ManifestProperty {
  name: string;
  /** The name without its \`--tox-private-\` or \`--tox-\` prefix, for display. */
  short: string;
  group: string;
  declarations: ManifestDeclaration[];
  uses: string[];
  usedBy: { properties: string[]; rules: { selector: string; property: string }[] };
}

export interface ManifestGroup {
  id: string;
  label: string;
  file: string | null;
  selectors: string[];
  properties: string[];
}

/** Shape of build/custom-properties/<skin>.json. */
export interface Manifest {
  skin: string;
  groups: ManifestGroup[];
  properties: Record<string, ManifestProperty>;
  runtime: Record<string, string>;
  issues: {
    undeclared: { name: string; locations: string[] }[];
    unused: { name: string; location: string }[];
  };
}
`;

module.exports = { RUNTIME_PROPERTIES, compileSkin, buildManifest, buildTypes, buildManifestTypes, missingFromDefault };
