# mr-multiple-documents

Minimal reproducer: upload multiple documents from a browser to a Node.js Express endpoint which forwards them to Camunda 8 using `@camunda8/sdk` `uploadDocuments()`.

## Install

```
npm install
```

## Environment

Provide the standard Camunda 8 REST env vars (zero-conf constructor). Example (SaaS):

```
export CAMUNDA_OAUTH_URL="https://login.cloud.camunda.io/oauth/token"
export CAMUNDA_CLUSTER_ID="<cluster-id>"
export CAMUNDA_CLIENT_ID="<client-id>"
export CAMUNDA_CLIENT_SECRET="<client-secret>"
export CAMUNDA_REGION="<region>" # e.g. bru-2
```

Or for Self-Managed provide the corresponding endpoint / auth vars expected by the SDK.

## Run

```
npm start
```

Open http://localhost:3000 and select one or more files, then submit. The server will:

1. Receive the multipart form.
2. Convert each file to `{ filename, contentType, buffer }`.
3. Call `rest.uploadDocuments({ documents })`.
4. Return JSON with the filenames and raw Camunda response.

If env vars are missing, the first upload attempt returns a 500 with a helpful message (server still starts even if not configured yet).

## Notes

- Uses in-memory buffers via `multer.memoryStorage()` (sufficient for repro). For large files switch to disk or streaming.
- No additional features / validation to keep it minimal.

