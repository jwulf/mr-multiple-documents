# mr-multiple-documents

Minimal reproducer: upload multiple documents from a browser to a Node.js Express endpoint which forwards them to Camunda 8 using `@camunda8/sdk` `uploadDocuments()`.

## Install

```
npm install
```

## Environment

Provide the standard Camunda 8 REST env vars (zero-conf constructor).

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

## Workaround 1: Write files to disk temporarily

```typescript
// Convert buffers to ReadStreams acceptable to uploadDocuments by writing to temp files
const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'mr-docs-'));
const streams: ReadStream[] = uploadedFiles.map((file) => {
    const randomName = crypto.randomBytes(8).toString('hex') + '-' + file.originalname;
    const filePath = path.join(tmpDir, randomName);
    writeFileSync(filePath, file.buffer);
    const rs: ReadStream = fs.createReadStream(filePath);
    return rs;
});
// Warning: temp file cleanup not handled. 
```

## Workaround 2: In-memory stream with metadata

```typescript
// In-memory conversion: create Readable streams exposing a path so form-data infers filename
const streams: ReadStream[] = uploadedFiles.map((file) => {
    const stream = new Readable({
    read() {
        this.push(file.buffer);
        this.push(null);
    }
    });
    // Provide minimal fs.ReadStream-like fields used by form-data for filename inference.
    (stream as any).path = file.originalname;
    (stream as any).close = () => stream.destroy();
    return stream as unknown as ReadStream;
});
```