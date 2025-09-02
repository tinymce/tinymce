# Oxide Icons Tools

Various tools for Oxide icon packs

## oxide-icon-packager
A very opinionated tool which packages SVGs in different formats with a predefined directory structure.

```javascript
import { iconPackager } from '@ephox/oxide-icons-tools';

await iconPackager({
  // [Required] Name of the icon pack.
  name: 'default',

  // Logs a diff with @tinymce/oxide-icons-default. Requires that the module is made available.
  diffDefault: true,

  // Icons to ignore when producing a diff. Used in combination with "diffDefault"
  diffIgnore: ['accessibility-check'],

  // Override SVGO options (will be merged with default SVGO options). Use "svgo: false" to completely disable SVGO
  svgo: { floatPrecision: 2 }
});
```
