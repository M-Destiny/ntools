# jwt-decoder

## Description
JWT (JSON Web Token) decoder with header/payload inspection, signature verification (HMAC), standard claims detection, and timestamp humanization.

## Usage
```tsx
import JWTDecoder from './tools/jwt-decoder';
```

## Features
- Decode JWT header, payload, and signature
- Human-readable timestamp conversion (exp, iat, nbf) with time remaining/elapsed
- Standard claims detection (iss, sub, aud, exp, nbf, iat, jti) with labels
- Signature verification for HMAC algorithms (HS256/384/512) using Web Crypto API
- Algorithm detection with known/unknown badge
- Raw Base64Url view toggle
- Copy JSON or raw Base64 for each part
- Token validity status (expired, not yet valid, valid)
- 12 common algorithm reference
- Security best practices guide
- Example JWT for testing

## Development
```bash
npm run dev
```