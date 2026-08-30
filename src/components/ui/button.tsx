import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * The shadcn/ui base button, adapted for TLAC. Source: shadcn/ui (MIT),
 * installed with the CLI at version 4.16.0. Recorded in docs/PROVENANCE.md.
 *
 * Four changes from the stock component, each with a reason:
 *
 * 1. `outline-none` removed. The stock button kills the outline and draws a
 *    ring instead. This system draws focus with an outline in global.css, so
 *    the stock class silently left the button with no focus indicator at all.
 *    The ring classes are gone with it — two indicators is worse than one.
 *
 * 2. Every `dark:` variant removed. Themes here switch on a `data-theme`
 *    attribute, not Tailwind's dark variant, so those classes could never
 *    match. Dead styling that reads as live styling is worse than none.
 *
 * 3. `rounded-md` becomes `rounded-none`. The Night Ledger direction is
 *    square. A corner radius is an opt-in through `className`, not a default.
 *
 * 4. Sizes grew. The stock 36px default is below the 44px pointer target that
 *    a touch device wants.
 *
 * Page code should not import this directly. It is the base that
 * `components/tlac/Action.tsx` adapts, which is what keeps vendor prop names
 * from spreading through pages.
 */
const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2',
    'rounded-none text-sm font-medium whitespace-nowrap',
    'transition-colors',
    // Focus is the system outline from global.css. Nothing here removes it.
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-invalid:border-state-danger',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-accent-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-accent-hot/90',
        outline: 'border border-rule-strong bg-transparent hover:bg-surface-raised',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-surface-overlay',
        ghost: 'bg-transparent hover:bg-surface-raised',
        link: 'bg-transparent text-ink-link underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5 py-2 has-[>svg]:px-4',
        sm: 'h-9 gap-1.5 px-4 has-[>svg]:px-3',
        lg: 'h-14 px-8 text-base has-[>svg]:px-6',
        icon: 'size-11',
        'icon-sm': 'size-9',
        'icon-lg': 'size-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
