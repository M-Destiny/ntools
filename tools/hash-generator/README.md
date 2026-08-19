# Hash Generator

Generate cryptographic hashes from text or files using multiple algorithms. Runs entirely in-browser using the Web Crypto API — no data is ever uploaded.

## Features

- **6 Algorithms**: MD5, SHA-1, SHA-256, SHA-384, SHA-512, RIPEMD-160
- **Text Input**: Hash any string instantly
- **File Input**: Hash files locally (no upload, streaming for large files)
- **Algorithm Switching**: Change algorithm and see result update instantly
- **Copy**: One-click copy to clipboard
- **Metadata**: Shows algorithm, output length, input size

## Algorithms

| Algorithm | Output Size | Security | Speed | Best For |
|-----------|-------------|----------|-------|----------|
| MD5 | 128-bit (32 hex) | ❌ Broken | Fastest | Checksums only |
| SHA-1 | 160-bit (40 hex) | ❌ Broken | Fast | Legacy/Git |
| SHA-256 | 256-bit (64 hex) | ✅ Secure | Fast | **General purpose** |
| SHA-384 | 384-bit (96 hex) | ✅ Stronger | Medium | High-security apps |
| SHA-512 | 512-bit (128 hex) | ✅ Strongest | Medium | Key derivation |
| RIPEMD-160 | 160-bit (40 hex) | ⚠️ Acceptable | Fast | Bitcoin addresses |

## Usage

### Text Hashing
1. Select **Text Input** tab
2. Paste or type your text
3. Choose algorithm (SHA-256 default)
4. Hash appears instantly
5. Click **Copy Hash**

### File Hashing
1. Select **File Input** tab
2. Click to select a file (any type, any size)
3. File is processed locally — never uploaded
4. Hash appears when complete
5. Click **Copy Hash**

## Security Notes

⚠️ **Never use MD5 or SHA-1 for security purposes** — both have practical collision attacks.

✅ **SHA-256 is recommended** for most use cases.

🔐 **For password hashing**, use bcrypt, scrypt, Argon2, or PBKDF2 — NOT these algorithms.

🔒 **All processing is local** — uses browser's Web Crypto API. Your data never leaves your device.

## Common Use Cases

- File integrity verification (downloads, backups)
- Digital signatures and certificates
- Content addressing (IPFS, Git)
- Blockchain / cryptocurrency addresses
- Cache busting (content-based filenames)
- Deduplication (identical content = identical hash)