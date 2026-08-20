# Aspect Ratio Calculator

A tool for calculating and converting aspect ratios, dimensions, and resolutions.

## Features

- **Dimension Calculator**: Calculate width/height while preserving aspect ratio
- **Target Dimension Calculator**: Enter one target dimension to compute the other
- **Ratio Simplification**: Automatically simplifies ratios to lowest terms using GCD
- **Common Presets**: Quick access to standard aspect ratios (16:9, 4:3, 3:2, 1:1, 21:9, etc.)
- **Standard Resolutions**: Predefined resolutions from 4K UHD to SVGA
- **Swap Dimensions**: Quickly swap width and height
- **Copy to Clipboard**: Copy ratios and dimensions easily

## Usage

1. Enter your current width and height
2. The aspect ratio is calculated and simplified automatically
3. Use "Lock aspect ratio" to maintain proportions when changing one dimension
4. Enter a target width OR height to calculate the matching dimension
5. Click presets or resolutions to quickly apply common values

## Formula

- `newHeight = (newWidth × height) / width`
- `newWidth = (newHeight × width) / height`
- `ratio = width : height` (simplified by Greatest Common Divisor)
- `decimal = width / height`

## Common Aspect Ratios

| Ratio | Name | Common Use |
|-------|------|------------|
| 16:9 | Widescreen | HD video, monitors |
| 4:3 | Standard | Old TV, presentations |
| 3:2 | Photo | 35mm film, DSLR |
| 1:1 | Square | Instagram, profile pics |
| 21:9 | Ultrawide | Cinema, gaming monitors |
| 16:10 | Widescreen | MacBook, some monitors |
| 9:16 | Mobile | Stories, TikTok, Reels |
| 4:5 | Portrait | Instagram posts |

## Standard Resolutions Included

- 8K UHD (7680×4320)
- 4K UHD (3840×2160)
- QHD/1440p (2560×1440)
- Full HD/1080p (1920×1080)
- HD/720p (1280×720)
- And more...