# Regex Generator

A comprehensive regular expression builder, tester, and code exporter for developers.

## Features

- **23 Built-in Patterns** - Common regex patterns for email, URL, IP addresses, phone numbers, dates, UUIDs, credit cards, and more
- **Custom Pattern Support** - Write and test your own regex patterns
- **Flag Configuration** - Toggle global, case-insensitive, multiline, dotAll, unicode, and sticky flags
- **Live Testing** - Real-time match highlighting with capture group details
- **Multi-Language Export** - Generate ready-to-use code for 10 languages:
  - JavaScript
  - Python
  - Go
  - Java
  - Rust
  - PHP
  - Ruby
  - C#
  - Swift
  - Kotlin
- **Quick Reference** - Built-in regex syntax cheatsheet

## Built-in Patterns

| Pattern | Example |
|---------|---------|
| Email | user@example.com |
| URL | https://example.com/path |
| IPv4 Address | 192.168.1.1 |
| IPv6 Address | 2001:0db8:85a3:0000:0000:8a2e:0370:7334 |
| Phone (US) | (555) 123-4567 |
| Phone (International) | +15551234567 |
| Date (YYYY-MM-DD) | 2024-12-31 |
| Time (24-hour) | 14:30 |
| UUID v4 | 550e8400-e29b-41d4-a716-446655440000 |
| MAC Address | 00:1A:2B:3C:4D:5E |
| Credit Card | 4111 1111 1111 1111 |
| Hex Color | #FF5733 |
| Slug | my-awesome-post |
| Username | john_doe123 |
| Strong Password | SecureP@ss123 |
| Postal Code (US) | 90210 |
| Postal Code (UK) | SW1A 1AA |
| Semantic Version | 1.2.3-beta.1+build.4 |
| Base64 | SGVsbG8gV29ybGQ= |
| JWT Token | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| MongoDB ObjectId | 507f1f77bcf86cd799439011 |
| CSS Selector | div.container#main |
| Git Commit SHA | a1b2c3d4e5f6789012345678901234567890abcd |
| Docker Image Tag | nginx:latest |

## Usage

1. Select a preset pattern or switch to "Custom" to write your own
2. Configure flags as needed
3. Enter a test string to see real-time matches with capture groups
4. Choose your target language and copy the generated code

## Technical Details

- Built with React + TypeScript
- No external dependencies
- Runs entirely in the browser
- Uses native `RegExp` API for testing

## File Structure

```
regex-generator/
├── index.tsx    # Main React component
└── README.md    # This file
```