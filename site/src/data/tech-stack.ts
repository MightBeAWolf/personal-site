/**
 * The "Tech stack" section on /tech-stack: Category -> Sub-group -> Leaf
 * item. Category is column 2's row content (parallel to Tools/Workflows);
 * Group and Leaf render as a nested accordion in column 3 (see
 * tech-stack.astro).
 *
 * A leaf's `glossaryId`, when set, must match a real entry id under
 * site/src/content/glossary/ - tech-stack.astro looks it up and reuses that
 * page's summary + link as part of the leaf's expanded content rather than
 * duplicating it here. A leaf can also have its own narrative sub-articles
 * (site/src/content/articles/stack/<category>/<group>/<leaf>/*.md, matched
 * by path in tech-stack.astro) nested one tier deeper for "why this over
 * that" content the glossary summary doesn't cover. A leaf with neither
 * renders as a plain, non-expandable label - no faking an accordion over
 * content that doesn't exist yet.
 *
 * Groupings and category descriptions are a first draft, reorganizing the
 * words already on this page rather than new copy - names, placement, and
 * wording are expected to move.
 */

export interface StackLeaf {
  label: string;
  glossaryId?: string;
}

export interface StackGroup {
  label: string;
  items: StackLeaf[];
}

export interface StackCategory {
  label: string;
  description: string;
  groups: StackGroup[];
}

