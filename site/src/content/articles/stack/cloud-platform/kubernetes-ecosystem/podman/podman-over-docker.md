---
title: Podman over Docker
order: 1
---

Docker's daemon runs as a persistent, typically root-owned background
process — anything that can reach it can effectively act as root on the
host. Podman is rootless and daemonless by default: containers run as
regular child processes under the invoking user, with no standing
privileged service to compromise. On systems that also carry
NIST 800-171 / CMMC 2.0 obligations, that's not a nice-to-have, it's one
less thing to justify in an audit.

The switch is low-friction because Podman's CLI is close to a drop-in
replacement for Docker's — most muscle memory and most existing scripts
carry over directly. Where it goes further is systemd integration
(Quadlet): a container can be defined as an ordinary systemd unit and
managed with the same `systemctl`/`journalctl` habits used for everything
else on the box, rather than a separate container runtime with its own
lifecycle tooling bolted on the side.

That's the same principle behind treating a laptop the same way as a node
in a cluster: fewer special cases, fewer standing daemons, fewer things
that behave differently depending on which machine they're running on.
