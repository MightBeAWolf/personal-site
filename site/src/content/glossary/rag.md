---
title: RAG
summary: Retrieval-Augmented Generation — grounding an LLM's answers in retrieved documents instead of memory alone.
---

RAG pairs a retrieval step (typically a vector or hybrid search over a
document store) with a language model's generation step: relevant passages
get pulled first and fed into the model's context, so its answer is
grounded in real, current source material rather than whatever it memorized
during training.

Per the résumé, this is a core piece of the AI infrastructure work
described here — RAG pipelines and RAG-backed agents built to bridge legacy
systems with modern, containerized AI workflows, often alongside
<button type="button" class="glossary-term" data-glossary-term="mcp">MCP</button>
for giving the same agents structured access to tools.
