// The manager bundles JSX with the classic transform, so React must be in scope.
import * as React from 'react';
import { Button, Form } from 'storybook/internal/components';
import { STORY_RENDERED } from 'storybook/internal/core-events';
import { useAddonState, useChannel, useGlobals } from 'storybook/manager-api';
import { styled } from 'storybook/theming';

import {
  ADDON_ID, EVENTS, GLOBALS, type Manifest, type ManifestProperty, type Overrides, overridesToCss, type Report, type ResolvedValue
} from './Shared';

type Visibility = 'private' | 'public';

const visibilityOf = (name: string): Visibility => name.startsWith('--tox-private-') ? 'private' : 'public';

const customPropertiesIn = (rules: CSSRuleList): [string, string][] => [ ...rules ].flatMap((rule) => [
  ...rule instanceof window.CSSStyleRule
    ? [ ...rule.style ].filter((name) => name.startsWith('--')).map((name): [string, string] => [ name, rule.style.getPropertyValue(name).trim() ])
    : [],
  ...'cssRules' in rule ? customPropertiesIn(rule.cssRules as CSSRuleList) : []
]);

const parseCss = (text: string): Overrides => {
  const sheet = new window.CSSStyleSheet();
  sheet.replaceSync(text);
  return Object.fromEntries(customPropertiesIn(sheet.cssRules));
};

// A 1x1 canvas used only to convert colors, never shown. The color picker needs #rrggbb, but
// computed colors come as rgb() or, for relative colors and color-mix(), as color(srgb ...) or other.
// Painting the color into the single pixel and reading it back gives its RGBA bytes whatever
// the format, so no color syntax has to be parsed.
const canvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

const rgbaOf = (color: string): number[] => {
  canvas.clearRect(0, 0, 1, 1);
  canvas.fillStyle = color;
  canvas.fillRect(0, 0, 1, 1);
  return [ ...canvas.getImageData(0, 0, 1, 1).data ];
};

const toHex = (color: string): string => `#${rgbaOf(color).slice(0, 3).map((n) => n.toString(16).padStart(2, '0')).join('')}`;

const Bar = styled.div(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  background: theme.background.content,
  borderBottom: `1px solid ${theme.appBorderColor}`
}));

const Message = styled.div({ padding: '8px 12px' });

const GroupHeader = styled.button(({ theme }) => ({
  display: 'flex',
  width: '100%',
  gap: 8,
  font: 'inherit',
  color: 'inherit',
  textAlign: 'left',
  background: theme.background.app,
  border: 'none',
  borderTop: `1px solid ${theme.appBorderColor}`,
  padding: '8px 12px',
  cursor: 'pointer'
}));

const Row = styled.div<{ changed: boolean }>(({ theme, changed }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(160px, 1fr) minmax(200px, 1.4fr) minmax(140px, 0.8fr) 64px',
  gap: 8,
  alignItems: 'center',
  padding: '4px 12px',
  borderTop: `1px solid ${theme.appBorderColor}`,
  boxShadow: changed ? `inset 3px 0 0 ${theme.color.secondary}` : 'none'
}));

const Mono = styled.span(({ theme }) => ({
  fontFamily: theme.typography.fonts.mono,
  fontSize: 12,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}));

const Muted = styled.span(({ theme }) => ({ color: theme.textMutedColor }));

const Swatch = styled.span<{ color: string }>(({ theme, color }) => ({
  flex: 'none',
  width: 14,
  height: 14,
  borderRadius: 3,
  border: `1px solid ${theme.appBorderColor}`,
  background: `linear-gradient(${color}, ${color}), repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 50% / 8px 8px`
}));

// The value on the property's main rule (the first one that declares it). A later
// declaration on the same rule, e.g. a skin redeclaring a global, wins.
const defaultValue = (property: ManifestProperty): string => {
  const [ first ] = property.declarations;
  const onMainRule = property.declarations.filter((d) => d.selector === first.selector && d.atRules.join() === first.atRules.join());
  return onMainRule[onMainRule.length - 1].value.replace(/\s+/g, ' ').trim();
};

