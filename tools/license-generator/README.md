# License Generator

A tool to generate license files for your projects with popular open source licenses.

## Features

- **7 Popular Licenses**: MIT, Apache-2.0, GPL-3.0, BSD-3-Clause, ISC, Unlicense
- **Customizable**: Fill in year, author, and project name
- **Live Preview**: See the generated license instantly
- **Copy & Download**: Copy to clipboard or download as LICENSE file
- **License Comparison**: Built-in reference table comparing license features

## Supported Licenses

| License | Type | Commercial Use | Modification | Distribution | Patent Grant | Copyleft |
|---------|------|----------------|--------------|--------------|--------------|----------|
| MIT | Permissive | ✓ | ✓ | ✓ | ✗ | ✗ |
| Apache-2.0 | Permissive | ✓ | ✓ | ✓ | ✓ | ✗ |
| GPL-3.0 | Copyleft | ✓ | ✓ | ✓ | ✓ | ✓ (Strong) |
| BSD-3-Clause | Permissive | ✓ | ✓ | ✓ | ✗ | ✗ |
| ISC | Permissive | ✓ | ✓ | ✓ | ✗ | ✗ |
| Unlicense | Public Domain | ✓ | ✓ | ✓ | ✗ | ✗ |

## Usage

1. Select a license from the dropdown
2. Enter the year, author name, and optional project name
3. Click "Generate License"
4. Copy to clipboard or download as LICENSE file

## Technical Details

- Built with React + TypeScript
- Client-side only - no server required
- Uses SPDX license identifiers
- Templates based on official license texts

## License

MIT License - feel free to use in your own projects!