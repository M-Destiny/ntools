# CORS Tester

Test Cross-Origin Resource Sharing (CORS) configuration by sending actual HTTP requests to verify headers, preflight handling, and credential support.

## Features

- **Real HTTP requests**: Actually sends requests to the target URL (not simulated)
- **Preflight testing**: Tests OPTIONS preflight requests with proper headers
- **Actual request testing**: Tests the real request after preflight
- **Credentials support**: Toggle `credentials: include` to test cookie/auth scenarios
- **Custom headers**: Add custom request headers for complex API testing
- **Detailed results**: Shows all CORS-related response headers with pass/fail indicators
- **History**: Keeps last 10 test results for comparison
- **Copy results**: Export results as JSON for debugging

## How It Works

### Preflight Request (OPTIONS)
When you make a cross-origin request that's not "simple" (custom headers, non-GET/POST/HEAD, etc.), the browser first sends an OPTIONS request with:
- `Origin`: Your origin
- `Access-Control-Request-Method`: The actual method you want to use
- `Access-Control-Request-Headers`: Custom headers you plan to send

The server must respond with:
- `Access-Control-Allow-Origin`: Your origin (or `*` without credentials)
- `Access-Control-Allow-Methods`: Allowed methods
- `Access-Control-Allow-Headers`: Allowed headers
- `Access-Control-Allow-Credentials`: `true` if credentials allowed
- `Access-Control-Max-Age`: Cache duration for preflight

### Actual Request
If preflight passes, the browser sends the real request with the `Origin` header. The server must include `Access-Control-Allow-Origin` matching your origin in the response.

## Usage

1. Enter the target API URL
2. Select HTTP method
3. Set your origin (defaults to current page origin)
4. Add custom headers if needed (one per line: `Key: Value`)
5. Enable "Include Credentials" if testing with cookies/auth
6. Click **Run Full Test** (runs preflight + actual) or test individually

## Interpreting Results

### Green (Allowed) ✓
- `Access-Control-Allow-Origin` matches your origin (or `*` without credentials)
- All required CORS headers present
- Request succeeds

### Red (Blocked) ✗
- Missing `Access-Control-Allow-Origin` header
- Origin mismatch (server returns different origin)
- Credentials enabled but `Allow-Origin` is `*`
- Network error / timeout

## Common CORS Issues

| Issue | Solution |
|-------|----------|
| `Allow-Origin: *` with credentials | Server must return specific origin, not `*` |
| Missing `Allow-Methods` | Add your method to server's allowed methods |
| Missing `Allow-Headers` | Add custom headers to server's allowed headers |
| Preflight 403/404 | Server doesn't handle OPTIONS or CORS middleware missing |
| No `Vary: Origin` | Add `Vary: Origin` to prevent cache issues |

## Technical Details

- Built with React + TypeScript
- Uses native `fetch` API with `mode: 'cors'`
- 15-second timeout per request
- Runs entirely in-browser (no proxy)
- Subject to browser CORS enforcement (same as real apps)
- History stored in component state (clears on refresh)

## Limitations

- Cannot test endpoints that block the current origin (browser enforces CORS)
- Requires target server to allow this origin or `*`
- Some corporate networks may block cross-origin requests
- Cookies/credentials only work with same-site or explicitly allowed origins