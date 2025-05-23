import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';

/**
 * Start an HTTP server exposing MCP endpoints and Swagger docs.
 * @param server MCP server instance
 * @param port Port to listen on
 */
export async function startHttpServer(server: Server, port: number): Promise<void> {
  const app = express();
  app.use(express.json());

  // Load swagger document from docs/openapi.json
  const specPath = path.join(__dirname, '../docs/openapi.json');
  let spec: any = {};
  try {
    spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  } catch (err) {
    process.stderr.write(`Failed to read Swagger spec at ${specPath}: ${err}\n`);
  }

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
  app.get('/swagger.json', (_req, res) => res.json(spec));

  app.post('/mcp', async (req, res) => {
    try {
      const response = await (server as any).handleRequest(req.body);
      res.json(response);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.listen(port, () => {
    process.stderr.write(`HTTP server listening on port ${port}\n`);
  });
}
