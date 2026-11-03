// Cloudflare Worker entrypoint for FitFuel Full-Stack Application
import requestHandler from './server.js';
import { Readable } from 'node:stream';
import { Buffer } from 'node:buffer';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Populate process.env from Cloudflare env vars if available
    if (env) {
      for (const [k, v] of Object.entries(env)) {
        if (typeof v === 'string' && !process.env[k]) {
          process.env[k] = v;
        }
      }
    }

    // 1. If it's an API request, route through the API requestHandler
    if (url.pathname.startsWith('/api/')) {
      return new Promise(async (resolve) => {
        try {
          const reqMethod = request.method;
          const reqHeaders = {};
          for (const [k, v] of request.headers.entries()) {
            reqHeaders[k.toLowerCase()] = v;
          }

          let bodyBuffer = null;
          if (reqMethod !== 'GET' && reqMethod !== 'HEAD') {
            const ab = await request.arrayBuffer();
            bodyBuffer = Buffer.from(ab);
          }

          // Mock Node.js IncomingMessage
          const req = new Readable({
            read() {
              if (bodyBuffer) {
                this.push(bodyBuffer);
                bodyBuffer = null;
              }
              this.push(null);
            }
          });
          req.method = reqMethod;
          req.url = url.pathname + url.search;
          req.headers = reqHeaders;

          // Mock Node.js ServerResponse
          let statusCode = 200;
          let resHeaders = {};
          let chunks = [];

          const res = {
            writeHead(code, headers) {
              statusCode = code;
              if (headers) {
                for (const [hk, hv] of Object.entries(headers)) {
                  resHeaders[hk.toLowerCase()] = hv;
                }
              }
              return this;
            },
            setHeader(name, value) {
              resHeaders[name.toLowerCase()] = value;
              return this;
            },
            getHeader(name) {
              return resHeaders[name.toLowerCase()];
            },
            write(chunk) {
              if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              return true;
            },
            end(chunk) {
              if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              const finalBody = Buffer.concat(chunks);
              
              // Ensure default headers
              if (!resHeaders['content-type']) {
                resHeaders['content-type'] = 'application/json; charset=utf-8';
              }
              resHeaders['access-control-allow-origin'] = '*';
              resHeaders['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              resHeaders['access-control-allow-headers'] = 'Content-Type, Authorization';

              resolve(new Response(finalBody, {
                status: statusCode,
                headers: resHeaders
              }));
            }
          };

          await requestHandler(req, res);
        } catch (err) {
          resolve(new Response(JSON.stringify({ ok: false, error: 'Worker error: ' + err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      });
    }

    // 2. All other requests -> Serve static assets from [assets] binding
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Asset not found', { status: 404 });
  }
};
