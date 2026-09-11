---
title: K3s
summary: A lightweight, single-binary Kubernetes distribution built for edge, IoT, and small-footprint clusters.
link: https://k3s.io/
---

K3s is a certified <button type="button" class="glossary-term" data-glossary-term="kubernetes">Kubernetes</button> distribution
packaged as a single small binary, with the datastore, networking, and
extras a full cluster needs simplified or swapped for lighter defaults —
built for edge devices and small clusters, but perfectly capable of running
a production workload on a handful of nodes.

It's the cluster this site's own infrastructure runs on: a production K3s
cluster on Hetzner, reconciled by <button type="button" class="glossary-term" data-glossary-term="argo-cd">Argo CD</button> under
a single-operator GitOps model — Authentik SSO, step-ca private PKI,
CloudNativePG, and a Grafana/Loki/Prometheus stack all riding on top of it.