export const stackCategories: StackCategory[] = [
  {
    label: "AI infrastructure",
    description: "Agents, retrieval, and the tooling that wires them into real workflows.",
    groups: [
      {
        label: "AI agents",
        items: [
          { label: "Claude Code", glossaryId: "claude-code" },
          { label: "OpenCode" },
          { label: "Hermes Agent" },
        ],
      },
      {
        label: "Retrieval & tooling",
        items: [
          { label: "RAG pipelines", glossaryId: "rag" },
          { label: "MCP tool integration", glossaryId: "mcp" },
        ],
      },
      {
        label: "Execution & runtime",
        items: [
          { label: "Agent sandboxing" },
          { label: "Containerized job orchestration" },
          { label: "Open WebUI" },
        ],
      },
    ],
  },
  {
    label: "Application & solution architecture",
    description: "How systems get designed and decomposed before anything is built.",
    groups: [
      {
        label: "Design & standards",
        items: [
          { label: "API design" },
          { label: "Design review and architecture standards" },
          { label: "System design for scale" },
        ],
      },
      {
        label: "Modernization",
        items: [
          { label: "Service decomposition" },
          { label: "Monolith-to-modular modernization" },
          { label: "Integration patterns" },
        ],
      },
      {
        label: "Application patterns",
        items: [{ label: "Workflow-oriented applications" }],
      },
    ],
  },
  {
    label: "Languages",
    description: "What I actually write code in, day to day.",
    groups: [
      {
        label: "Scripting & systems",
        items: [
          { label: "Python" },
          { label: "Bash" },
          { label: "C" },
          { label: "C++" },
          { label: "Rust" },
        ],
      },
      {
        label: "Application & enterprise",
        items: [{ label: "TypeScript" }, { label: "C#" }, { label: "Java" }],
      },
      {
        label: "Other",
        items: [{ label: "Lisp" }, { label: "TCL" }],
      },
    ],
  },
  {
    label: "Cloud & platform",
    description: "Where workloads run, from public cloud to a self-hosted Kubernetes cluster.",
    groups: [
      {
        label: "Public cloud",
        items: [
          { label: "AWS" },
          { label: "Azure" },
          { label: "Hetzner Cloud" },
          { label: "Cloudflare" },
        ],
      },
      {
        label: "Virtualization & bare metal",
        items: [{ label: "Proxmox" }, { label: "QEMU" }, { label: "systemd" }],
      },
      {
        label: "Kubernetes ecosystem",
        items: [
          { label: "Kubernetes", glossaryId: "kubernetes" },
          { label: "K3s", glossaryId: "k3s" },
          { label: "Helm" },
          { label: "Docker" },
          { label: "Podman", glossaryId: "podman" },
          { label: "Traefik" },
        ],
      },
      {
        label: "Network & access",
        items: [
          { label: "Bind9" },
          { label: "Apache Guacamole", glossaryId: "apache-guacamole" },
        ],
      },
    ],
  },
  {
    label: "Automation & IaC",
    description: "Configuration, provisioning, and delivery, all declared in a repo.",
    groups: [
      {
        label: "Configuration & testing",
        items: [
          { label: "Ansible", glossaryId: "ansible" },
          { label: "Ansible Molecule" },
        ],
      },
      {
        label: "Provisioning",
        items: [
          { label: "Terraform / OpenTofu" },
          { label: "Packer" },
          { label: "cloud-init" },
        ],
      },
      {
        label: "Delivery & tasks",
        items: [
          { label: "mise", glossaryId: "mise" },
          { label: "Argo CD", glossaryId: "argo-cd" },
          { label: "Gitea Actions" },
        ],
      },
      {
        label: "QA",
        items: [{ label: "Playwright", glossaryId: "playwright" }],
      },
    ],
  },
  {
    label: "Observability",
    description: "Metrics, logs, dashboards, and alerting, wired in from day one.",
    groups: [
      {
        label: "Metrics",
        items: [
          { label: "Prometheus" },
          { label: "Grafana Alloy" },
          { label: "InfluxDB" },
        ],
      },
      {
        label: "Logs",
        items: [{ label: "Loki" }, { label: "Graylog" }],
      },
      {
        label: "Dashboards & alerting",
        items: [{ label: "Grafana" }, { label: "Gatus" }, { label: "ntfy" }],
      },
    ],
  },
  {
    label: "Identity, endpoint & PKI",
    description: "Directory, SSO, and certificates for every identity in the environment.",
    groups: [
      {
        label: "Directory & endpoint",
        items: [
          { label: "Active Directory" },
          { label: "Microsoft Intune" },
          { label: "OpenLDAP" },
          { label: "SSSD" },
        ],
      },
      {
        label: "SSO & secrets",
        items: [
          { label: "Authentik SSO with enforced MFA and forward-auth" },
          { label: "1Password", glossaryId: "1password" },
        ],
      },
      {
        label: "PKI & certificates",
        items: [
          { label: "step-ca private CA" },
          { label: "cert-manager" },
          { label: "Certbot / Let's Encrypt" },
        ],
      },
    ],
  },
  {
    label: "Data & storage",
    description: "Where state lives and how it's queried.",
    groups: [
      {
        label: "Databases",
        items: [
          { label: "PostgreSQL" },
          { label: "CloudNativePG" },
          { label: "Redis" },
        ],
      },
      {
        label: "Storage & forge",
        items: [{ label: "SeaweedFS" }, { label: "Gitea" }],
      },
      {
        label: "Workflow/data tooling",
        items: [{ label: "n8n" }],
      },
    ],
  },
  {
    label: "Security & compliance",
    description: "Frameworks and hardening that shape the architecture, not bolt onto it.",
    groups: [
      {
        label: "Compliance frameworks",
        items: [{ label: "NIST 800-171" }, { label: "CMMC 2.0 (Levels 2–3)" }],
      },
      {
        label: "Hardening",
        items: [
          {
            label:
              "Kubernetes hardening (Pod Security Admission, audit policy, etcd encryption at rest)",
          },
        ],
      },
      {
        label: "Network defense",
        items: [
          { label: "fail2ban" },
          { label: "firewalld / UFW" },
          { label: "WireGuard" },
        ],
      },
    ],
  },
  {
    label: "Delivery & collaboration",
    description: "How work gets tracked and communicated.",
    groups: [
      {
        label: "Issue tracking & docs",
        items: [{ label: "Jira" }, { label: "Confluence" }],
      },
      {
        label: "Comms",
        items: [{ label: "Slack" }, { label: "Teams" }],
      },
    ],
  },
];
