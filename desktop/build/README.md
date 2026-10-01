# Build resources

`electron-builder` reads this directory (`buildResources` in
`../electron-builder.yml`) for packaging assets that are not part of the
application bundle itself.

Nothing is required here — the current builds use Electron's default icon, and
`electron-builder` logs `default Electron icon is used` when it packages. To
give CareConnect its own icon, drop the files below in and rebuild; no config
change is needed.

| File | Platform | Requirement |
|:-----|:---------|:------------|
| `icon.icns` | macOS | 512×512 or larger |
| `icon.ico` | Windows | must contain a 256×256 frame |
| `icon.png` | Linux | 512×512 |

The source artwork is the heart-pulse mark in the Assignment 3 design system,
drawn in `#0F5272` on white.
