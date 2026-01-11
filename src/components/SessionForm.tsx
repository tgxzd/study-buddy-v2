import { useState } from 'react'
import Button from './ui/Button'
import Card from './ui/Card'
import { sessionsApi } from '@/lib/api'

interface SessionFormProps {
  groupId: string
  session?: {
    id: string
    title: string
    description: string | null
    date: string
    link: string | null
    location: string | null
  } | null
  onSuccess: () => void
  onCancel: () => void
}

export default function SessionForm({ groupId, session, onSuccess, onCancel }: SessionFormProps) {
  const [title, setTitle] = useState(session?.title || '')
  const [description, setDescription] = useState(session?.description || '')
  const [date, setDate] = useState(() => {
    if (session?.date) {
      const d = new Date(session.date)
      // Format for datetime-local input: YYYY-MM-DDTHH:mm
      return d.toISOString().slice(0, 16)
    }
    return ''
  })
  const [link, setLink] = useState(session?.link || '')
  const [location, setLocation] = useState(session?.location || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = !!session

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !date) {
      alert('Title and date are required')
      return
    }

    try {
      setIsSubmitting(true)

      const sessionDate = new Date(date)

      if (isEdit && session) {
        await sessionsApi.update(session.id, {
          title: title || undefined,
          description: description || undefined,
          date: sessionDate,
          link: link || undefined,
          location: location || undefined,
        })
      } else {
        await sessionsApi.create({
          title,
          description: description || undefined,
          date: sessionDate,
          link: link || undefined,
          location: location || undefined,
          groupId,
        })
      }

      onSuccess()
    } catch (err: any) {
      alert(err.message || `Failed to ${isEdit ? 'update' : 'create'} session`)
      setIsSubmitting(false)
    }
  }

  return (
    <Card variant="glass" className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        {isEdit ? 'Edit Session' : 'Create New Session'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Midterm Study Session"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-purple-500 transition-colors"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will you be studying?"
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
        </div>

        {/* Date and Time */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-text-secondary mb-2">
            Date and Time <span className="text-red-400">*</span>
          </label>
          <input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            required
          />
        </div>

        {/* Location (Optional) */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-text-secondary mb-2">
            Location (Optional)
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Library Room 3B"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Meeting Link (Optional) */}
        <div>
          <label htmlFor="link" className="block text-sm font-medium text-text-secondary mb-2">
            Meeting Link (Optional)
          </label>
          <input
            id="link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://zoom.us/j/..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-purple-500 transition-colors"
          />
          <p className="mt-1 text-xs text-text-muted">
            For online meetings (Zoom, Google Meet, etc.)
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Session' : 'Create Session')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
