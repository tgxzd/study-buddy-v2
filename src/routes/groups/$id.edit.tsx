import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { groupsApi } from '@/lib/api'

export const Route = createFileRoute('/groups/$id/edit')({
  component: EditGroup,
})

function EditGroup() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchGroup()
  }, [id])

  const fetchGroup = async () => {
    try {
      const response = await groupsApi.getById(id)
      setFormData({
        name: response.group.name,
        description: response.group.description || '',
      })
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to load group' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrors({})

    try {
      // Basic validation
      if (!formData.name || formData.name.length < 2) {
        setErrors((prev) => ({ ...prev, name: 'Group name must be at least 2 characters' }))
        setIsSaving(false)
        return
      }
      if (formData.name.length > 100) {
        setErrors((prev) => ({ ...prev, name: 'Group name must be less than 100 characters' }))
        setIsSaving(false)
        return
      }
      if (formData.description && formData.description.length > 500) {
        setErrors((prev) => ({ ...prev, description: 'Description must be less than 500 characters' }))
        setIsSaving(false)
        return
      }

      // Call the API to update group
      await groupsApi.update(id, {
        name: formData.name,
        description: formData.description || undefined,
      })

      // Navigate back to group details
      navigate({ to: `/groups/${id}` })
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        form: error.message || 'Failed to update group',
      }))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex justify-center items-center py-16">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate({ to: `/groups/${id}` })}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Group
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Edit Study Group
          </h1>
          <p className="text-text-secondary">
            Update group information
          </p>
        </div>

        {/* Form */}
        <Card variant="glass">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl">
                {errors.form}
              </div>
            )}

            <Input
              label="Group Name"
              type="text"
              name="name"
              placeholder="e.g., CS101 Study Group"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              maxLength={100}
              required
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                placeholder="What is this group about?"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-text-muted focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all duration-200"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-400">{errors.description}</p>
              )}
              <p className="mt-2 text-xs text-text-muted text-right">
                {formData.description.length}/500
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate({ to: `/groups/${id}` })}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
