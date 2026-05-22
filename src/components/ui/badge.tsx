import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:  'border-border bg-secondary text-secondary-foreground',
        root:     'border-amber-500/40 bg-amber-500/10 text-amber-400',
        third:    'border-teal-500/40 bg-teal-500/10 text-teal-400',
        fifth:    'border-blue-500/40 bg-blue-500/10 text-blue-400',
        seventh:  'border-violet-500/40 bg-violet-500/10 text-violet-400',
        outline:  'border-border bg-transparent text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
