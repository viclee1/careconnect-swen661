# Build resources

`electron-builder` reads this directory (`buildResources` in
`../electron-builder.yml`) for packaging assets that are not part of the
application bundle itself.

| File | Used for |
|:-----|:---------|
| `icon.png` | 512×512 source icon. `electron-builder` converts it to the Windows `.ico` (with its required 256×256 frame), the macOS `.icns` and the Linux icon at package time, so no per-platform file is kept here. |

The artwork is the heart mark from the web app's PWA icon set
(`../../public/icons/icon-512.png`), drawn in `#0F5272` on transparent.
