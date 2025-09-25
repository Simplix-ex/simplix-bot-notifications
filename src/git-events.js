import axios from "axios";

const DISCORD_BOT_PULL_REQUESTS = process.env.DISCORD_BOT_PULL_REQUESTS;
const DISCORD_BOT_ISSUES = process.env.DISCORD_BOT_ISSUES;
const DISCORD_BOT_PUSHES = process.env.DISCORD_BOT_PUSHES;
const DISCORD_BOT_RELEASES = process.env.DISCORD_BOT_RELEASES;
const DISCORD_BOT_BRANCHES = process.env.DISCORD_BOT_BRANCHES;
const DISCORD_BOT_WORKFLOW_JOBS = process.env.DISCORD_BOT_WORKFLOW_JOBS;
const DISCORD_BOT_WORKFLOW_RUNS = process.env.DISCORD_BOT_WORKFLOW_RUNS;

export async function handleWorkflowRun(payload) {
  const { workflow_run } = payload;
  const status = workflow_run.status;
  const conclusion = workflow_run.conclusion;

  console.log(`🔄 Workflow: ${workflow_run.name}`);
  console.log(`   Status: ${status}`);
  console.log(`   Conclusão: ${conclusion}`);
  console.log(`   Repositório: ${payload.repository.full_name}`);
  console.log(`   Branch: `);

  // Personalizar notificações baseado no status
  if (status === "completed") {
    if (conclusion === "success") {
      console.log("✅ Workflow concluído com sucesso");
      // Implementar notificação de sucesso (Slack, Discord, etc.)
    } else if (conclusion === "failure") {
      console.log("❌ Workflow falhou");
      // Implementar notificação de falha
    }
  } else if (status === "in_progress") {
    console.log("⏳ Workflow iniciado");
  }

  const conclusionType = () => {
    switch (conclusion) {
      case "success":
        return "✅ Workflow concluído com sucesso";
      case "failure":
        return "❌ Workflow falhou";
      case "in_progress":
        return "⏳ Workflow em andamento";
      default:
        return "⚙️ Workflow status desconhecido";
    }
  };

  await axios
    .post(DISCORD_BOT_WORKFLOW_RUNS, {
      content: "@everyone",
      embeds: [
        {
          title: "Workflows",
          description: `Um workflow foi ${status}`,
          color: 16711680,
          fields: [
            {
              name: "Workflow",
              value: workflow_run.name,
            },
            {
              name: "Status",
              value: status,
            },
            {
              name: "Conclusion",
              value: conclusionType(),
            },
            {
              name: "Repository",
              value: payload.repository.full_name,
            },
            {
              name: "Branch",
              value: workflow_run.head_branch,
            },
          ],
          author: {
            name: payload.sender.login,
          },
        },
      ],
      attachments: [],
    })
    .then((res) => {
      console.log("GitEvents: Mensagem enviada com sucesso:", res.data);
    })
    .catch((err) => {
      console.error("GitEvents: Erro ao enviar mensagem:", err);
    });
}

export async function handleWorkflowJob(payload) {
  const { workflow_job } = payload;

  console.log(`⚙️ Job: ${workflow_job.name}`);
  console.log(`   Status: ${workflow_job.status}`);
  console.log(`   Conclusão: ${workflow_job.conclusion}`);

  if (workflow_job.status === "completed" && workflow_job.conclusion === "failure") {
    console.log("❌ Job falhou - verificar logs");
  }
}

export async function handlePullRequest(payload) {
  const { pull_request, action } = payload;

  const eventsTypes = () => {
    switch (action) {
      case "opened":
        return "🆕 Nova PR criada";
      case "closed":
        return pull_request.merged ? "✅ PR merged" : "❌ PR fechada sem merge";
      case "review_requested":
        return "👀 Review solicitado";
      default:
        return "";
    }
  };

  try {
    await axios
      .post(DISCORD_BOT_PULL_REQUESTS, {
        content: "@everyone",
        embeds: [
          {
            title: "Pull Request",
            description: `Uma pull request foi ${action}`,
            color: 5814783,
            fields: [
              {
                name: "Pull Request",
                value: `[#${pull_request.number}](${pull_request.html_url}) ${pull_request.title}`,
              },
              {
                name: "Action",
                value: eventsTypes(),
              },
              {
                name: "Author",
                value: pull_request.user.login,
              },
              {
                name: "base",
                value: `${pull_request.base.ref} ← Head: ${pull_request.head.ref}`,
              },
            ],
            author: {
              name: pull_request.user.login,
            },
          },
        ],
        attachments: [],
      })
      .then((res) => {
        console.log("GitEvents: Mensagem enviada com sucesso:", res.data);
      })
      .catch((err) => {
        console.error("GitEvents: Erro ao enviar mensagem:", err);
      });
  } catch (e) {
    console.error("GitEvents: Erro inesperado:", e);
  }
}

export async function handlePush(payload) {
  const { ref, commits, repository } = payload;
  const branch = ref.replace("refs/heads/", "");

  console.log(`📤 Push para ${repository.full_name}`);
  console.log(`   Branch: ${branch}`);
  console.log(`   Commits: ${commits.length}`);
  console.log(`   Autor: ${payload.pusher.name}`);

  commits.forEach((commit, index) => {
    console.log(`   ${index + 1}. ${commit.message.split("\n")[0]} (${commit.id.substring(0, 7)})`);
  });
}

export async function handleBranchEvent(payload, event) {
  const { ref, ref_type, repository } = payload;

  if (ref_type === "branch") {
    console.log(`🌿 Branch ${event === "create" ? "criada" : "deletada"}: ${ref}`);
    console.log(`   Repositório: ${repository.full_name}`);
    console.log(`   Autor: ${payload.sender.login}`);
  }
}

export async function handleIssues(payload) {
  const { issue, action } = payload;

  console.log(`🎯 Issue #${issue.number}: ${issue.title}`);
  console.log(`   Ação: ${action}`);
  console.log(`   Autor: ${issue.user.login}`);
}

export async function handleRelease(payload) {
  const { release, action } = payload;

  console.log(`🚀 Release ${action}: ${release.tag_name}`);
  console.log(`   Nome: ${release.name}`);
  console.log(`   Prerelease: ${release.prerelease}`);
}
