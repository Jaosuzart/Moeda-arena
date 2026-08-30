document.addEventListener("DOMContentLoaded", () => {
  const DOM = {
    navAuthBtns: document.getElementById("navAuthBtns"),
    navUserInfo: document.getElementById("navUserInfo"),
    navMoedaCount: document.getElementById("navMoedaCount"),
    navAvatar: document.getElementById("navAvatar"),
    btnAbrirLogin: document.getElementById("btnAbrirLogin"),
    btnAbrirRegistro: document.getElementById("btnAbrirRegistro"),
    cardsContainer: document.getElementById("cardsContainer"),
    loadingState: document.getElementById("loadingState"),
    pricingToggle: document.getElementById("pricingToggle"),
    labelMensal: document.getElementById("labelMensal"),
    labelAnual: document.getElementById("labelAnual"),
    authModal: document.getElementById("authModal"),
    tabLogin: document.getElementById("tabLogin"),
    tabRegistro: document.getElementById("tabRegistro"),
    formLogin: document.getElementById("formLogin"),
    formRegistro: document.getElementById("formRegistro"),
    loginForm: document.getElementById("loginForm"),
    registroForm: document.getElementById("registroForm"),
    registroTelefone: document.getElementById("registroTelefone"),
    loginFeedback: document.getElementById("loginFeedback"),
    registroFeedback: document.getElementById("registroFeedback"),
    btnLogin: document.getElementById("btnLogin"),
    btnRegistro: document.getElementById("btnRegistro"),
    btnFecharAuth: document.getElementById("btnFecharAuth"),
    btnFecharAuth2: document.getElementById("btnFecharAuth2"),
    btnGoogleLogin: document.getElementById("btnGoogleLogin"),
    btnGoogleRegistro: document.getElementById("btnGoogleRegistro"),
    checkoutModal: document.getElementById("checkoutModal"),
    checkoutPlanoNome: document.getElementById("checkoutPlanoNome"),
    areaPagamento: document.getElementById("areaPagamento"),
    metodoPagamento: document.getElementById("metodoPagamento"),
    checkoutFeedback: document.getElementById("checkoutFeedback"),
    btnConfirmarCompra: document.getElementById("btnConfirmarCompra"),
    btnFecharCheckout: document.getElementById("btnFecharCheckout"),
    btnCancelarCheckout: document.getElementById("btnCancelarCheckout"),
    inputCupom: document.getElementById("inputCupom"),
    btnAplicarCupom: document.getElementById("btnAplicarCupom"),
    cupomFeedback: document.getElementById("cupomFeedback"),
    areaCupom: document.getElementById("areaCupom"),
    checkoutPrecoOriginal: document.getElementById("checkoutPrecoOriginal"),
    checkoutPrecoFinal: document.getElementById("checkoutPrecoFinal"),
    checkoutPrecoArea: document.getElementById("checkoutPrecoArea"),
    perfilModal: document.getElementById("perfilModal"),
    btnFecharPerfil: document.getElementById("btnFecharPerfil"),
    btnSairConta: document.getElementById("btnSairConta"),
    tabDados: document.getElementById("tabDados"),
    tabCartao: document.getElementById("tabCartao"),
    areaDados: document.getElementById("areaDados"),
    areaCartao: document.getElementById("areaCartao"),
    perfilForm: document.getElementById("perfilForm"),
    perfilNome: document.getElementById("perfilNome"),
    perfilCpf: document.getElementById("perfilCpf"),
    perfilLocalidade: document.getElementById("perfilLocalidade"),
    perfilTelefone: document.getElementById("perfilTelefone"),
    perfilPix: document.getElementById("perfilPix"),
    perfilCartao: document.getElementById("perfilCartao"),
    perfilFeedback: document.getElementById("perfilFeedback"),
    btnSalvarPerfil: document.getElementById("btnSalvarPerfil"),
    tabSeguranca: document.getElementById("tabSeguranca"),
    areaSeguranca: document.getElementById("areaSeguranca"),
    btnToggle2fa: document.getElementById("btnToggle2fa"),
    badge2fa: document.getElementById("badge2fa"),
    feedback2fa: document.getElementById("feedback2fa"),
    verify2faModal: document.getElementById("verify2faModal"),
    verify2faForm: document.getElementById("verify2faForm"),
    verify2faUserId: document.getElementById("verify2faUserId"),
    verify2faCode: document.getElementById("verify2faCode"),
    verify2faFeedback: document.getElementById("verify2faFeedback"),
    btnConfirmar2fa: document.getElementById("btnConfirmar2fa"),
    btnFecharVerify2fa: document.getElementById("btnFecharVerify2fa"),
    btnRanking: document.getElementById("btnRanking"),
    btnRankingLogged: document.getElementById("btnRankingLogged"),
    rankingModal: document.getElementById("rankingModal"),
    btnFecharRanking: document.getElementById("btnFecharRanking"),
    rankingTableBody: document.getElementById("rankingTableBody"),
    adminModal: document.getElementById("adminModal"),
    btnFecharAdmin: document.getElementById("btnFecharAdmin"),
    adminTableBody: document.getElementById("adminTableBody"),
    adminMoedasForm: document.getElementById("adminMoedasForm"),
    adminUserId: document.getElementById("adminUserId"),
    adminMoedaAmount: document.getElementById("adminMoedaAmount"),
    adminFeedback: document.getElementById("adminFeedback"),
    btnAbrirTermos: document.getElementById("btnAbrirTermos"),
    btnFecharTermos: document.getElementById("btnFecharTermos"),
    btnOkTermos: document.getElementById("btnOkTermos"),
    termosModal: document.getElementById("termosModal"),
    sudoModal: document.getElementById("sudoModal"),
    btnFecharSudo: document.getElementById("btnFecharSudo"),
    sudoForm: document.getElementById("sudoForm"),
    sudoSenha: document.getElementById("sudoSenha"),
    sudoFeedback: document.getElementById("sudoFeedback"),
    createPasswordModal: document.getElementById("createPasswordModal"),
    btnFecharCreatePassword: document.getElementById("btnFecharCreatePassword"),
    createPasswordForm: document.getElementById("createPasswordForm"),
    newSecurityPassword: document.getElementById("newSecurityPassword"),
    createPasswordFeedback: document.getElementById("createPasswordFeedback"),
    btnEsqueciSenha: document.getElementById("btnEsqueciSenha"),
    btnEsqueciSenhaSudo: document.getElementById("btnEsqueciSenhaSudo"),
    forgotPasswordModal: document.getElementById("forgotPasswordModal"),
    forgotForm: document.getElementById("forgotForm"),
    forgotEmail: document.getElementById("forgotEmail"),
    forgotFeedback: document.getElementById("forgotFeedback"),
    btnEnviarForgot: document.getElementById("btnEnviarForgot"),
    btnFecharForgot: document.getElementById("btnFecharForgot"),
    btnVoltarLogin: document.getElementById("btnVoltarLogin"),
    resetPasswordModal: document.getElementById("resetPasswordModal"),
    resetForm: document.getElementById("resetForm"),
    resetNovaSenha: document.getElementById("resetNovaSenha"),
    resetConfirmarSenha: document.getElementById("resetConfirmarSenha"),
    resetFeedback: document.getElementById("resetFeedback"),
    btnConfirmarReset: document.getElementById("btnConfirmarReset"),
    contatoModal: document.getElementById("contatoModal"),
    btnAbrirContato: document.getElementById("btnAbrirContato"),
    btnFecharContato: document.getElementById("btnFecharContato"),
    contatoForm: document.getElementById("contatoForm"),
    contatoNome: document.getElementById("contatoNome"),
    contatoEmail: document.getElementById("contatoEmail"),
    contatoMensagem: document.getElementById("contatoMensagem"),
    contatoFeedback: document.getElementById("contatoFeedback"),
    btnEnviarContato: document.getElementById("btnEnviarContato"),
    btnFecharReset: document.getElementById("btnFecharReset"),
    statsTotalUsuarios: document.getElementById("statsTotalUsuarios"),
    statsTotalMoedas: document.getElementById("statsTotalMoedas"),
    recentSalesList: document.getElementById("recentSalesList"),
    linkWhatsapp: document.getElementById("linkWhatsapp"),
  };
  let estado = {
    planos: [],
    usuario: null,
    planoSelecionado: null,
    cupomAplicado: null,
    descontoPercentual: 0,
    googleLoginPendente: false,
    resetToken: null,
  };
  const TIER_CONFIG = {
    gratis: { src: "/assets/images/icon-shield.png", alt: "Grátis", desc: "Comece sua jornada com o pacote inicial." },
    iniciante: {
      src: "/assets/images/icon-coin.png",
      alt: "Iniciante",
      desc: "Ideal para quem quer começar com pouca moeda.",
    },
    premium: { src: "/assets/images/icon-sword.jpg", alt: "Premium", desc: "O favorito dos jogadores competitivos." },
    vip: { src: "/assets/images/icon-crown.png", alt: "VIP", desc: "Para quem quer dominar sem limites." },
  };

  const btnThemeToggle = document.getElementById("btnThemeToggle");
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("light-theme");
      const isLight = document.documentElement.classList.contains("light-theme");
      localStorage.setItem("theme", isLight ? "light" : "dark");
    });
  }

  const applyMask = (input, maskType) => {
    if (!input) return;
    input.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "");
      if (maskType === "cpf") {
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      } else if (maskType === "tel") {
        v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
        v = v.replace(/(\d)(\d{4})$/, "$1-$2");
      }
      e.target.value = v;
    });
  };

  applyMask(DOM.perfilCpf, "cpf");
  applyMask(DOM.perfilTelefone, "tel");
  applyMask(DOM.registroTelefone, "tel");

  async function fetchAutenticado(url, opcoes = {}) {
    const headers = { "Content-Type": "application/json", ...opcoes.headers };
    return fetch(url, { ...opcoes, headers });
  }
  // Formata valor numerico para o padrao monetario brasileiro (R$ 1.234,56)
  const _brlFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formatBRL = (value) => _brlFormatter.format(value);

  function mostrarFeedback(el, mensagem, isSucesso) {
    el.textContent = mensagem;
    el.className = `alert-feedback visible ${isSucesso ? "success" : "error"}`;
  }
  function esconderFeedback(el) {
    el.className = "alert-feedback";
    el.textContent = "";
  }
  function abrirModal(modal) {
    modal.classList.add("visible");
  }
  function fecharModal(modal) {
    modal.classList.remove("visible");
  }
  function setCarregando(btn, isLoading, texto) {
    btn.disabled = isLoading;
    btn.textContent = texto;
  }
  async function carregar2faStatus() {
    if (!DOM.badge2fa || !DOM.btnToggle2fa) return;
    try {
      const resp = await fetch("/api/auth/2fa/status");
      const data = await resp.json();
      const ativo = data.dados && data.dados.ativo2fa;
      DOM.badge2fa.textContent = ativo ? "Ativada ✓" : "Desativada";
      DOM.badge2fa.className = `badge-status ${ativo ? "ativo" : "inativo"}`;
      DOM.btnToggle2fa.textContent = ativo ? "Desativar Autenticação 2FA" : "Ativar Autenticação 2FA";
      DOM.btnToggle2fa.className = `btn-gamer ${ativo ? "btn-gamer-secondary" : "btn-gamer-primary"} w-full`;
    } catch (e) {
      DOM.badge2fa.textContent = "Erro ao verificar";
    }
  }
  if (DOM.btnToggle2fa) {
    DOM.btnToggle2fa.addEventListener("click", async () => {
      const btn = DOM.btnToggle2fa;
      const ativando = btn.textContent.toLowerCase().includes("ativar");
      setCarregando(btn, true, ativando ? "Ativando..." : "Desativando...");
      if (DOM.feedback2fa) esconderFeedback(DOM.feedback2fa);
      try {
        const resp = await fetch("/api/auth/2fa/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ativar: ativando }),
        });
        const data = await resp.json();
        if (resp.ok && data.sucesso) {
          mostrarFeedback(
            DOM.feedback2fa,
            data.dados.mensagem || (ativando ? "2FA ativado com sucesso!" : "2FA desativado."),
            true,
          );
          await carregar2faStatus();
        } else {
          mostrarFeedback(DOM.feedback2fa, data.erro || "Erro ao alterar 2FA.", false);
          setCarregando(btn, false, ativando ? "Ativar Autenticação 2FA" : "Desativar Autenticação 2FA");
        }
      } catch (e) {
        mostrarFeedback(DOM.feedback2fa, "Erro de conexão com o servidor.", false);
        setCarregando(btn, false, ativando ? "Ativar Autenticação 2FA" : "Desativar Autenticação 2FA");
      }
    });
  }
  function atualizarNavbar() {
    if (estado.usuario) {
      DOM.navAuthBtns.style.display = "none";
      DOM.navUserInfo.style.display = "flex";
      DOM.navMoedaCount.textContent = (estado.usuario.saldo_moedas || 0).toLocaleString("pt-BR");
      DOM.navAvatar.textContent = estado.usuario.nome.charAt(0).toUpperCase();
      DOM.navAvatar.title = `${estado.usuario.nome} — Clique para sair`;
      const is_admin = !!estado.usuario.isAdmin;
      const firstName = estado.usuario.nome.split(" ")[0];
      const elName = document.getElementById("navUserName");
      const elRole = document.getElementById("navUserRole");
      if (elName) elName.textContent = firstName;
      if (elRole) {
        elRole.className = "nav-role-badge";
        elRole.style.cursor = "default";
        elRole.onclick = null;
        elRole.title = "";
        if (estado.usuario.email_verificado === 0) {
          elRole.textContent = "⚠️ Email Pendente";
          elRole.classList.add("pendente");
          elRole.style.cursor = "pointer";
          elRole.title = "Seu email não está verificado. Clique para saber mais.";
          elRole.onclick = () =>
            Swal.fire({
              icon: "warning",
              title: "Seu email está pendente!",
              text: "Verifique sua caixa de entrada ou pasta de SPAM para confirmar seu email. Isso garantirá acesso total à sua conta e segurança das suas moedas.",
              showCancelButton: true,
              confirmButtonText: "Entendi",
              cancelButtonText: "Fechar",
              confirmButtonColor: "#3085d6",
            });
          if (DOM.btnAdminPanel) DOM.btnAdminPanel.style.display = "none";
        } else if (is_admin) {
          elRole.textContent = "Administrador";
          elRole.classList.add("admin");
          if (DOM.btnAdminPanel) DOM.btnAdminPanel.style.display = "inline-block";
        } else {
          elRole.textContent = "Jogador";
          elRole.classList.add("jogador");
          if (DOM.btnAdminPanel) DOM.btnAdminPanel.style.display = "none";
        }
      }
    } else {
      DOM.navAuthBtns.style.display = "flex";
      DOM.navUserInfo.style.display = "none";
    }
  }
  async function restaurarSessao() {
    try {
      const res = await fetchAutenticado("/api/auth/status");
      const data = await res.json();
      if (data.sucesso && data.dados && data.dados.usuario) {
        estado.usuario = data.dados.usuario;
      } else {
        estado.usuario = null;
      }
    } catch (err) {
      estado.usuario = null;
    }
    atualizarNavbar();
  }
  async function logout() {
    try {
      await fetchAutenticado("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    estado.usuario = null;
    atualizarNavbar();
  }
  function alternarTab(tab) {
    if (tab === "login") {
      DOM.tabLogin.classList.add("active");
      DOM.tabRegistro.classList.remove("active");
      DOM.formLogin.classList.add("visible");
      DOM.formRegistro.classList.remove("visible");
    } else {
      DOM.tabLogin.classList.remove("active");
      DOM.tabRegistro.classList.add("active");
      DOM.formLogin.classList.remove("visible");
      DOM.formRegistro.classList.add("visible");
    }
    esconderFeedback(DOM.loginFeedback);
    esconderFeedback(DOM.registroFeedback);
  }
  DOM.tabLogin.addEventListener("click", () => alternarTab("login"));
  DOM.tabRegistro.addEventListener("click", () => alternarTab("registro"));
  let googleScriptCarregado = false;
  function carregarScriptGoogle() {
    if (googleScriptCarregado) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initGoogleAuth();
    };
    document.head.appendChild(script);
    googleScriptCarregado = true;
  }
  DOM.btnAbrirLogin.addEventListener("click", () => {
    carregarScriptGoogle();
    alternarTab("login");
    abrirModal(DOM.authModal);
  });
  DOM.btnAbrirRegistro.addEventListener("click", () => {
    carregarScriptGoogle();
    alternarTab("registro");
    abrirModal(DOM.authModal);
  });
  const handleGoogleClick = () => {
    if (window.google && window.google.accounts) {
      google.accounts.id.prompt();
    } else {
      estado.googleLoginPendente = true;
      if (DOM.btnGoogleLogin) {
        DOM.btnGoogleLogin.disabled = true;
        DOM.btnGoogleLogin.textContent = "Carregando Google...";
      }
      if (DOM.btnGoogleRegistro) {
        DOM.btnGoogleRegistro.disabled = true;
        DOM.btnGoogleRegistro.textContent = "Carregando Google...";
      }
      carregarScriptGoogle();
    }
  };
  if (DOM.btnGoogleLogin) DOM.btnGoogleLogin.addEventListener("click", handleGoogleClick);
  if (DOM.btnGoogleRegistro) DOM.btnGoogleRegistro.addEventListener("click", handleGoogleClick);
  DOM.btnFecharAuth.addEventListener("click", () => fecharModal(DOM.authModal));
  DOM.btnFecharAuth2.addEventListener("click", () => fecharModal(DOM.authModal));
  DOM.authModal.addEventListener("click", (e) => {
    if (e.target === DOM.authModal) fecharModal(DOM.authModal);
  });
  if (DOM.btnAbrirTermos) {
    DOM.btnAbrirTermos.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModal(DOM.termosModal);
    });
  }
  DOM.btnFecharTermos.addEventListener("click", () => fecharModal(DOM.termosModal));
  if (DOM.btnOkTermos) {
    DOM.btnOkTermos.addEventListener("click", () => {
      fecharModal(DOM.termosModal);
    });
  }

  if (DOM.btnAbrirContato) {
    DOM.btnAbrirContato.addEventListener("click", (e) => {
      e.preventDefault();
      DOM.contatoFeedback.textContent = "";
      DOM.contatoFeedback.className = "form-feedback";
      DOM.contatoForm.reset();
      DOM.contatoModal.showModal();
    });
  }
  if (DOM.btnFecharContato) {
    DOM.btnFecharContato.addEventListener("click", () => {
      DOM.contatoModal.close();
    });
  }
  if (DOM.contatoForm) {
    DOM.contatoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      mostrarLoading(DOM.btnEnviarContato);
      try {
        const payload = {
          nome: DOM.contatoNome.value.trim(),
          email: DOM.contatoEmail.value.trim(),
          mensagem: DOM.contatoMensagem.value.trim(),
        };
        const response = await fetch("/api/contato", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        removerLoading(DOM.btnEnviarContato, "Enviar Mensagem");
        if (response.ok) {
          mostrarErro(DOM.contatoFeedback, "Mensagem enviada com sucesso!", "success");
          setTimeout(() => {
            DOM.contatoModal.close();
          }, 2000);
        } else {
          mostrarErro(DOM.contatoFeedback, data.erro || "Erro ao enviar mensagem.");
        }
      } catch (err) {
        removerLoading(DOM.btnEnviarContato, "Enviar Mensagem");
        mostrarErro(DOM.contatoFeedback, "Erro de rede. Tente novamente.");
      }
    });
  }

  DOM.termosModal.addEventListener("click", (e) => {
    if (e.target === DOM.termosModal) fecharModal(DOM.termosModal);
  });
  DOM.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    esconderFeedback(DOM.loginFeedback);
    DOM.btnLogin.disabled = true;
    DOM.btnLogin.textContent = "Entrando...";
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: document.getElementById("loginEmail").value,
          senha: document.getElementById("loginSenha").value,
        }),
      });
      const data = await res.json();
      if (data.sucesso && data.dados) {
        estado.usuario = data.dados.usuario;
        atualizarNavbar();
        fecharModal(DOM.authModal);
        DOM.loginForm.reset();
      } else if (data.codigo === "REQUIRE_2FA") {
        fecharModal(DOM.authModal);
        DOM.verify2faUserId.value = data.usuarioId;
        DOM.verify2faCode.value = "";
        esconderFeedback(DOM.verify2faFeedback);
        abrirModal(DOM.verify2faModal);
        DOM.verify2faCode.focus();
      } else {
        mostrarFeedback(DOM.loginFeedback, data.erro || "Erro ao fazer login.", false);
      }
    } catch (err) {
      mostrarFeedback(DOM.loginFeedback, "Erro de conexão com o servidor.", false);
    }
    DOM.btnLogin.disabled = false;
    DOM.btnLogin.textContent = "Entrar na Arena";
  });

  if (DOM.btnFecharVerify2fa) {
    DOM.btnFecharVerify2fa.addEventListener("click", () => fecharModal(DOM.verify2faModal));
  }

  if (DOM.verify2faForm) {
    DOM.verify2faForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      esconderFeedback(DOM.verify2faFeedback);
      setCarregando(DOM.btnConfirmar2fa, true, "Verificando...");

      try {
        const res = await fetch("/api/auth/login/2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId: DOM.verify2faUserId.value,
            codigo: DOM.verify2faCode.value,
          }),
        });
        const data = await res.json();

        if (data.sucesso && data.dados) {
          estado.usuario = data.dados.usuario;
          atualizarNavbar();
          fecharModal(DOM.verify2faModal);
          DOM.verify2faForm.reset();
          DOM.loginForm.reset();
        } else {
          mostrarFeedback(DOM.verify2faFeedback, data.erro || "Código inválido.", false);
        }
      } catch (err) {
        mostrarFeedback(DOM.verify2faFeedback, "Erro de conexão com o servidor.", false);
      }
      setCarregando(DOM.btnConfirmar2fa, false, "Verificar Código");
    });
  }

  DOM.registroForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    esconderFeedback(DOM.registroFeedback);
    DOM.btnRegistro.disabled = true;
    DOM.btnRegistro.textContent = "Criando...";
    try {
      const res = await fetch("/api/auth/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: document.getElementById("registroNome").value,
          email: document.getElementById("registroEmail").value,
          senha: document.getElementById("registroSenha").value,
        }),
      });
      const data = await res.json();
      if (data.sucesso && data.dados) {
        mostrarFeedback(DOM.registroFeedback, "Conta criada! Verifique seu e-mail para confirmar a conta.", true);
        estado.usuario = data.dados.usuario;
        atualizarNavbar();
        DOM.registroForm.reset();
        setTimeout(() => fecharModal(DOM.authModal), 3000);
      } else {
        mostrarFeedback(DOM.registroFeedback, data.erro || "Erro ao criar conta.", false);
      }
    } catch (err) {
      mostrarFeedback(DOM.registroFeedback, "Erro de conexão com o servidor.", false);
    }
    DOM.btnRegistro.disabled = false;
    DOM.btnRegistro.textContent = "Criar Conta";
  });
  async function handleGoogleCallback(response) {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });
      const data = await res.json();
      if (data.sucesso && data.dados) {
        estado.usuario = data.dados.usuario;
        atualizarNavbar();
        fecharModal(DOM.authModal);
      } else {
        const feedbackEl = DOM.tabLogin.classList.contains("active") ? DOM.loginFeedback : DOM.registroFeedback;
        mostrarFeedback(feedbackEl, data.erro || "Erro no login com Google.", false);
      }
    } catch (err) {
      const feedbackEl = DOM.tabLogin.classList.contains("active") ? DOM.loginFeedback : DOM.registroFeedback;
      mostrarFeedback(feedbackEl, "Erro de conexão com o servidor.", false);
    }
  }
  async function initGoogleAuth() {
    try {
      const resp = await fetch("/api/auth/config");
      const data = await resp.json();
      if (data.whatsappUrl && DOM.linkWhatsapp) DOM.linkWhatsapp.href = data.whatsappUrl;
      if (data.clientId && window.google) {
        google.accounts.id.initialize({
          client_id: data.clientId,
          callback: handleGoogleCallback,
          use_fedcm_for_prompt: false,
        });
        if (DOM.btnGoogleLogin) {
          DOM.btnGoogleLogin.disabled = false;

          DOM.btnGoogleLogin.replaceChildren();
          const svgNS = "http://www.w3.org/2000/svg";
          const svg = document.createElementNS(svgNS, "svg");
          svg.setAttribute("class", "btn-google-icon");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("width", "20");
          svg.setAttribute("height", "20");
          const paths = [
            {
              d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z",
              fill: "#4285F4",
            },
            {
              d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",
              fill: "#34A853",
            },
            {
              d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z",
              fill: "#FBBC05",
            },
            {
              d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",
              fill: "#EA4335",
            },
          ];
          paths.forEach((p) => {
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", p.d);
            path.setAttribute("fill", p.fill);
            svg.appendChild(path);
          });
          const span = document.createElement("span");
          span.textContent = " Entrar com Google";
          DOM.btnGoogleLogin.appendChild(svg);
          DOM.btnGoogleLogin.appendChild(span);
        }
        if (DOM.btnGoogleRegistro) {
          DOM.btnGoogleRegistro.disabled = false;

          DOM.btnGoogleRegistro.replaceChildren();
          const svgNS = "http://www.w3.org/2000/svg";
          const svg = document.createElementNS(svgNS, "svg");
          svg.setAttribute("class", "btn-google-icon");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("width", "20");
          svg.setAttribute("height", "20");
          const paths = [
            {
              d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z",
              fill: "#4285F4",
            },
            {
              d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",
              fill: "#34A853",
            },
            {
              d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z",
              fill: "#FBBC05",
            },
            {
              d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",
              fill: "#EA4335",
            },
          ];
          paths.forEach((p) => {
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", p.d);
            path.setAttribute("fill", p.fill);
            svg.appendChild(path);
          });
          const span = document.createElement("span");
          span.textContent = " Registrar com Google";
          DOM.btnGoogleRegistro.appendChild(svg);
          DOM.btnGoogleRegistro.appendChild(span);
        }
        if (estado.googleLoginPendente) {
          estado.googleLoginPendente = false;
          google.accounts.id.prompt();
        }
      }
    } catch (err) {}
  }
  DOM.navAvatar.addEventListener("click", async () => {
    if (DOM.tabDados) DOM.tabDados.click();
    abrirModal(DOM.perfilModal);
    DOM.perfilNome.value = estado.usuario?.nome || "";
    try {
      const resp = await fetch("/api/auth/perfil");
      const data = await resp.json();
      if (data.sucesso && data.dados && data.dados.usuario) {
        const u = data.dados.usuario;
        DOM.perfilNome.value = u.nome || "";
        DOM.perfilCpf.value = u.cpf || "";
        DOM.perfilLocalidade.value = u.localidade || "";
        if (DOM.perfilTelefone) DOM.perfilTelefone.value = u.telefone || "";
        DOM.perfilPix.value = u.chave_pix || "";
        const areaAfiliado = document.getElementById("areaAfiliadoStats");
        if (areaAfiliado) {
          const link = window.location.origin + "?convite=" + (u.codigo_convite || "");
          areaAfiliado.replaceChildren();
          const container = document.createElement("div");
          container.style.marginTop = "20px";
          container.style.padding = "15px";
          container.style.background = "rgba(0,0,0,0.2)";
          container.style.borderRadius = "8px";

          const pTitle = document.createElement("p");
          const strongTitle = document.createElement("strong");
          strongTitle.textContent = "🎁 Seu Link de Indicação:";
          pTitle.appendChild(strongTitle);
          container.appendChild(pTitle);

          const inputLink = document.createElement("input");
          inputLink.className = "form-input";
          inputLink.type = "text";
          inputLink.value = link;
          inputLink.readOnly = true;
          inputLink.style.cursor = "pointer";
          inputLink.onclick = () => {
            inputLink.select();
            if (navigator.clipboard) {
              navigator.clipboard.writeText(link).then(() => {
                Swal.fire({
                  toast: true,
                  position: 'top-end',
                  icon: 'success',
                  title: 'Link copiado!',
                  showConfirmButton: false,
                  timer: 1500
                });
              });
            }
          };
          container.appendChild(inputLink);

          const pStats = document.createElement("p");
          pStats.style.marginTop = "10px";
          pStats.style.color = "var(--cor-destaque)";
          pStats.textContent = "Moedas ganhos com amigos: ";
          const strongStats = document.createElement("strong");
          strongStats.textContent = u.ganhos_afiliado || 0;
          pStats.appendChild(strongStats);
          container.appendChild(pStats);

          areaAfiliado.appendChild(container);
        }
        DOM.perfilCartao.value = u.cartao_final || "";
      }
    } catch (e) {}
  });
  DOM.btnFecharPerfil.addEventListener("click", () => {
    fecharModal(DOM.perfilModal);
    esconderFeedback(DOM.perfilFeedback);
  });
  DOM.btnSairConta.addEventListener("click", () => {
    fecharModal(DOM.perfilModal);
    logout();
  });
  DOM.tabDados.addEventListener("click", () => {
    DOM.tabDados.classList.add("active");
    DOM.tabCartao.classList.remove("active");
    if (DOM.tabSeguranca) DOM.tabSeguranca.classList.remove("active");
    DOM.areaDados.classList.add("visible");
    DOM.areaCartao.classList.remove("visible");
    if (DOM.areaSeguranca) DOM.areaSeguranca.classList.remove("visible");
    if (DOM.btnSalvarPerfil) DOM.btnSalvarPerfil.style.display = "block";
  });
  DOM.tabCartao.addEventListener("click", () => {
    DOM.tabCartao.classList.add("active");
    DOM.tabDados.classList.remove("active");
    if (DOM.tabSeguranca) DOM.tabSeguranca.classList.remove("active");
    DOM.areaCartao.classList.add("visible");
    DOM.areaDados.classList.remove("visible");
    if (DOM.areaSeguranca) DOM.areaSeguranca.classList.remove("visible");
    if (DOM.btnSalvarPerfil) DOM.btnSalvarPerfil.style.display = "block";
  });
  if (DOM.tabSeguranca) {
    DOM.tabSeguranca.addEventListener("click", () => {
      DOM.tabSeguranca.classList.add("active");
      DOM.tabDados.classList.remove("active");
      DOM.tabCartao.classList.remove("active");
      DOM.areaSeguranca.classList.add("visible");
      DOM.areaDados.classList.remove("visible");
      DOM.areaCartao.classList.remove("visible");
      // Esconde botão Salvar que pertence aos dados/cartão
      if (DOM.btnSalvarPerfil) DOM.btnSalvarPerfil.style.display = "none";
      // Carrega status 2FA do servidor
      carregar2faStatus();
    });
  }
  DOM.perfilForm.addEventListener("submit", (e) => {
    e.preventDefault();
    esconderFeedback(DOM.perfilFeedback);
    abrirModal(DOM.sudoModal);
    DOM.sudoSenha.value = "";
    esconderFeedback(DOM.sudoFeedback);
  });
  DOM.btnFecharSudo.addEventListener("click", () => fecharModal(DOM.sudoModal));
  DOM.btnFecharCreatePassword.addEventListener("click", () => fecharModal(DOM.createPasswordModal));
  DOM.sudoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    esconderFeedback(DOM.sudoFeedback);
    const btn = DOM.sudoForm.querySelector('button[type="submit"]');
    setCarregando(btn, true, "Confirmando...");
    try {
      const resp = await fetch("/api/auth/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: DOM.perfilNome.value,
          cpf: DOM.perfilCpf.value,
          localidade: DOM.perfilLocalidade.value,
          chave_pix: DOM.perfilPix.value,
          cartao_final: DOM.perfilCartao.value,
          senhaConfirmacao: DOM.sudoSenha.value,
        }),
      });
      const data = await resp.json();
      if (resp.ok) {
        fecharModal(DOM.sudoModal);
        mostrarFeedback(DOM.perfilFeedback, data.mensagem || "Perfil salvo com segurança!", true);
        if (estado.usuario) {
          estado.usuario.nome = DOM.perfilNome.value;
          atualizarNavbar();
        }
      } else {
        if (data.codigo === "REQUIRE_PASSWORD") {
          fecharModal(DOM.sudoModal);
          abrirModal(DOM.createPasswordModal);
          DOM.newSecurityPassword.value = "";
          esconderFeedback(DOM.createPasswordFeedback);
        } else {
          mostrarFeedback(DOM.sudoFeedback, data.erro || "Erro ao confirmar.", false);
        }
      }
    } catch (err) {
      mostrarFeedback(DOM.sudoFeedback, "Falha na comunicação.", false);
    } finally {
      setCarregando(btn, false, "Confirmar e Salvar");
    }
  });
  DOM.createPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    esconderFeedback(DOM.createPasswordFeedback);
    const senha1 = DOM.newSecurityPassword.value;
    const senha2 = document.getElementById("confirmSecurityPassword").value;
    if (senha1 !== senha2) {
      mostrarFeedback(DOM.createPasswordFeedback, "As senhas não coincidem. Digite novamente.", false);
      return;
    }
    const btn = DOM.createPasswordForm.querySelector('button[type="submit"]');
    setCarregando(btn, true, "Definindo...");
    try {
      const resp = await fetch("/api/auth/definir-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ novaSenha: senha1 }),
      });
      const data = await resp.json();
      if (resp.ok) {
        fecharModal(DOM.createPasswordModal);
        mostrarFeedback(DOM.perfilFeedback, "Senha criada! Clique em Salvar novamente.", true);
      } else {
        mostrarFeedback(DOM.createPasswordFeedback, data.erro || "Erro ao definir senha.", false);
      }
    } catch (err) {
      mostrarFeedback(DOM.createPasswordFeedback, "Falha de comunicação.", false);
    } finally {
      setCarregando(btn, false, "Definir Senha");
    }
  });
  function criarCardPlano(plano, isAnual) {
    const tierConfig = TIER_CONFIG[plano.id] || { icon: "📦", desc: "" };
    const article = document.createElement("article");
    article.className = "plan-card";
    article.setAttribute("data-tier", plano.id);
    if (plano.popular) {
      const badge = document.createElement("span");
      badge.className = "plan-card-popular-badge";
      badge.textContent = "★ Mais Popular";
      article.appendChild(badge);
    }
    const iconDiv = document.createElement("div");
    iconDiv.className = "plan-card-icon";
    const imgIcon = document.createElement("img");
    imgIcon.src = tierConfig.src;
    imgIcon.width = 48;
    imgIcon.height = 48;
    imgIcon.loading = "lazy";
    imgIcon.alt = tierConfig.alt;
    iconDiv.appendChild(imgIcon);
    article.appendChild(iconDiv);
    const nameEl = document.createElement("h2");
    nameEl.className = "plan-card-name";
    nameEl.textContent = plano.nome;
    article.appendChild(nameEl);
    const descEl = document.createElement("p");
    descEl.className = "plan-card-desc";
    descEl.textContent = tierConfig.desc;
    article.appendChild(descEl);
    const priceWrapper = document.createElement("div");
    priceWrapper.className = "plan-card-price-wrapper";
    const priceEl = document.createElement("span");
    priceEl.className = "plan-card-price";
    if (plano.isGratis) {
      priceEl.textContent = "Grátis";
    } else {
      const valor = isAnual ? plano.precoAnual : plano.precoMensal;
      priceEl.textContent = formatBRL(valor);
    }
    priceWrapper.appendChild(priceEl);
    if (!plano.isGratis) {
      const periodEl = document.createElement("span");
      periodEl.className = "plan-card-price-period";
      periodEl.textContent = isAnual ? "/ano" : "/mês";
      priceWrapper.appendChild(periodEl);
    }
    article.appendChild(priceWrapper);
    const ul = document.createElement("ul");
    ul.className = "plan-card-features";
    plano.recursos.forEach((recurso) => {
      const li = document.createElement("li");
      const iconSpan = document.createElement("span");
      iconSpan.className = "feature-icon";
      if (recurso.toLowerCase().includes("token")) {
        iconSpan.textContent = "🪙";
        iconSpan.style.color = "inherit";
      } else {
        iconSpan.textContent = "✓";
      }
      li.appendChild(iconSpan);
      li.appendChild(document.createTextNode(" " + recurso));
      ul.appendChild(li);
    });
    article.appendChild(ul);
    const btn = document.createElement("button");
    btn.className = "plan-card-btn";
    btn.textContent = plano.isGratis ? "Resgatar Grátis" : "Assinar Pacote";
    btn.addEventListener("click", () => {
      if (!estado.usuario) {
        carregarScriptGoogle();
        alternarTab("login");
        abrirModal(DOM.authModal);
        return;
      }
      abrirCheckout(plano);
    });
    article.appendChild(btn);
    return article;
  }
  function renderPlanos(isAnual) {
    const cardsExistentes = DOM.cardsContainer.querySelectorAll(".plan-card");
    cardsExistentes.forEach((card) => card.remove());
    const errorState = DOM.cardsContainer.querySelector(".error-container");
    if (errorState) errorState.remove();
    estado.planos.forEach((plano) => {
      const card = criarCardPlano(plano, isAnual);
      DOM.cardsContainer.appendChild(card);
    });
    DOM.labelMensal.classList.toggle("active", !isAnual);
    DOM.labelAnual.classList.toggle("active", isAnual);
  }
  function mostrarErroPlanos() {
    if (DOM.loadingState) DOM.loadingState.remove();
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-container";
    const icon = document.createElement("div");
    icon.className = "error-icon";
    icon.textContent = "⚠️";
    const title = document.createElement("h3");
    title.className = "error-title";
    title.textContent = "Não foi possível carregar os pacotes";
    const msg = document.createElement("p");
    msg.className = "error-message";
    msg.textContent = "Verifique sua conexão e tente novamente.";
    const btn = document.createElement("button");
    btn.className = "btn-gamer btn-gamer-primary";
    btn.textContent = "Tentar Novamente";
    btn.addEventListener("click", carregarPlanos);
    errorDiv.appendChild(icon);
    errorDiv.appendChild(title);
    errorDiv.appendChild(msg);
    errorDiv.appendChild(btn);
    DOM.cardsContainer.appendChild(errorDiv);
  }
  async function carregarPlanos() {
    const errorState = DOM.cardsContainer.querySelector(".error-container");
    if (errorState) errorState.remove();
    const loadingEl = document.getElementById("loadingState");
    if (loadingEl) loadingEl.remove();
    try {
      const res = await fetch("/api/planos");
      if (!res.ok) throw new Error("Falha na rede");
      const data = await res.json();
      estado.planos = data.dados || data;
      if (DOM.pricingToggle.checked) {
        renderPlanos(true);
      }
    } catch (err) {
      if (DOM.cardsContainer.querySelectorAll(".plan-card").length === 0) {
        mostrarErroPlanos();
      }
    }
  }
  DOM.pricingToggle.addEventListener("change", () => {
    if (estado.planos.length > 0) {
      renderPlanos(DOM.pricingToggle.checked);
    }
  });
  DOM.cardsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".plan-card-btn");
    if (!btn) return;
    const card = btn.closest(".plan-card");
    if (!card) return;
    const planId = card.getAttribute("data-tier");
    let plano = estado.planos.find((p) => p.id === planId);
    if (!plano) {
      const name = card.querySelector(".plan-card-name").textContent;
      plano = {
        id: planId,
        nome: name,
        precoMensal: planId === "gratis" ? 0 : planId === "iniciante" ? 4.99 : planId === "premium" ? 19.9 : 39.9,
        isGratis: planId === "gratis",
        moedas: planId === "gratis" ? 100 : planId === "iniciante" ? 1000 : planId === "premium" ? 5000 : 15000,
      };
    }
    if (!estado.usuario) {
      carregarScriptGoogle();
      alternarTab("login");
      abrirModal(DOM.authModal);
      return;
    }
    abrirCheckout(plano);
  });
  function abrirCheckout(plano) {
    estado.planoSelecionado = plano;
    estado.cupomAplicado = null;
    estado.descontoPercentual = 0;
    DOM.checkoutPlanoNome.textContent = plano.nome;
    esconderFeedback(DOM.checkoutFeedback);
    DOM.metodoPagamento.value = "";
    DOM.btnConfirmarCompra.disabled = false;
    if (DOM.inputCupom) DOM.inputCupom.value = "";
    if (DOM.cupomFeedback) esconderFeedback(DOM.cupomFeedback);
    if (DOM.btnAplicarCupom) DOM.btnAplicarCupom.disabled = false;
    if (plano.isGratis) {
      DOM.areaPagamento.style.display = "none";
      if (DOM.areaCupom) DOM.areaCupom.style.display = "none";
      if (DOM.checkoutPrecoArea) DOM.checkoutPrecoArea.style.display = "none";
      DOM.btnConfirmarCompra.textContent = "Resgatar Benefícios Grátis";
      DOM.btnConfirmarCompra.className = "btn-gamer btn-gamer-success";
    } else {
      DOM.areaPagamento.style.display = "block";
      if (DOM.areaCupom) DOM.areaCupom.style.display = "block";
      atualizarPrecoCheckout(plano.precoMensal, 0);
      DOM.btnConfirmarCompra.textContent = "Ir para Pagamento Seguro";
      DOM.btnConfirmarCompra.className = "btn-gamer btn-gamer-primary";
    }
    abrirModal(DOM.checkoutModal);
  }
  function atualizarPrecoCheckout(precoOriginal, descontoPercent) {
    if (!DOM.checkoutPrecoArea) return;
    DOM.checkoutPrecoArea.style.display = "flex";
    DOM.checkoutPrecoArea.style.justifyContent = "center";
    DOM.checkoutPrecoArea.style.alignItems = "center";
    DOM.checkoutPrecoArea.style.gap = "10px";
    const precoFormatado = precoOriginal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    if (descontoPercent > 0) {
      const precoComDesconto = precoOriginal - (precoOriginal * descontoPercent) / 100;
      const precoDescontoFormatado = precoComDesconto.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      DOM.checkoutPrecoOriginal.textContent = "";
      const strikeNode = document.createElement("s");
      strikeNode.textContent = precoFormatado;
      DOM.checkoutPrecoOriginal.appendChild(strikeNode);
      DOM.checkoutPrecoOriginal.style.display = "inline";
      DOM.checkoutPrecoFinal.textContent = precoDescontoFormatado;
    } else {
      DOM.checkoutPrecoOriginal.style.display = "none";
      DOM.checkoutPrecoFinal.textContent = precoFormatado;
    }
  }
  if (DOM.btnAplicarCupom) {
    DOM.btnAplicarCupom.addEventListener("click", async () => {
      const codigo = (DOM.inputCupom.value || "").trim().toUpperCase();
      if (!codigo) {
        mostrarFeedback(DOM.cupomFeedback, "Digite um código de cupom.", false);
        return;
      }
      DOM.btnAplicarCupom.disabled = true;
      DOM.btnAplicarCupom.textContent = "Validando...";
      esconderFeedback(DOM.cupomFeedback);
      try {
        const res = await fetchAutenticado("/api/compra/validar-cupom", {
          method: "POST",
          body: JSON.stringify({ codigo }),
        });
        const data = await res.json();
        if (data.sucesso && data.dados) {
          estado.cupomAplicado = data.dados.codigo;
          estado.descontoPercentual = data.dados.desconto_percentual;
          mostrarFeedback(DOM.cupomFeedback, data.dados.mensagem, true);
          DOM.inputCupom.disabled = true;
          DOM.btnAplicarCupom.textContent = "✓ Aplicado";
          DOM.btnAplicarCupom.style.background = "var(--accent-success, #4caf50)";
          if (estado.planoSelecionado) {
            atualizarPrecoCheckout(estado.planoSelecionado.precoMensal, estado.descontoPercentual);
          }
        } else {
          estado.cupomAplicado = null;
          estado.descontoPercentual = 0;
          mostrarFeedback(DOM.cupomFeedback, data.erro || "Cupom inválido.", false);
          DOM.btnAplicarCupom.disabled = false;
          DOM.btnAplicarCupom.textContent = "Aplicar";
        }
      } catch (err) {
        mostrarFeedback(DOM.cupomFeedback, "Erro ao validar cupom.", false);
        DOM.btnAplicarCupom.disabled = false;
        DOM.btnAplicarCupom.textContent = "Aplicar";
      }
    });
  }
  DOM.btnFecharCheckout.addEventListener("click", () => fecharModal(DOM.checkoutModal));
  DOM.btnCancelarCheckout.addEventListener("click", () => fecharModal(DOM.checkoutModal));
  DOM.checkoutModal.addEventListener("click", (e) => {
    if (e.target === DOM.checkoutModal) fecharModal(DOM.checkoutModal);
  });
  DOM.btnConfirmarCompra.addEventListener("click", async () => {
    const plano = estado.planoSelecionado;
    if (!plano) return;
    const metodoPagamento = DOM.metodoPagamento.value;
    if (!plano.isGratis && !metodoPagamento) {
      mostrarFeedback(DOM.checkoutFeedback, "Por favor, selecione Pix ou Cartão de Crédito.", false);
      return;
    }
    DOM.btnConfirmarCompra.disabled = true;
    DOM.btnConfirmarCompra.textContent = "Processando...";
    esconderFeedback(DOM.checkoutFeedback);
    try {
      const res = await fetchAutenticado("/api/comprar", {
        method: "POST",
        body: JSON.stringify({
          planoId: plano.id,
          metodoPagamento: metodoPagamento,
          isGratis: plano.isGratis,
          cupom: estado.cupomAplicado || undefined,
        }),
      });
      const data = await res.json();
      if (data.sucesso && data.dados) {
        mostrarFeedback(DOM.checkoutFeedback, data.dados.mensagem, true);
        if (plano.isGratis) {
          DOM.btnConfirmarCompra.textContent = "Concluído ✓";
          if (estado.usuario) {
            estado.usuario.saldo_moedas += plano.moedas || 100;
            DOM.navMoedaCount.textContent = (estado.usuario.saldo_moedas || 0).toLocaleString("pt-BR");
          }
          setTimeout(() => fecharModal(DOM.checkoutModal), 2000);
        } else if (data.dados.urlCheckout) {
          window.open(data.dados.urlCheckout, "_blank");
        }
      } else {
        mostrarFeedback(DOM.checkoutFeedback, data.erro || "Erro ao processar compra.", false);
        DOM.btnConfirmarCompra.disabled = false;
        DOM.btnConfirmarCompra.textContent = plano.isGratis ? "Resgatar Benefícios Grátis" : "Ir para Pagamento Seguro";
      }
    } catch (err) {
      mostrarFeedback(DOM.checkoutFeedback, "Erro de conexão com o servidor.", false);
      DOM.btnConfirmarCompra.disabled = false;
      DOM.btnConfirmarCompra.textContent = plano.isGratis ? "Resgatar Benefícios Grátis" : "Ir para Pagamento Seguro";
    }
  });
  async function carregarRanking() {
    try {
      const res = await fetch("/api/game/ranking?limite=10");
      const data = await res.json();
      if (res.ok && data.dados) {
        DOM.rankingTableBody.textContent = "";
        data.dados.forEach((jogador, index) => {
          const tr = document.createElement("tr");
          tr.className = "admin-table-row";
          let medal = `🏅 ${index + 1}º`;
          if (index === 0) medal = "🥇 1º";
          if (index === 1) medal = "🥈 2º";
          if (index === 2) medal = "🥉 3º";
          const tdMedal = document.createElement("td");
          tdMedal.className = "rank-table-cell rank-cell-medal";
          tdMedal.textContent = medal;
          const tdNome = document.createElement("td");
          tdNome.className = "rank-table-cell rank-cell-name";
          tdNome.textContent = jogador.nome.split(" ")[0];
          const tdTrofeus = document.createElement("td");
          tdTrofeus.className = "rank-table-cell rank-cell-trofeus";
          tdTrofeus.textContent = `🏆 ${jogador.trofeus || 0}`;
          const tdVitorias = document.createElement("td");
          tdVitorias.className = "rank-table-cell rank-cell-vitorias";
          tdVitorias.textContent = `⚔️ ${jogador.vitorias || 0}`;
          const tdXp = document.createElement("td");
          tdXp.className = "rank-table-cell rank-cell-xp";
          tdXp.textContent = `⭐ ${jogador.xp || 0}`;
          tr.appendChild(tdMedal);
          tr.appendChild(tdNome);
          tr.appendChild(tdTrofeus);
          tr.appendChild(tdVitorias);
          tr.appendChild(tdXp);
          DOM.rankingTableBody.appendChild(tr);
        });
      }
    } catch (e) {}
  }
  const abrirRank = () => {
    carregarRanking();
    abrirModal(DOM.rankingModal);
  };
  if (DOM.btnRanking) DOM.btnRanking.addEventListener("click", abrirRank);
  if (DOM.btnRankingLogged) DOM.btnRankingLogged.addEventListener("click", abrirRank);
  if (DOM.btnFecharRanking) DOM.btnFecharRanking.addEventListener("click", () => fecharModal(DOM.rankingModal));
  if (DOM.rankingModal)
    DOM.rankingModal.addEventListener("click", (e) => {
      if (e.target === DOM.rankingModal) fecharModal(DOM.rankingModal);
    });
  async function carregarAdminUsers() {
    try {
      const res = await fetchAutenticado("/api/admin/usuarios");
      const data = await res.json();
      if (res.ok && data.dados) {
        DOM.adminTableBody.textContent = "";
        data.dados.forEach((u) => {
          const tr = document.createElement("tr");
          tr.className = "admin-table-row";
          const tdId = document.createElement("td");
          tdId.className = "admin-table-cell";
          tdId.textContent = u.id;
          const tdNome = document.createElement("td");
          tdNome.className = "admin-table-cell admin-table-cell-name";
          tdNome.title = u.email;
          tdNome.textContent = u.nome.split(" ")[0];
          const br = document.createElement("br");
          tdNome.appendChild(br);
          const smallEmail = document.createElement("small");
          smallEmail.style.color = "var(--text-muted)";
          smallEmail.textContent = u.email;
          tdNome.appendChild(smallEmail);
          const tdSaldo = document.createElement("td");
          tdSaldo.className = "admin-table-cell";
          tdSaldo.textContent = `🪙 ${u.saldo_moedas}`;
          const tdStatus = document.createElement("td");
          tdStatus.className = "admin-table-cell";
          const spanStatus = document.createElement("span");
          spanStatus.className = "badge-status";
          if (u.status === "banido") {
            spanStatus.classList.add("banido");
            spanStatus.textContent = "Banido";
          } else {
            spanStatus.classList.add("ativo");
            spanStatus.textContent = "Ativo";
          }
          tdStatus.appendChild(spanStatus);
          const tdAcao = document.createElement("td");
          tdAcao.className = "admin-table-cell admin-table-cell-action";
          const btnStatus = document.createElement("button");
          btnStatus.className = "toggle-status btn-action-status";
          btnStatus.setAttribute("data-id", u.id);
          btnStatus.setAttribute("data-status", u.status === "banido" ? "ativo" : "banido");
          if (u.status === "banido") {
            btnStatus.classList.add("desbanir");
            btnStatus.textContent = "DESBANIR";
          } else {
            btnStatus.classList.add("banir");
            btnStatus.textContent = "BANIR";
          }
          tdAcao.appendChild(btnStatus);
          tr.appendChild(tdId);
          tr.appendChild(tdNome);
          tr.appendChild(tdSaldo);
          tr.appendChild(tdStatus);
          tr.appendChild(tdAcao);
          DOM.adminTableBody.appendChild(tr);
        });
        document.querySelectorAll(".toggle-status").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            const userId = e.target.getAttribute("data-id");
            const newStatus = e.target.getAttribute("data-status");
            await fetchAutenticado("/api/admin/usuarios/status", {
              method: "POST",
              body: JSON.stringify({ usuarioId: userId, status: newStatus }),
            });
            carregarAdminUsers();
          });
        });
      }
    } catch (e) {}
  }
  if (DOM.btnAdminPanel)
    DOM.btnAdminPanel.addEventListener("click", () => {
      carregarAdminUsers();
      abrirModal(DOM.adminModal);
    });
  if (DOM.btnFecharAdmin) DOM.btnFecharAdmin.addEventListener("click", () => fecharModal(DOM.adminModal));
  if (DOM.adminModal)
    DOM.adminModal.addEventListener("click", (e) => {
      if (e.target === DOM.adminModal) fecharModal(DOM.adminModal);
    });
  if (DOM.adminMoedasForm)
    DOM.adminMoedasForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = DOM.adminMoedasForm.querySelector("button");
      setCarregando(btn, true, "Adicionando...");
      try {
        const res = await fetchAutenticado("/api/admin/usuarios/moedas", {
          method: "POST",
          body: JSON.stringify({
            usuarioId: DOM.adminUserId.value,
            quantidade: DOM.adminMoedaAmount.value,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          mostrarFeedback(DOM.adminFeedback, data.dados.mensagem, true);
          DOM.adminMoedasForm.reset();
          carregarAdminUsers();
        } else {
          mostrarFeedback(DOM.adminFeedback, data.erro || "Erro", false);
        }
      } catch (err) {
        mostrarFeedback(DOM.adminFeedback, "Erro de conexão", false);
      } finally {
        setCarregando(btn, false, "Adicionar");
      }
    });
  if (DOM.btnEsqueciSenha) {
    DOM.btnEsqueciSenha.addEventListener("click", (e) => {
      e.preventDefault();
      fecharModal(DOM.authModal);
      abrirModal(DOM.forgotPasswordModal);
      DOM.forgotEmail.value = "";
      esconderFeedback(DOM.forgotFeedback);
    });
  }
  if (DOM.btnEsqueciSenhaSudo) {
    DOM.btnEsqueciSenhaSudo.addEventListener("click", (e) => {
      e.preventDefault();
      fecharModal(DOM.sudoModal);
      abrirModal(DOM.forgotPasswordModal);
      DOM.forgotEmail.value = "";
      esconderFeedback(DOM.forgotFeedback);
    });
  }
  if (DOM.btnVoltarLogin) {
    DOM.btnVoltarLogin.addEventListener("click", () => {
      fecharModal(DOM.forgotPasswordModal);
      abrirModal(DOM.authModal);
      alternarTab("login");
    });
  }
  if (DOM.btnFecharForgot) {
    DOM.btnFecharForgot.addEventListener("click", () => fecharModal(DOM.forgotPasswordModal));
  }
  if (DOM.btnFecharReset) {
    DOM.btnFecharReset.addEventListener("click", () => fecharModal(DOM.resetPasswordModal));
  }
  if (DOM.forgotForm) {
    DOM.forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      esconderFeedback(DOM.forgotFeedback);
      const btn = DOM.btnEnviarForgot;
      setCarregando(btn, true, "Enviando...");
      try {
        const res = await fetch("/api/auth/recuperar-senha", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: DOM.forgotEmail.value }),
        });
        const data = await res.json();
        if (data.sucesso) {
          mostrarFeedback(DOM.forgotFeedback, data.dados.mensagem, true);
          DOM.forgotForm.reset();
        } else {
          mostrarFeedback(DOM.forgotFeedback, data.erro || "Erro ao processar solicitação.", false);
        }
      } catch (err) {
        mostrarFeedback(DOM.forgotFeedback, "Erro de conexão com o servidor.", false);
      } finally {
        setCarregando(btn, false, "Enviar Link");
      }
    });
  }
  if (DOM.resetForm) {
    DOM.resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      esconderFeedback(DOM.resetFeedback);
      const novaSenha = DOM.resetNovaSenha.value;
      const confirmarSenha = DOM.resetConfirmarSenha.value;
      if (novaSenha !== confirmarSenha) {
        mostrarFeedback(DOM.resetFeedback, "As senhas não coincidem.", false);
        return;
      }
      if (novaSenha.length < 6) {
        mostrarFeedback(DOM.resetFeedback, "A senha deve ter pelo menos 6 caracteres.", false);
        return;
      }
      const btn = DOM.btnConfirmarReset;
      setCarregando(btn, true, "Salvando...");
      try {
        const res = await fetch("/api/auth/redefinir-senha", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: estado.resetToken, novaSenha }),
        });
        const data = await res.json();
        if (data.sucesso) {
          mostrarFeedback(DOM.resetFeedback, data.dados.mensagem, true);
          DOM.resetForm.reset();
          setTimeout(() => {
            fecharModal(DOM.resetPasswordModal);
            abrirModal(DOM.authModal);
            alternarTab("login");
          }, 3000);
        } else {
          mostrarFeedback(DOM.resetFeedback, data.erro || "Erro ao redefinir senha.", false);
        }
      } catch (err) {
        mostrarFeedback(DOM.resetFeedback, "Erro de conexão com o servidor.", false);
      } finally {
        setCarregando(btn, false, "Salvar Nova Senha");
      }
    });
  }
  async function carregarEstatisticas() {
    try {
      const res = await fetch("/api/estatisticas");
      const data = await res.json();
      if (data.sucesso && data.dados) {
        const stats = data.dados;
        if (DOM.statsTotalUsuarios)
          DOM.statsTotalUsuarios.textContent = (stats.totalUsuarios || 0).toLocaleString("pt-BR");
        if (DOM.statsTotalMoedas) DOM.statsTotalMoedas.textContent = (stats.totalTokens || 0).toLocaleString("pt-BR");
        if (DOM.recentSalesList) {
          DOM.recentSalesList.textContent = "";
          if (stats.ultimasVendas.length === 0) {
            const liVazio = document.createElement("li");
            liVazio.textContent = "Nenhuma atividade registrada ainda.";
            DOM.recentSalesList.appendChild(liVazio);
            return;
          }
          stats.ultimasVendas.slice(0, 5).forEach((venda) => {
            const li = document.createElement("li");
            const dataVenda = new Date(venda.data).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
            const nomeFormatado = venda.nome.length > 4 ? venda.nome.substring(0, 4) + "***" : venda.nome + "***";

            const spanMain = document.createElement("span");
            spanMain.appendChild(document.createTextNode("Jogador "));

            const strongNome = document.createElement("strong");
            strongNome.textContent = nomeFormatado;
            spanMain.appendChild(strongNome);

            spanMain.appendChild(document.createTextNode(" adquiriu o "));

            const spanPlan = document.createElement("span");
            spanPlan.className = "sale-plan";
            spanPlan.textContent = venda.plano_id.toUpperCase();
            spanMain.appendChild(spanPlan);

            spanMain.appendChild(document.createTextNode(` (+${(venda.moedas || 0).toLocaleString("pt-BR")} Moedas)`));

            const spanTime = document.createElement("span");
            spanTime.className = "sale-time";
            spanTime.textContent = dataVenda;

            li.appendChild(spanMain);
            li.appendChild(spanTime);

            DOM.recentSalesList.appendChild(li);
          });
        }
      }
    } catch (e) {
      if (DOM.recentSalesList) {
        const liErro = document.createElement("li");
        liErro.style.justifyContent = "center";
        liErro.style.color = "#ef4444";
        liErro.textContent = "Erro ao carregar atividades recentes.";
        DOM.recentSalesList.replaceChildren(liErro);
      }
    }
  }
  async function inicializar() {
    atualizarNavbar();
    try {
      await Promise.all([restaurarSessao(), carregarPlanos(), carregarEstatisticas(), initGoogleAuth()]);
    } catch (e) {
      console.error(e);
    }
    const urlParams = new URLSearchParams(window.location.search);
    const rToken = urlParams.get("resetToken");
    if (rToken) {
      estado.resetToken = rToken;
      abrirModal(DOM.resetPasswordModal);
      const novaUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: novaUrl }, "", novaUrl);
    }
  }
  inicializar();
});
