---
project: TLAC
status: done
slice: Accessibility and keyboard focus pass
branch: feat/14-accessibility-focus-pass
related_modules: [codebase]
verification: [accessibility-focus-smoke]
gates: [human-gates]
---
# Accessibility Focus Pass

Issue #14 adds a built-site accessibility smoke gate and hardens the shared
keyboard path across the TLAC MVP.

Result: the build now checks six core routes for heading structure, skip-link
targets, image alt attributes, accessible link names, contrast tokens, and text
wrapping support. The skip link now lands focus on the main content target.
