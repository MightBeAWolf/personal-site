---
title: Bash over Fish
order: 1
---

# Same shell, everywhere.

Fish is a genuinely nicer interactive shell out of the box. Autosuggestions,
sane defaults, syntax highlighting without any configuration. I've used
it, and I understand why people switch and don't look back.

The problem is everywhere else. Every server I SSH into, every CI runner,
nearly every container base image, defaults to bash or plain `sh`, not
fish. Fish scripts aren't POSIX compatible, so anything written for
interactive use in fish still has to be rewritten in bash (or sh) the
moment it needs to run unattended somewhere else: a cron job, a CI
pipeline, a Dockerfile `RUN` line. That's a second shell dialect to
maintain for no real benefit.

Bash isn't the nicer shell to type into. It's the one that's already
there, whether I'm sitting at a laptop or SSHed into a node three time
zones away, interactively and in a script, with nothing to translate
between the two. That's worth more to me than better tab completion.
