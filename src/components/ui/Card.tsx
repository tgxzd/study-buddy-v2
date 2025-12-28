import { type HTMLAttributes, forwardRef } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'elevated'
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'glass', hover = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-bg-tertiary border border-white/5',
      glass: 'bg-white/5 backdrop-blur-lg border border-white/10',
      gradient: 'bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/30',
      elevated: 'bg-bg-tertiary border border-white/5 shadow-2xl shadow-black/50',
    }

    const hoverStyles = hover
      ? 'hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300'
      : ''

    return (
      <div
        ref={ref}
        className={`rounded-2xl p-6 ${variants[variant]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
