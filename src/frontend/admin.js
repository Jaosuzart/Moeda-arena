document.addEventListener("DOMContentLoaded", carregarUsuarios);

async function carregarUsuarios() {
  try {
    const res = await fetch("/api/admin/usuarios");

    if (res.status === 403 || res.status === 401) {
      alert("Você não tem permissão para acessar esta página.");
      window.location.href = "/";
      return;
    }

    const data = await res.json();
    if (data.sucesso) renderizarUsuarios(data.dados);
  } catch {
    alert("Erro ao carregar dados. Tente novamente.");
  }
}

function criarCelula(texto) {
  const td = document.createElement("td");
  td.textContent = texto ?? "";
  return td;
}

function renderizarUsuarios(usuarios) {
  const tbody = document.querySelector("#tabelaUsuarios tbody");
  tbody.replaceChildren();

  if (!usuarios.length) {
    const tr = tbody.insertRow();
    const td = tr.insertCell();
    td.colSpan = 7;
    td.textContent = "Nenhum usuário encontrado.";
    return;
  }

  for (const u of usuarios) {
    const tr = document.createElement("tr");
    tr.append(
      criarCelula(u.id),
      criarCelula(u.nome),
      criarCelula(u.email),
      criarCelula(u.saldo_moedas),
      criarCelula(u.status),
      criarCelula(u.ganhos_afiliado ?? 0),
    );

    const tdAcoes = document.createElement("td");
    const btn = document.createElement("button");
    btn.className = "btn btn-warning btn-sm fw-bold";
    btn.textContent = "+ Dar Moedas";
    btn.addEventListener("click", () => darTokens(u.id));
    
    tdAcoes.className = "text-end";
    tdAcoes.append(btn);
    tr.append(tdAcoes);

    tbody.append(tr);
  }
}

async function darTokens(usuarioId) {
  const input = prompt(`Quantos moedas deseja adicionar ao usuário ID ${usuarioId}?`);
  const quantidade = parseInt(input, 10);
  if (!input || isNaN(quantidade) || quantidade <= 0) return;

  try {
    const res = await fetch("/api/admin/usuarios/moedas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usuarioId, quantidade }),
    });

    const data = await res.json();
    if (data.sucesso) {
      alert("Moedas adicionados com sucesso!");
      carregarUsuarios();
    } else {
      alert(`Erro: ${data.erro}`);
    }
  } catch {
    alert("Erro de conexão ao adicionar moedas.");
  }
}
