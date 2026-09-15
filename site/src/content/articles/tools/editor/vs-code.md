---
title: VS Code
order: 2
---

# But not always.

Helix covers almost everything I need, generally, out of the box. A few
things still send me back to a GUI editor, and I'd rather admit that than
pretend otherwise.

The biggest one is debugging. `pdb++` covers Python well enough that it
barely counts as a gap for the terminal workflow. It doesn't cover
everything else. When I'm chasing a bug in a language or runtime where the
debugger story is thinner, or the bug only really gives itself up with real
breakpoints, watch expressions, and stepping through a call stack visually,
VS Code's debugger is just better tooling for that specific job. Pretending
otherwise would slow me down for no good reason.

The other one is other people. If I'm pairing with someone, or walking a
client through a change over a screen share, asking them to also pick up
subject-then-action modal editing first is a bad use of everyone's time.
VS Code is the thing almost anyone can already read, so that's what goes on
screen.

And sometimes it really is just the ecosystem: a language, framework, or
notebook-style workflow where the good tooling happens to live in a VS Code
extension and nowhere else yet.

None of that changes the default. Most editing still happens in Helix,
over SSH, on whatever box the work actually lives on. VS Code comes out for
the specific situations above, not because the terminal stopped being
enough.
