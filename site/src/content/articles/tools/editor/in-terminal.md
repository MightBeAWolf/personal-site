---
title: In Terminal
order: 1
---

# I write most of my code in a terminal.

Yes. I know this is crazy. The thing is, terminal editors have gotten very
good, plus most of my editing happens over SSH, not locally. Yes, there are ways
to run VS Code over SSH connections, but a lot of the times I might need to only
make one or two small edits here and there - not enough to spawn a VS Code server
for a client to connect to.

I didn't always feel this way. I too had trouble exiting `vim` the first time I
tried it. [nvim](https://neovim.io/) let me customize the experience, but still
didn't make me feel productive.

[Kakoune](https://kakoune.org/) and its subject-then-action was a revelation for
me in this space. Once I discovered it, after some practice, I realized I could
write code much faster than I could in a more graphical tool like VS Code.

But still, it didn't feel quite there.

[Helix](https://helix-editor.com/) specifically is what turned me into a
believer. It has the productive subject-then-action mechanics that Kakoune has
(over vim's action-then-subject), and has everything I need, generally, out of
the box.

The only thing it really doesn't have is integration with a debugger (though
linters and language-servers can all be connected). These days though, thanks
to things like [pdb++](https://github.com/pdbpp/pdbpp), that really isn't a
big issue.

# But how can you...

## Read more than one file at once?

I can have more than one tab (buffer) open.
![Helix with multiple buffers open at once](/helix-multi-tab.png)

Or, I can split my terminal into tiles!
![Helix with multiple windows open at once](/helix-multi-window.png)

## Search a whole project?

I can search for files by name
![Helix file name search](/helix-file-name-search-preview.png)

I can search file contents for a regex string
![Helix file content search](/helix-file-content-search-preview.png)


