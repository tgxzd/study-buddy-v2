import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import authRoutes from './routes/auth'
import groupRoutes from './routes/groups'
import fileRoutes from './routes/files'
import dashboardRoutes from './routes/dashboard'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'

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

// Error handling
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
