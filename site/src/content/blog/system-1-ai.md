---
title: System 1 AI
description: "What happens when you point a small, non-generative 'reflex' model at a real filesystem-triage problem instead of a generative LLM."
date: 2026-09-25
---

## A problem with LLMs

A lot of agent pipelines I've built hit the same waste. Somewhere in the
middle sits a narrow, subjective decision that needs a structured answer. Something like
"is this file stale" or "which of these four labels applies?" The tool most
people reach for these days, when the context is subjective, is a full
generative LLM.

If you're okay with the cost, evaluation time, and the layers of checks and
processing needed to get structured output, an LLM could be a real option. In
most cases though, it's not all it's cracked up to be. You get a paragraph
back when you wanted a boolean. You pay tokens and latency for what should be
a quick classification problem. And because the model can say anything, it
can also hallucinate a schema violation you now have to guard against.

## Another option

Non-autoregressive models are built around calling this out directly. These
are small models, not generative at all, and they only answer three kinds of
questions:
- A `choice` over a fixed set of labeled criteria (with a probability
distribution over them)
- A `score` on an ordinal rubric
- Or a `noul`, a plain boolean with a calibrated probability attached.

They never generate text, so a malformed response isn't something you defend
against, it's not possible in the first place.

For my experiments I'll be using [Laya](https://laya.convaiinnovations.com/)
since it's open source. The creator of which frames the whole idea around a
concept from the book *Thinking, Fast and Slow* by Daniel Kahneman. The idea is
that a generative LLM is System 2, slow and deliberative and expensive, being
asked to do System 1 work, the instant, reflexive judgment that shouldn't need a
paragraph of reasoning to produce.

I came across this idea from all the hype surrounding "Jev" and [TypeSafe's ML primer](https://docs.typesafe.ai/introduction/machine-learning-primer).

The claims made of these "System 1" models are worth taking with a grain of
salt. The performance numbers are generally self-reported, with heavy marketing,
or YouTuber spice. I haven't run Laya's or TypeSafe's benchmark suite myself,
only the questions my experiment, rotfilter, actually asks it, so treat those
numbers as marketing until someone reruns them independently. The rest of this
post is what I could actually verify by running the thing.

They do, however, make a good pitch. So I built something with it and tried to break it.

## Generative LLM vs. reflex model

Roughly how the two approaches trade off, for the kind of narrow,
per-entry decision rotfilter needed:

| | Pros | Cons |
| - | - | - |
| Generative LLM | Handles genuinely open-ended or subjective input; no retraining needed to try a new question | Token-generation latency; can hallucinate; output has to be parsed and validated, not trusted as-is |
| Non-autoregressive reflex model (NRM), e.g. Laya | Millisecond latency; output schema can't be malformed; cheap enough to run locally at scale | Only answers `choice`/`score`/`noul`, nothing open-ended; a general-purpose checkpoint isn't necessarily calibrated for *your* task, as the next section shows |

## The experiment: rotfilter

[rotfilter](https://github.com/MightBeAWolf/rotfilter) walks a directory tree
and classifies every file, directory, and git project as Redundant,
Obsolete, or Trivial, using only filesystem and git metadata (`stat()`,
ACLs, xattrs, git status/log), never file contents. Laya sits in the middle
of it, asked a structured question per entry. Around it sits a layer of
deterministic, git-verified rules for anything that's actually checkable
instead of guessable.

Classification runs in three phases, because a file's fate isn't independent
of its surroundings. Project status rolls down from git facts first (a
repo's own commit history decides its status, and that seeds everything
beneath it). Individual files get classified next, with that context in
hand. Then directory verdicts get rolled back up from what their contents
actually turned out to be, because a directory has no identity of its own
beyond what it contains.

## What actually happened

Model confidence stayed low across the board, typically 5 to 20% on a
near-uniform prior, on every checkpoint I tried. That's not necessarily
wrong. Filesystem metadata alone may genuinely not carry enough signal for a
confident answer. But it means a single-shot verdict is a weak lean, not a
decision, and anything downstream that treats it as a decision is standing
on sand.

More concerning: the `choice` output turned out to be measurably
order-sensitive. Same input, same criteria, just a different key order in
the dict passed in, and it produced a different winning answer. I confirmed
this directly by permuting the order and changing nothing else. A
calibrated-decision model whose decision changes because of dict ordering
isn't calibrated in any sense I can rely on.

`redundant` got dropped from the question set entirely. A single-file
metadata call structurally can't detect duplication, since the model never
sees sibling content or hashes. What looked like signal early on turned out
to be noise from correlated metadata, not the thing I was actually asking
about. Of the remaining questions, only `obsolete` showed real, reproducible
variance tied to genuine file differences, and even that didn't hold up
under a synthetic test that isolated file age while holding every other
metadata field constant. The earlier-looking correlation was riding on
path, extension, and size differences between real files, not date
reasoning.

Directory-level judgments frequently disagreed with their own children too.
One directory said `keep` while 15 of its 17 files said `archive`. That
happened often enough that I ended up adding the roll-up phase specifically
to catch it, not as a one-off patch.

One thing did work cleanly. Precomputing derived facts (handing the model a
plain integer for `days_since_modified` instead of a raw timestamp)
measurably improved answers in the intended direction, more than any amount
of prompt rewording did. And the deterministic overrides, the parts that
don't ask the model anything at all, are unsurprisingly the only parts of
the tool I'd actually trust unattended.

## Where that leaves me

None of this reads as a dead end for the approach. The decisions the models
made were close enough to be promising, and they were fast and could be run
reliably on local hardware.

A small, local, non-generative model reasoning over structured, typed questions
is still a direction I think the industry underinvests in, and both Laya and
TypeSafe's RLCD framing are pointed at something real: most of what a pipeline
needs from a model isn't prose, it's a well-calibrated, machine-consumable
decision. But a general-purpose checkpoint, prompted at a task it wasn't tuned
for, is exactly the setup that produces the failure modes above: low confidence,
order sensitivity, directories disagreeing with their own contents. No amount of
prompt engineering fixed any of them.

If I pick rotfilter back up, the next step isn't a better prompt. It's a
small hand-labeled dataset of real files with real ROT judgments, a
fine-tune on that specific task, and an actual calibration check (does
confidence predict correctness) before I'd trust the output for anything
with a `delete` label near it. Every finding above came from running the
thing against real and synthetic data and watching what it actually did, not
from reading Laya's documentation and assuming it would behave as
advertised. That gap between the pitch and the empirical behavior is the
whole point of running the experiment in the first place.
