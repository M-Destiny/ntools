# Unit Converter

A comprehensive unit conversion tool supporting 10 categories with 80+ units.

## Features

- **10 Categories**: Length, Weight/Mass, Temperature, Volume, Area, Speed, Time, Data, Pressure, Energy
- **80+ Units**: Metric, Imperial, US Customary, and specialized units
- **Real-time Conversion**: Instant results as you type
- **Swap Units**: One-click swap between from/to units
- **Copy Result**: Copy converted value to clipboard
- **All Conversions Table**: See the input value converted to all units in the category
- **Quick Examples**: Pre-loaded common conversions
- **Formula Display**: Shows the conversion formula being used

## Categories & Units

| Category | Units |
|----------|-------|
| **Length** | m, km, cm, mm, in, ft, yd, mi, nmi |
| **Weight/Mass** | kg, g, mg, t, lb, oz, st, ton |
| **Temperature** | °C, °F, K, °R |
| **Volume** | L, mL, m³, cm³, gal, qt, pt, cup, fl oz, gal (UK), pt (UK) |
| **Area** | m², km², cm², mm², ha, in², ft², yd², ac, mi² |
| **Speed** | m/s, km/h, mph, kn, ft/s, Mach |
| **Time** | s, ms, µs, min, h, d, wk, mo, yr |
| **Data** | b, B, kb, Kib, KB, KiB, Mb, Mib, MB, MiB, Gb, Gib, GB, GiB, TB, TiB |
| **Pressure** | Pa, kPa, MPa, bar, mbar, atm, psi, Torr, mmHg |
| **Energy** | J, kJ, cal, kcal, Wh, kWh, BTU, eV, ft·lb |

## Usage

1. Select a category from the grid
2. Choose "From" and "To" units
3. Enter a value — conversion happens instantly
4. Click "⇄" to swap units
5. Click "Copy Result" to copy the converted value
6. View all conversions in the table on the right

## Technical Details

- Built with React + TypeScript
- No external dependencies for conversion logic
- Uses base-unit conversion (all units convert to/from a base unit)
- Temperature uses offset-based conversion (not ratio-based)
- Precision: 10 significant digits, scientific notation for very large/small values

## Examples

- `100 °C → °F` = 212 °F
- `1 mile → km` = 1.60934 km
- `1 kg → lb` = 2.20462 lb
- `1 gallon → L` = 3.78541 L
- `1 acre → m²` = 4046.86 m²
- `60 mph → km/h` = 96.5606 km/h
- `1 GB → MiB` = 953.674 MiB
- `1 atm → psi` = 14.6959 psi
- `1 kWh → J` = 3,600,000 J