// Opaque colors as #rrggbb, translucent ones as the browser computes them.
const displayColor = (color: string): string => rgbaOf(color)[3] === 255 ? toHex(color) : color;

interface PropertyRowProps {
  property: ManifestProperty;
  override: string | undefined;
  resolved: ResolvedValue | undefined;
  isColor: boolean;
  onChange: (name: string, value: string | undefined) => void;
}

const PropertyRow = ({ property, override, resolved, isColor, onChange }: PropertyRowProps): React.JSX.Element => {
  const fallback = defaultValue(property);
  const setValue = (value: string) => onChange(property.name, value === fallback ? undefined : value);

  return (
    <Row changed={override !== undefined}>
      <Mono title={property.name}>{property.short}</Mono>

      <div style={{ display: 'flex', gap: 4 }}>
        {isColor && (
          <input
            type="color"
            aria-label={`Pick ${property.short}`}
            value={resolved?.kind === 'color' ? toHex(resolved.value) : '#000000'}
            onChange={(e) => setValue(e.target.value)}
            style={{ width: 28, height: 28, padding: 0, border: 'none', background: 'none', cursor: 'pointer', flex: 'none' }}
          />
        )}
        <Form.Input
          aria-label={property.name}
          value={override ?? fallback}
          placeholder={fallback}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', minWidth: 0 }}>
        {resolved === undefined ? <Muted>not rendered</Muted> : (
          <>
            {resolved.kind === 'color' && <Swatch color={resolved.value} />}
            <Mono title={resolved.value}>{resolved.kind === 'color' ? displayColor(resolved.value) : resolved.value}</Mono>
          </>
        )}
      </div>

      <div>
        {override !== undefined && <Button size="small" variant="ghost" onClick={() => onChange(property.name, undefined)}>Reset</Button>}
      </div>
    </Row>
  );
};

