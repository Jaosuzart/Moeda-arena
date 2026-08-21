document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Acesso negado. Faça login primeiro.");
    window.location.href = "/";
    return;
  }

  try {
    const res = await fetch("/api/admin/usuarios", {
      headers: { Authorization: "Bearer " + token },
    });

    if (!res.ok) {
      alert("Você não tem permissão para acessar esta página.");
      window.location.href = "/";
      return;
    }

    const data = await res.json();
    if (data.sucesso) {
      renderizarUsuarios(data.dados);
    }
  } catch (err) {
    console.error(err);
  }
});

function renderizarUsuarios(usuarios) {
  const tbody = document.querySelector("#tabelaUsuarios tbody");
  tbody.innerHTML = "";

  if (usuarios.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7">Nenhum usuário encontrado.</td></tr>';
    return;
  }

  usuarios.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.nome}</td>
      <td>${u.email}</td>
      <td>${u.tokens}</td>
      <td>${u.plano_ativo ? u.plano_ativo : "Nenhum"}</td>
      <td>${u.ganhos_afiliado || 0}</td>
      <td>
        <button class="action-btn" onclick="darTokens(${u.id})">Dar Tokens</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function darTokens(userId) {
  const qtd = prompt(
    "Quantos tokens deseja adicionar para o usuário ID " + userId + "?",
  );
  if (!qtd || isNaN(qtd)) return;

  const token = localStorage.getItem("token");
  const res = await fetch("/api/admin/usuarios/tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ usuarioId: userId, quantidade: parseInt(qtd) }),
  });

  const data = await res.json();
  if (data.sucesso) {
    alert("Tokens adicionados com sucesso!");
    window.location.reload();
  } else {
    alert("Erro: " + data.erro);
  }
}
