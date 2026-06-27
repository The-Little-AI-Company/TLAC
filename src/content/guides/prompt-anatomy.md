---
title: "The Prompt Anatomy"
description: "Turn vague requests into prompts that work in one shot - a fill-in-the-blank, five-part brief."
pillar: "Prompting"
order: 2
---

**Outcome:** turn vague requests into prompts that get usable results in one shot — and know how to tell it worked.

**Who it's for:** anyone using AI for real work who's tired of "make this better" handing back mush.

**The big idea:** a good prompt isn't a magic spell. It's a *brief* — the kind you'd give a sharp new assistant. Five parts. Fill them in.

---

## The five parts

**1. Role** — who you want the AI to be.
> *You are a [specific expert] who [relevant strength].*

Sets the vocabulary, depth, and priorities. "A plain-spoken bookkeeper" answers differently than "a tax attorney." Generic role → generic answer.

**2. Context** — what it needs to know (and nothing private it doesn't).
> *Here's the situation: [background]. It's for [who]; it matters because [why]. Here's the material: [paste / attach].*

Most bad output is missing context, not a bad model. Tell it **who the answer is for** and **why it matters** — same facts, different reader, different answer. Give the *right* material, not *all* material — and leave out names, account numbers, anything you wouldn't email.

**3. Task** — the one specific thing to do.
> *Do this: [single clear action].*

One ask per prompt. "Summarize AND rewrite AND translate" gets you three mediocre things. Chain them in separate steps instead.

**4. Format** — what the output should look like.
> *Give it as [bullets / table / 3 short paragraphs / email], about [length], in a [tone] tone.*

The model can't read your mind about shape. Telling it up front saves the reformatting round-trip. Be concrete — "about 4 sentences" beats "short" — and say what you **do** want, not just what you don't ("write in plain prose" works better than "no jargon").

**5. Example** — show one good one *(optional, but the biggest upgrade most people skip)*.
> *Good looks like: [sample].* — or — *Match the style of this: [paste].*

One example beats three paragraphs of description.

---

## Fill-in-the-blank template

```
Role:    You are a ________________ who ________________.
Context: Situation: ________________.
         It's for ____________ ; it matters because ____________.
         Material: ________________.
         (Leave out: names, numbers, anything private.)
Task:    ________________   ← one thing.
Format:  ________________ , about ____ long, ____ tone.
Example: Good looks like: ________________.
If unsure: say so — don't guess.
```

---

## Before → after

**Before:** "Write a follow-up email to a client." → generic, wrong tone, you rewrite it anyway.

**After:**
> **Role:** a warm, concise account manager.
> **Context:** 30-min call with a small-business client who's nervous about timing. We agreed to push launch one week. Don't mention budget.
> **Task:** draft the follow-up email.
> **Format:** 4 sentences max, friendly and reassuring, no jargon, end with one clear next step.
> **Example:** match the calm tone of "Thanks again for today — here's where we landed…"

→ usable in one shot.

---

## The five mistakes that cost you
- **No role** → a generic average of the internet.
- **All context or no context** → it loses the point, or it guesses.
- **Two tasks in one** → split them.
- **No format** → you spend prompting time on reformatting.
- **No example** → the fastest fix you're not using.

## Did it work? (review standard)
Good output is **usable with light edits**, **on-format**, and **about the thing you asked** — not a lecture around it. If you're rewriting from scratch, the prompt was missing **Context** or **Example**, not "the AI is bad."

## One move that cuts made-up answers
Add a line giving the AI permission to bail: *"If you're not sure, or it's not in what I gave you, say so — don't guess."* Giving it an out is one of the most effective ways to cut confident-but-wrong answers — it's a fix the AI makers themselves recommend. (Then run the checklist anyway.)

## Works on any model
The five parts work on every chatbot. One update for newer "thinking" models: you don't need to tack on "think step by step" anymore — they reason on their own, so just ask clearly. (On older models, "think step by step" can still help.)

## Safety note
Never paste private data (names, account numbers, health/legal details, anything under NDA) into Context. Describe it generically. What you paste can be stored.

## Next
Pair this with **[The "Is AI Wrong?" Checklist](/guides/is-ai-wrong)** — a good prompt gets a good-*looking* answer, and good-looking is exactly when you need to check it.
