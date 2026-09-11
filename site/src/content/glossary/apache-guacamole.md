---
title: Apache Guacamole
summary: A clientless remote desktop gateway — RDP, VNC, and SSH access through nothing but a browser.
link: https://guacamole.apache.org/
aliases:
  - Guacamole
---

Guacamole is an HTML5 gateway for remote desktop and shell protocols — RDP,
VNC, SSH — that needs no client software on the connecting end at all. Point
a browser at it and it renders the remote session directly, which makes it a
convenient front door for jump hosts and bastion access without asking
anyone to install anything.

It's one of the pieces of the identity/endpoint stack listed on this page,
alongside Authentik SSO and private PKI, for reaching internal systems
without exposing RDP/VNC/SSH directly to the internet.
