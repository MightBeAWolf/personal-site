---
title: Mise Cookbook - Python
summary: My baseline for a python environment in mise-en-place
---

```toml
[tools]
# Statically define the python verson.
python = "3.13"
# The language-server configured for Python in my Helix Editor config.
ruff = "latest"

[env]
# Where to create the python virtual environment
_.python.venv = {path = ".venv", create = true }

# Message of the Day for the project
# This hook runs when the project is entered. Changing directories within the
# project does not trigger it again.
[hooks.enter]
run = '''
cat << HEREDOC
##########################################################
 Welcome to {{ config_root | basename }}
##########################################################
 To get started, ...
HEREDOC
'''
```

