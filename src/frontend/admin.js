document.addEventListener("DOMContentLoaded", carregarUsuarios);

async function carregarUsuarios() {
  try {
    const res = await fetch("/api/admin/usuarios");

    if (res.status === 403 || res.status === 401) {
      await Swal.fire("Acesso Negado", "Você não tem permissão para acessar esta página.", "error");
      window.location.href = "/";
      return;
    }

    const data = await res.json();
    if (data.sucesso) renderizarUsuarios(data.dados);
  } catch {
    Swal.fire("Erro", "Erro ao carregar dados. Tente novamente.", "error");
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
  const { value: input } = await Swal.fire({
    title: 'Adicionar Moedas',
    text: `Quantas moedas deseja adicionar ao usuário ID ${usuarioId}?`,
    input: 'number',
    showCancelButton: true,
    confirmButtonText: 'Adicionar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value || parseInt(value, 10) <= 0) {
        return 'Insira uma quantidade válida!'
      }
    }
  });

  if (!input) return;
  const quantidade = parseInt(input, 10);

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
      await Swal.fire("Sucesso!", "Moedas adicionadas com sucesso!", "success");
      carregarUsuarios();
    } else {
      Swal.fire("Erro", data.erro || "Falha ao adicionar moedas", "error");
    }
  } catch {
    Swal.fire("Erro", "Erro de conexão ao adicionar moedas.", "error");
  }
}
