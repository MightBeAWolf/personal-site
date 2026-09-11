---
title: Argo CD
summary: A declarative GitOps continuous-delivery tool for Kubernetes — the cluster's actual state is reconciled from Git.
link: https://argo-cd.readthedocs.io/
---

Argo CD watches a Git repository and continuously reconciles a
<button type="button" class="glossary-term" data-glossary-term="kubernetes">Kubernetes</button>
cluster to match what's declared there. Drift gets corrected automatically,
every change is a commit, and "what's actually running" is always
answerable by reading the repo instead of the cluster.

This is the GitOps engine behind the production
<button type="button" class="glossary-term" data-glossary-term="k3s">K3s</button>
cluster this consultancy runs on Hetzner under a single-operator model —
one of the concrete pieces of the "if it isn't in a repo, it isn't real"
approach described on this page.
