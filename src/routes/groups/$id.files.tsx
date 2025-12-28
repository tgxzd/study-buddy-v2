import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Upload, Download, Trash2, FileText, FileImage, File } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { filesApi } from '@/lib/api'

interface FileItem {
  id: string
  filename: string
  size: number
  mimeType: string
  createdAt: string
  uploader: {
    name: string
  }
}

export const Route = createFileRoute('/groups/$id/files')({
  component: GroupFiles,
})

function GroupFiles() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchFiles()
  }, [id])

  const fetchFiles = async () => {
    try {
      setIsLoading(true)
      const response = await filesApi.list(id)
      setFiles(response.files)
    } catch (err: any) {
      setError(err.message || 'Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit')
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/plain',
    ]
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('File type not allowed. Allowed types: PDF, DOC, DOCX, JPG, PNG, TXT')
      return
    }

    try {
      setIsUploading(true)
      await filesApi.upload(selectedFile, id)
      // Refresh file list
      fetchFiles()
    } catch (err: any) {
      alert(err.message || 'Failed to upload file')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownload = (fileId: string, filename: string) => {
    filesApi.download(fileId, filename).catch((err) => {
      alert(err.message || 'Failed to download file')
    })
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return
    }

    try {
      await filesApi.delete(fileId)
      // Refresh file list
      fetchFiles()
    } catch (err: any) {
      alert(err.message || 'Failed to delete file')
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileImage className="w-5 h-5 text-purple-400" />
    }
    if (mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-400" />
    }
    return <File className="w-5 h-5 text-blue-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: `/groups/${id}` })}
            className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Group
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Group Files
                </h1>
                <p className="text-text-secondary">
                  {files.length} file{files.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleFileSelect}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card variant="glass" className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              variant="primary"
              onClick={fetchFiles}
            >
              Retry
            </Button>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && files.length === 0 && (
          <Card variant="glass" className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Files Yet
            </h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Upload study materials, notes, and resources to share with your group.
            </p>
            <Button
              variant="primary"
              onClick={handleFileSelect}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload First File
            </Button>
          </Card>
        )}

        {/* Files List */}
        {!isLoading && !error && files.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {files.map((file) => (
              <Card key={file.id} variant="glass">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{file.filename}</h3>
                        <p className="text-sm text-text-muted">
                          {formatFileSize(file.size)} • Uploaded by {file.uploader.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(file.id, file.filename)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(file.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
