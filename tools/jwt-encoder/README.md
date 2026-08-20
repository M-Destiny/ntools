# JWT Encoder

Create and sign JSON Web Tokens (JWTs). Build headers and payloads with standard claims, sign with HMAC (HS256/384/512) or asymmetric keys (RS256, ES256, etc.).

## Features

- **Multiple algorithms** — HS256/HS384/HS512 (HMAC), RS256/RS384/RS512 (RSA), ES256/ES384/ES512 (ECDSA), PS256/PS384/PS512 (RSA-PSS), EdDSA, and `none` (unsecured)
- **Standard claims support** — iss, sub, aud, exp, nbf, iat, jti with autocomplete
- **Custom claims** — Add any custom claims with type detection (string, number, boolean, null, JSON object)
- **Header customization** — Set `typ`, `kid` (key ID)
- **Auto-signing** — Web Crypto API for HMAC; placeholder for asymmetric (use proper library in production)
- **Raw parts view** — Inspect Base64Url-encoded header, payload, signature
- **Copy & download** — One-click copy to clipboard or download as `.jwt` file

## Usage

1. Select algorithm (HS256 for symmetric, RS256 for asymmetric)
2. Configure header (`typ`, `kid`)
3. Add claims to payload (standard + custom)
4. Enter signing key (HMAC secret or PEM private key)
5. Copy or download the encoded JWT

## Example

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "iss": "https://myapp.com",
  "sub": "user_abc123",
  "aud": "api.myapp.com",
  "iat": 1735689600,
  "exp": 1735776000,
  "jti": "token_xyz789",
  "role": "admin",
  "permissions": ["read", "write", "delete"]
}
```

**Output JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL215YXBwLmNvbSIsInN1YiI6InVzZXJfYWJjMTIzIiwiYXVkIjoiYXBpLm15YXBwLmNvbSIsImlhdCI6MTczNTY4OTYwMCwiZXhwIjoxNzM1Nzc2MDAwLCJqdGkiOiJ0b2tlbl94eXo3ODkiLCJyb2xlIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## Algorithm Guide

| Algorithm | Type | Key | Use Case |
|-----------|------|-----|----------|
| HS256/384/512 | Symmetric HMAC | Shared secret | Internal services, simple auth |
| RS256/384/512 | Asymmetric RSA | Private key (sign) / Public key (verify) | Public APIs, cross-service auth |
| ES256/384/512 | Asymmetric ECDSA | Private key / Public key | Smaller signatures, mobile |
| PS256/384/512 | RSA-PSS | Private key / Public key | Modern RSA, stronger security |
| EdDSA | Edwards-curve | Private key / Public key | High performance, small keys |
| none | Unsecured | None | Testing only — **never in production** |

## Security Notes

- **HS algorithms**: Use strong random secrets (32+ chars for HS256, 48+ for HS384, 64+ for HS512)
- **RS/ES/PS algorithms**: This tool uses Web Crypto API for HMAC only. For asymmetric signing in production, use a proper JWT library like `jose` or `jsonwebtoken`
- **Never use `alg: none` in production** — tokens can be forged
- **Rotate keys periodically** and use `kid` header for key identification
- **Validate `exp`, `nbf`, `iat`** on the receiving side