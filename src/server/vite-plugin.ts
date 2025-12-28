import type { Plugin, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

export function apiServer(): Plugin {
  return {
    name: 'api-server',
    apply: 'serve',
    async configureServer(viteServer: ViteDevServer) {
      const { default: expressApp } = await import('./index.js')

      // Get the httpServer from Vite
      const httpServer = viteServer.httpServer
      if (!httpServer) return

      // Store original request listeners
      const originalListeners = httpServer.listeners('request').slice()

      // Remove all existing request listeners
      httpServer.removeAllListeners('request')

      // Add custom request handler that routes to Express or Vite
      httpServer.on('request', (req: IncomingMessage, res: ServerResponse) => {
        const url = req.url || ''

        if (url.startsWith('/api')) {
          // Handle API requests with Express
          expressApp(req as any, res as any)
        } else {
          // Handle non-API requests with Vite (for SPA routing)
          // Let Vite's transform middleware handle the request
          viteServer.middlewares(req, res, (err?: Error) => {
            if (err) {
              console.error('Vite middleware error:', err)
              res.statusCode = 500
              res.end('Internal Server Error')
            } else {
              // If no middleware handled it, let Vite's default handler take over
              for (const listener of originalListeners) {
                listener(req, res)
                if (res.writableEnded || res.headersSent) {
                  break
                }
              }
            }
          })
        }
      })

      httpServer.on('listening', () => {
        const port = viteServer.config.server.port || 3000
        console.log(`\n➜ API ready at http://localhost:${port}/api`)
        console.log(`\n➜ App running at http://localhost:${port}`)
      })
    },
  }
}
