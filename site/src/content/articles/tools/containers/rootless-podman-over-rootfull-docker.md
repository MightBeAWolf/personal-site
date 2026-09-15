---
title: Rootless Podman over Rootfull Docker
order: 1
---

# Rootless, or it doesn't run.

Docker's daemon runs as a single, typically root owned, background
process. Every container command goes through it, and anything that can
reach that socket can effectively act as root on the host. I spent years
accepting that as just how containers worked.

Podman doesn't have a daemon at all. Containers run as regular child
processes of whichever user started them, rootless by default, with no
privileged service sitting there the whole time waiting to be the thing
that gets compromised. On projects that also carry NIST 800-171 / CMMC 2.0
obligations, that's not a nice to have, it's one less thing to explain in
an audit and one less way for a container escape to turn into a host
compromise.

Switching didn't cost much. Podman's CLI is close enough to Docker's that
most muscle memory and most existing scripts carried over directly. Where
it actually goes further is systemd integration through Quadlet: a
container becomes an ordinary systemd unit, managed with the same
`systemctl` and `journalctl` habits as everything else on the box, instead
of a separate runtime with its own lifecycle tooling bolted on the side.

It's the same instinct behind treating a laptop the same way as a node in
a cluster: fewer standing daemons, fewer special cases, fewer things
running as root just because that used to be the default.
