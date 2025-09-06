import express, { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import { Camunda8, CamundaRestClient } from '@camunda8/sdk';
import { ReadStream } from 'fs';
import { Readable } from 'stream';

// In-memory storage; sufficient for a minimal reproducer.
const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();
const port = process.env.PORT || 3000;

// Serve static index.html
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Camunda REST client (zero-conf via env vars) - lazy init so the server can start
let rest: CamundaRestClient; // initialized on first use

// Controller: receive multiple files and forward to Camunda
// Field name 'documents' must match the form input name attribute.
app.post('/upload', upload.array('documents'), async (req: Request, res: Response) => {
  try {
    const uploadedFiles = (req.files as Express.Multer.File[] | undefined);
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!rest) {
      try {
        const c8 = new Camunda8();
        rest = c8.getCamundaRestClient();
      } catch (initErr: unknown) {
        const message = initErr instanceof Error ? initErr.message : String(initErr);
        return res.status(500).json({ error: 'Failed to initialize Camunda client (check env vars)', details: message });
      }
    }

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

    const response = await rest.uploadDocuments({ files: streams });

    res.json({
      uploaded: uploadedFiles.map(f => f.originalname),
      camundaResponse: response
    });
  } catch (err: unknown) {
    console.error('Upload error:', err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Upload failed', details: message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
