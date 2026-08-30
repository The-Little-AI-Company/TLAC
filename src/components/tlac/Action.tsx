import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * The TLAC action. This is the interface pages use; `ui/button` is the base it
 * adapts, and no page imports that base directly. Vendor prop names stop here.
 *
 * On the interaction, and why it is not a floating card:
 *
 * The first version gave every tone an amber hard offset shadow plus a hover
 * translate. That pairing is a borrowed look, not this system's, and running
 * the same amber behind every control made it louder still. It has been
 * removed rather than tuned.
 *
 * What replaced it comes from the ledger the direction is named after. A
 * filled control moves along its own colour ramp on hover, which reads as ink
 * pressing harder into paper. An outlined control gains rule weight, because
 * three rule strengths are already the system's way of showing hierarchy.
 * Nothing lifts, nothing floats, and nothing casts a coloured shadow.
 *
 * Every hover colour is measured against its foreground in the contrast
 * harness, exactly like the resting state, so a hover cannot quietly drop
 * below AA.
 *
 * Rendered from Astro with no client directive, this ships as static HTML and
 * no JavaScript. React is the adapter, not the runtime.
 */

type Tone = 'primary' | 'secondary' | 'quiet' | 'contrast';
type Scale = 'default' | 'sm' | 'lg';

const VARIANT_BY_TONE = {
  primary: 'default',
  secondary: 'outline',
  quiet: 'ghost',
  contrast: 'outline',
} as const;

/**
 * Each filled tone names both a surface and the foreground measured against
 * it. Passing one-off colour classes through `className` instead produced bone
 * text on a bone background once: contrast 1.0, the label present in the DOM
 * and invisible on screen. Pairing is the component's job, not the call site's.
 */
const TONE_CLASSES: Record<Tone, string> = {
  primary: 'border border-accent-primary bg-accent-primary text-on-primary hover:bg-accent-primary-hover hover:border-accent-primary-hover',
  secondary: 'border border-rule-default bg-transparent text-ink-primary hover:border-rule-accent hover:bg-surface-raised',
  quiet: 'border border-transparent bg-transparent text-ink-secondary hover:text-ink-primary hover:underline underline-offset-4',
  contrast: 'border border-surface-inverse bg-surface-inverse text-ink-inverse hover:bg-surface-inverse-hover hover:border-surface-inverse-hover',
};

/**
 * Colour-only transition. There is no transform to disable, so reduced motion
 * needs no special case here: a colour change is not motion.
 */
const SETTLE =
  'transition-[background-color,border-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out)]';

export interface ActionProps extends Omit<React.ComponentProps<'button'>, 'ref'> {
  tone?: Tone;
  scale?: Scale;
  /** Render as a link. A call to action that goes nowhere is a defect. */
  href?: string;
  children: React.ReactNode;
}

export function Action({
  tone = 'primary',
  scale = 'default',
  href,
  className,
  children,
  ...props
}: ActionProps) {
  const classes = cn('font-display font-bold tracking-[-0.01em]', TONE_CLASSES[tone], SETTLE, className);

  if (href) {
    // `asChild` hands the styling to a real anchor, so the element stays a
    // link: middle-click, open-in-new-tab, and Enter all keep working.
    return (
      <Button asChild variant={VARIANT_BY_TONE[tone]} size={scale} className={classes}>
        <a href={href} {...(props as React.ComponentProps<'a'>)}>
          {children}
        </a>
      </Button>
    );
  }

  return (
    <Button variant={VARIANT_BY_TONE[tone]} size={scale} className={classes} {...props}>
      {children}
    </Button>
  );
}

/** Exported so the contrast harness can measure every surface and foreground pair. */
export const ACTION_TONES = ['primary', 'secondary', 'quiet', 'contrast'] as const;
