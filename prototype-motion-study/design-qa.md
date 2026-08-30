# Design QA

## Comparison target

- Primary source: C:/Users/jeffk/Jeff's Agent Workshop/dev/repos/the-little-ai-company/TLAC/prototype-motion-study/references/option-3-night-ledger.png
- Companion source: C:/Users/jeffk/Jeff's Agent Workshop/dev/repos/the-little-ai-company/TLAC/prototype-motion-study/references/option-1-signal-workshop.png
- Primary implementation: C:/Users/jeffk/Jeff's Agent Workshop/dev/repos/the-little-ai-company/TLAC/prototype-motion-study/qa/ledger-hero-639x698.jpg
- Companion implementation: C:/Users/jeffk/Jeff's Agent Workshop/dev/repos/the-little-ai-company/TLAC/prototype-motion-study/qa/signal-hero-final-639x698.jpg
- Full-page captures: ledger-full-mobile.jpg and signal-full-final-mobile.jpg in the same QA folder
- State: first viewport, motion running, no hover state

The source images are 1487 by 1058 pixels. The in-app browser used a 639 by 698 CSS viewport at 1.25 device pixel ratio. Its screenshots are 624 by 680 pixels after browser chrome and scrollbars. No density normalization was used. The comparison treats the implementation as the responsive form of the desktop source. It does not claim pixel-level desktop fidelity.

## Full-view comparison

The source and implementation hero captures were opened together for each variant. Option 3 keeps the ledger hierarchy, framed maritime artwork, oversized headline, mono labels, and Fal dither language. The implementation changes the source green field to navy, blue, amber, and coral by request.

Option 1 keeps the dark signal field, warm headline, orange action, bright dither colors, and Hoolio hierarchy. Its selected display font changes from the mock's serif to Archivo by request.

The full-page captures show the added learning, guide, tool, and closing sections. The source mocks do not define these sections. They extend the selected systems instead of serving as fidelity targets.

## Focused comparison

The focused pass checked the headline wrap, body copy, actions, dither crop, Hoolio scale, color balance, and prototype controls. The narrow layout preserves the maritime hero, headline, and actions in a clear reading order.

## Findings

No P0, P1, or P2 findings remain.

### Fonts and typography

Archivo creates a denser and clearer display voice than the first prototype. Manrope keeps body copy readable. IBM Plex Mono stays limited to short labels. The narrow heading wraps remain intentional and do not clip.

### Spacing and layout rhythm

Both variants have clear reading order and no horizontal overflow at the tested viewport. The fixed prototype controls remain visible. They do not block the primary actions after the mobile spacing fixes.

### Colors and visual tokens

Option 3 removes the green-on-green cast. Bone text has strong contrast on navy. Blue, amber, and coral carry separate roles. Option 1 returns to the selected navy field with orange, blue, mint, and coral accents.

### Image quality and asset fidelity

The hero uses the approved maritime WebP assets based on Hoolio. The page does not redraw the mascot in code. The dither field uses the existing Fal frame sequence.

### Copy and content

The original hero copy remains intact. The added section copy supports the practical-education message. Product links are draft anchors because this is a throwaway prototype.

## Comparison history

1. P1: a legacy ?variant=C URL loaded the new HTML with cached old JavaScript. The page showed a black field and threw a querySelector error. The fix maps legacy keys, guards missing canvases, and cache-busts prototype assets. The repaired browser capture shows option 3 with no console errors.
2. P2: narrow-screen headlines and the fixed switcher crowded the first viewport. The fix reduced mobile display size and tightened hero padding. The revised captures keep the body copy and actions clear.
3. P1: option 1 initially drifted to a white field. The fix restored the selected navy field, warm text, orange action, and multicolor dither. The final paired comparison confirms the correction.

## Browser checks

- Loaded legacy ?variant=C and confirmed option 3 renders.
- Switched variants with buttons and the left arrow key.
- Followed the Start here, Guides, and Tools anchors.
- Toggled the motion control and confirmed its pressed state.
- Confirmed Fal frames reached the ready state at 11 frames per second.
- Confirmed the active canvas has nonzero dimensions.
- Confirmed no horizontal overflow at 639 CSS pixels.
- Checked the browser console after the final reload. It had no errors or warnings.

Reduced-motion behavior is present in CSS and JavaScript. This browser run did not emulate that operating-system preference.

## Follow-up polish

- Repeat the comparison at a 1440 by 1024 browser viewport before production implementation.
- Replace draft anchors with real destinations only after the production information architecture is approved.

## Full-bleed motion correction

- Source visual truth: C:/Users/jeffk/Jeff's Agent Workshop/dev/repos/the-little-ai-company/TLAC/prototype-motion-study/qa/source-user-full-bleed-motion.png
- Matched implementation: C:/Users/jeffk/Jeff's Agent Workshop/dev/repos/the-little-ai-company/TLAC/prototype-motion-study/qa/implementation-after-full-bleed-1911x925.png
- Paired evidence: C:/Users/jeffk/Jeff's Agent Workshop/dev/repos/the-little-ai-company/TLAC/prototype-motion-study/qa/comparison-full-bleed-motion.png
- Compact evidence: implementation-after-full-bleed-compact.png in the same QA folder
- Phone evidence: implementation-after-full-bleed-phone.png and implementation-after-full-bleed-phone-signal.png in the same QA folder
- State: hero at the top, motion running, no hover state

The source and matched implementation are both 1911 by 925 pixels. The matched implementation used a 1926 by 932 browser viewport. Browser scrollbars reduced the saved capture to the source dimensions. No image scaling or density normalization was required.

The issue capture showed a 370.5 by 823.3 motion field inside a 1684 by 980.1 hero. The corrected desktop field and canvas match the hero bounds exactly. Both variants use the Fal field as the hero background. The ship artwork and copy remain above it.

The focused pass checked the field edges, ship crop, headline contrast, actions, fixed switcher, and horizontal overflow. It also checked both variants at 639 by 698 and 390 by 844 browser viewports. The canvas matched the hero bounds at each size. The browser console had no errors or warnings.

### Comparison history update

4. P1: the Fal canvas was confined to a narrow right-side aperture. The fix makes both canvas wrappers fill their hero, removes conflicting responsive limits, and prevents pointer interception. The post-fix paired evidence shows motion across the full hero while the ship and copy remain clear.
5. P2: hidden variants continued to draw after a variant switch. The renderer now tracks its active state. Hidden renderers stop drawing, and the active renderer resizes when it becomes visible.

No P0, P1, or P2 findings remain after this correction.

final result: passed