export const Panel = (): React.JSX.Element => {
  const [ globals ] = useGlobals();
  const [ overrides, setOverrides ] = useAddonState<Overrides>(ADDON_ID, {});
  const [ manifest, setManifest ] = React.useState<Manifest | null>(null);
  const [ report, setReport ] = React.useState<Report | null>(null);
  // Properties that resolved to a color, so the picker stays while a typed value is invalid.
  const [ colors ] = React.useState(() => new Set<string>());
  const [ search, setSearch ] = React.useState('');
  const [ visibility, setVisibility ] = React.useState<Visibility | 'all'>('all');
  const [ openGroups, setOpenGroups ] = React.useState<Record<string, boolean>>({ global: true });
  const [ importText, setImportText ] = React.useState<string | null>(null);
  const [ message, setMessage ] = React.useState<string | null>(null);

  const emit = useChannel({
    [EVENTS.MANIFEST]: setManifest,
    [EVENTS.REPORT]: (next: Report) => {
      Object.entries(next.resolved).forEach(([ name, value ]) => value.kind === 'color' && colors.add(name));
      setReport(next);
    },
    // The preview may have reloaded and lost the overrides; resending is harmless.
    [STORY_RENDERED]: () => emit(EVENTS.SET_OVERRIDES, overrides)
  }, [ overrides ]);

  React.useEffect(() => emit(EVENTS.REQUEST_REPORT), [ emit ]);
  React.useEffect(() => emit(EVENTS.SET_OVERRIDES, overrides), [ emit, overrides ]);

  if (manifest === null) {
    return <Message>Waiting for the preview to send the skin's custom properties…</Message>;
  }

  const setOverride = (name: string, value: string | undefined): void => {
    const { [name]: _previous, ...rest } = overrides;
    setOverrides(value === undefined ? rest : { ...rest, [name]: value });
  };

  const changedCount = Object.keys(overrides).length;
  // Empty and invalid overrides aren't written, so this can be empty even with changes.
  const overridesCss = overridesToCss(manifest, overrides, false);

  const copyCss = (): void => {
    const header = `/* TinyMCE ${manifest.skin} skin: CSS custom property overrides. Experimental: CSS custom properties are not a supported API yet. */\n\n`;
    navigator.clipboard.writeText(header + overridesCss).then(
      () => setMessage('Copied the overrides as CSS.'),
      () => setMessage(`Couldn't write to the clipboard.`)
    );
  };

  const applyImport = (text: string): void => {
    const parsed = Object.entries(parseCss(text));
    const known = parsed.filter(([ name ]) => manifest.properties[name] !== undefined);
    const skipped = parsed.length - known.length;
    setOverrides({ ...overrides, ...Object.fromEntries(known) });
    setImportText(null);
    setMessage(`Imported ${known.length} overrides.${skipped > 0 ? ` Skipped ${skipped} properties this skin doesn't declare.` : ''}`);
  };

  const query = search.trim().toLowerCase();
  const sections = [ 'global', ...report?.groups ?? [] ].flatMap((id) => {
    const group = manifest.groups.find((g) => g.id === id);
    const properties = (group?.properties ?? [])
      .map((name) => manifest.properties[name])
      .filter((p) => p.name.includes(query) && (visibility === 'all' || visibilityOf(p.name) === visibility));
    return group === undefined || properties.length === 0 ? [] : [{ group, properties }];
  });

  return (
    <div>
      <Bar>
        <div style={{ flex: '1 1 200px' }}>
          <Form.Input
            type="search"
            size="100%"
            aria-label="Search properties"
            placeholder="Search properties"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <Form.Select aria-label="Property visibility" value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility | 'all')}>
          <option value="all">Private and public</option>
          <option value="private">Private only</option>
          <option value="public">Public only</option>
        </Form.Select>
        <Button size="small" variant="outline" onClick={copyCss} disabled={overridesCss === ''}>Copy CSS</Button>
        <Button size="small" variant="outline" onClick={() => setImportText(importText === null ? '' : null)}>Import</Button>
        <Button size="small" variant="outline" onClick={() => setOverrides({})} disabled={changedCount === 0}>
          Reset all{changedCount > 0 ? ` (${changedCount})` : ''}
        </Button>
      </Bar>

      <Message>
        Experimental, for internal use. CSS custom properties are not a supported customization API yet:
        names and values may change or be removed in any release.
      </Message>
      {globals[GLOBALS.customProperties] === 'off' && (
        <Message>The toolbar shows the LESS build (custom properties off), so overrides are not applied.</Message>
      )}
      {message !== null && <Message>{message}</Message>}
      {importText !== null && (
        <Message style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
          <Form.Textarea
            aria-label="CSS to import"
            placeholder="Paste CSS rules, e.g. .tox { --tox-private-background-color: red; }"
            value={importText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImportText(e.target.value)}
            spellCheck={false}
            minRows={8}
            size="100%"
          />
          <Button size="small" variant="outline" onClick={() => applyImport(importText)} disabled={importText.trim() === ''}>
            Apply
          </Button>
        </Message>
      )}

      {sections.map(({ group, properties }) => {
        const open = query !== '' || (openGroups[group.id] ?? false);
        const changed = properties.filter((p) => overrides[p.name] !== undefined).length;
        return (
          <section key={group.id}>
            <GroupHeader type="button" aria-expanded={open} onClick={() => setOpenGroups({ ...openGroups, [group.id]: !open })}>
              <span>{open ? '▾' : '▸'}</span>
              <strong>{group.label}</strong>
              <Muted>{properties.length} properties{changed > 0 ? ` · ${changed} changed` : ''}</Muted>
            </GroupHeader>
            {open && properties.map((property) => (
              <PropertyRow
                key={property.name}
                property={property}
                override={overrides[property.name]}
                resolved={report?.resolved[property.name]}
                isColor={colors.has(property.name)}
                onChange={setOverride}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
};
