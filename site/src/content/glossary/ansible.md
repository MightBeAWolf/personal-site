---
title: Ansible
summary: An agentless configuration-management and automation tool driven by declarative YAML playbooks.
link: https://www.ansible.com/
---

Ansible configures machines over plain SSH, with no agent to install on the
target — a playbook describes the desired end state, and Ansible works out
how to get there, idempotently, so running it twice is safe.

Per the résumé, this covers full-stack operations automation alongside
Terraform/OpenTofu and Proxmox, and the CI/CD pipelines that build on top of
it. Ansible Molecule is the testing layer that verifies a role actually
produces the state it claims to, before it ever touches production.
