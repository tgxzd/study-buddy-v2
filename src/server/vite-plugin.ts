import type { Plugin } from 'vite'
import express from 'express'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth'
import groupRoutes from './routes/groups'
import fileRoutes from './routes/files'
import dashboardRoutes from './routes/dashboard'
import sessionRoutes from './routes/sessions'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import multer from 'multer'

export function apiServer(): Plugin {
  return {
    name: 'api-server',
    apply: 'serve',
    async configureServer(server) {
      // Create a dedicated Express app for the Vite middleware
      const apiApp = express()

      // Configure multer for file uploads
      const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 },
      })

      // Middleware
      apiApp.use(express.json())
      apiApp.use(express.urlencoded({ extended: true }))
      apiApp.use(cookieParser())
      apiApp.use(requestLogger)

      // Make upload available to routes
      apiApp.use((req: any, _res, next) => {
        req.upload = upload
        next()
      })

      // API Routes
      apiApp.use('/api/auth', authRoutes)
      apiApp.use('/api/groups', groupRoutes)
      apiApp.use('/api/files', fileRoutes)
      apiApp.use('/api/sessions', sessionRoutes)
      apiApp.use('/api/dashboard', dashboardRoutes)

      // Health check
      apiApp.get('/api/health', (_req, res) => {
        res.json({ status: 'ok', message: 'Server is running' })
      })

      // Error handling
      apiApp.use(errorHandler)

      // Insert the API middleware at the beginning of Vite's middleware chain
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.originalUrl || req.url || ''

        if (url.startsWith('/api')) {
          // Handle API requests with our dedicated Express app
          apiApp(req, res)
        } else {
          // Pass through to Vite's middlewares for all other requests
          next()
        }
      })
    },
  }
}
