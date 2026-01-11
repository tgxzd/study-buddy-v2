import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import authRoutes from './routes/auth'
import groupRoutes from './routes/groups'
import fileRoutes from './routes/files'
import dashboardRoutes from './routes/dashboard'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(requestLogger)

// Make upload available to routes
app.use((req, _res, next) => {
  ;(req as any).upload = upload
  next()
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Serve static files from dist folder (frontend build)
const distPath = path.join(__dirname, '../../dist')
app.use(express.static(distPath, { index: false }))

// SPA fallback: serve index.html for all non-API, non-static routes
app.use((req, res, next) => {
  // Don't intercept API routes or static files that were already served
  if (req.path.startsWith('/api') || req.path.includes('.')) {
    return next()
  }
  res.sendFile(path.join(distPath, 'index.html'))
})

// Error handling (must be after SPA fallback)
app.use(errorHandler)

// Only start listening if not running in Vite (for production)
if (process.env.NODE_ENV !== 'development' || !process.env.VITE) {
  const PORT = Number(process.env.PORT) || 3000
  const HOST = process.env.HOST || '0.0.0.0' // Allow external connections for port forwarding

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`Accessible via network at http://${HOST}:${PORT}`)
  })
}

export default app
