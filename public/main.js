/**
 * @file 
 * @description 
 */
document.addEventListener('DOMContentLoaded', () => {
  const DOM = {
    navAuthBtns: document.getElementById('navAuthBtns'),
    navUserInfo: document.getElementById('navUserInfo'),
    navTokenCount: document.getElementById('navTokenCount'),
    navAvatar: document.getElementById('navAvatar'),
    btnAbrirLogin: document.getElementById('btnAbrirLogin'),
    btnAbrirRegistro: document.getElementById('btnAbrirRegistro'),

    cardsContainer: document.getElementById('cardsContainer'),
    loadingState: document.getElementById('loadingState'),
    pricingToggle: document.getElementById('pricingToggle'),
    labelMensal: document.getElementById('labelMensal'),
    labelAnual: document.getElementById('labelAnual'),

    authModal: document.getElementById('authModal'),
    tabLogin: document.getElementById('tabLogin'),
    tabRegistro: document.getElementById('tabRegistro'),
    formLogin: document.getElementById('formLogin'),
    formRegistro: document.getElementById('formRegistro'),
    loginForm: document.getElementById('loginForm'),
    registroForm: document.getElementById('registroForm'),
    loginFeedback: document.getElementById('loginFeedback'),
    registroFeedback: document.getElementById('registroFeedback'),
    btnLogin: document.getElementById('btnLogin'),
    btnRegistro: document.getElementById('btnRegistro'),
    btnFecharAuth: document.getElementById('btnFecharAuth'),
    btnFecharAuth2: document.getElementById('btnFecharAuth2'),
    btnGoogleLogin: document.getElementById('btnGoogleLogin'),
    btnGoogleRegistro: document.getElementById('btnGoogleRegistro'),

    checkoutModal: document.getElementById('checkoutModal'),
    checkoutPlanoNome: document.getElementById('checkoutPlanoNome'),
    areaPagamento: document.getElementById('areaPagamento'),
    metodoPagamento: document.getElementById('metodoPagamento'),
    checkoutFeedback: document.getElementById('checkoutFeedback'),
    btnConfirmarCompra: document.getElementById('btnConfirmarCompra'),
    btnFecharCheckout: document.getElementById('btnFecharCheckout'),
    btnCancelarCheckout: document.getElementById('btnCancelarCheckout'),

    perfilModal: document.getElementById('perfilModal'),
    btnFecharPerfil: document.getElementById('btnFecharPerfil'),
    btnSairConta: document.getElementById('btnSairConta'),
    tabDados: document.getElementById('tabDados'),
    tabCartao: document.getElementById('tabCartao'),
    areaDados: document.getElementById('areaDados'),
    areaCartao: document.getElementById('areaCartao'),
    perfilForm: document.getElementById('perfilForm'),
    perfilNome: document.getElementById('perfilNome'),
    perfilCpf: document.getElementById('perfilCpf'),
    perfilLocalidade: document.getElementById('perfilLocalidade'),
    perfilPix: document.getElementById('perfilPix'),
    perfilCartao: document.getElementById('perfilCartao'),
    perfilFeedback: document.getElementById('perfilFeedback'),
    btnSalvarPerfil: document.getElementById('btnSalvarPerfil'),

    // Ranking
    btnRanking: document.getElementById('btnRanking'),
    btnRankingLogged: document.getElementById('btnRankingLogged'),
    rankingModal: document.getElementById('rankingModal'),
    btnFecharRanking: document.getElementById('btnFecharRanking'),
    rankingTableBody: document.getElementById('rankingTableBody'),

    // Admin Panel
    btnAdminPanel: document.getElementById('btnAdminPanel'),
    adminModal: document.getElementById('adminModal'),
    btnFecharAdmin: document.getElementById('btnFecharAdmin'),
    adminTableBody: document.getElementById('adminTableBody'),
    adminTokensForm: document.getElementById('adminTokensForm'),
    adminUserId: document.getElementById('adminUserId'),
    adminTokenAmount: document.getElementById('adminTokenAmount'),
    adminFeedback: document.getElementById('adminFeedback')
  };

  let estado = {
    planos: [],
    usuario: null,
    token: localStorage.getItem('token') || null,
    planoSelecionado: null
  };

  const TIER_CONFIG = {
    gratis: { icon: '🛡️', desc: 'Comece sua jornada com o pacote inicial.' },
    premium: { icon: '⚔️', desc: 'O favorito dos jogadores competitivos.' },
    vip: { icon: '👑', desc: 'Para quem quer dominar sem limites.' }
  };
  /**
   * @param {string} url
   * @param {Object} [opcoes={}]
   * @returns {Promise<Response>}
   */
  async function fetchAutenticado(url, opcoes = {}) {
    const headers = { 'Content-Type': 'application/json', ...opcoes.headers };
    if (estado.token) {
      headers['Authorization'] = `Bearer ${estado.token}`;
    }
    return fetch(url, { ...opcoes, headers });
  }

  /**
   * Mostra feedback visual em um elemento de alerta.
   * @param {HTMLElement} el
   * @param {string} mensagem
   * @param {boolean} isSucesso
   */
  function mostrarFeedback(el, mensagem, isSucesso) {
    el.textContent = mensagem;
    el.className = `alert-feedback visible ${isSucesso ? 'success' : 'error'}`;
  }

  function esconderFeedback(el) {
    el.className = 'alert-feedback';
    el.textContent = '';
  }

  function abrirModal(modal) {
    modal.classList.add('visible');
  }

  function fecharModal(modal) {
    modal.classList.remove('visible');
  }

  function setCarregando(btn, isLoading, texto) {
    btn.disabled = isLoading;
    btn.textContent = texto;
  }


  
  function atualizarNavbar() {
    if (estado.usuario) {
      DOM.navAuthBtns.style.display = 'none';
      DOM.navUserInfo.style.display = 'flex';
      DOM.navTokenCount.textContent = estado.usuario.saldo_tokens.toLocaleString('pt-BR');
      DOM.navAvatar.textContent = estado.usuario.nome.charAt(0).toUpperCase();
      DOM.navAvatar.title = `${estado.usuario.nome} — Clique para sair`;

      const is_admin = estado.usuario.email === 'joaomarcelosuzartcastro@gmail.com';
      const firstName = estado.usuario.nome.split(' ')[0];
      
      const elName = document.getElementById('navUserName');
      const elRole = document.getElementById('navUserRole');
      
      if (elName) elName.textContent = firstName;
      if (elRole) {
        if (estado.usuario.email_verificado === 0) {
          elRole.innerHTML = `⚠️ Email Pendente`;
          elRole.style.background = '#f59e0b';
          if (DOM.btnAdminPanel) DOM.btnAdminPanel.style.display = 'none';
        } else if (is_admin) {
          elRole.textContent = 'Administrador';
          elRole.style.background = '#b91c1c'; 
          if (DOM.btnAdminPanel) DOM.btnAdminPanel.style.display = 'inline-block';
        } else {
          elRole.textContent = 'Jogador';
          elRole.style.background = '#3b82f6'; 
          if (DOM.btnAdminPanel) DOM.btnAdminPanel.style.display = 'none';
        }
      }
    } else {
      DOM.navAuthBtns.style.display = 'flex';
      DOM.navUserInfo.style.display = 'none';
    }
  }

  async function restaurarSessao() {
    if (!estado.token) return;

    try {
      const res = await fetchAutenticado('/api/auth/perfil');
      const data = await res.json();

      if (data.sucesso && data.dados && data.dados.usuario) {
        estado.usuario = data.dados.usuario;
      } else {
        estado.token = null;
        localStorage.removeItem('token');
      }
    } catch (err) {
      estado.token = null;
      localStorage.removeItem('token');
    }

    atualizarNavbar();
  }

  function logout() {
    estado.token = null;
    estado.usuario = null;
    localStorage.removeItem('token');
    atualizarNavbar();
  }


  function alternarTab(tab) {
    if (tab === 'login') {
      DOM.tabLogin.classList.add('active');
      DOM.tabRegistro.classList.remove('active');
      DOM.formLogin.classList.add('visible');
      DOM.formRegistro.classList.remove('visible');
    } else {
      DOM.tabLogin.classList.remove('active');
      DOM.tabRegistro.classList.add('active');
      DOM.formLogin.classList.remove('visible');
      DOM.formRegistro.classList.add('visible');
    }
    esconderFeedback(DOM.loginFeedback);
    esconderFeedback(DOM.registroFeedback);
  }

  DOM.tabLogin.addEventListener('click', () => alternarTab('login'));
  DOM.tabRegistro.addEventListener('click', () => alternarTab('registro'));

  DOM.btnAbrirLogin.addEventListener('click', () => {
    alternarTab('login');
    abrirModal(DOM.authModal);
  });

  DOM.btnAbrirRegistro.addEventListener('click', () => {
    alternarTab('registro');
    abrirModal(DOM.authModal);
  });

  DOM.btnFecharAuth.addEventListener('click', () => fecharModal(DOM.authModal));
  DOM.btnFecharAuth2.addEventListener('click', () => fecharModal(DOM.authModal));

  DOM.authModal.addEventListener('click', (e) => {
    if (e.target === DOM.authModal) fecharModal(DOM.authModal);
  });

  DOM.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    esconderFeedback(DOM.loginFeedback);
    DOM.btnLogin.disabled = true;
    DOM.btnLogin.textContent = 'Entrando...';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('loginEmail').value,
          senha: document.getElementById('loginSenha').value
        })
      });

      const data = await res.json();

      if (data.sucesso && data.dados) {
        estado.token = data.dados.token;
        estado.usuario = data.dados.usuario;
        localStorage.setItem('token', data.dados.token);
        atualizarNavbar();
        fecharModal(DOM.authModal);
        DOM.loginForm.reset();
      } else {
        mostrarFeedback(DOM.loginFeedback, data.erro || 'Erro ao fazer login.', false);
      }
    } catch (err) {
      mostrarFeedback(DOM.loginFeedback, 'Erro de conexão com o servidor.', false);
    }

    DOM.btnLogin.disabled = false;
    DOM.btnLogin.textContent = 'Entrar na Arena';
  });

  // Registro
  DOM.registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    esconderFeedback(DOM.registroFeedback);
    DOM.btnRegistro.disabled = true;
    DOM.btnRegistro.textContent = 'Criando...';

    try {
      const res = await fetch('/api/auth/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: document.getElementById('registroNome').value,
          email: document.getElementById('registroEmail').value,
          senha: document.getElementById('registroSenha').value
        })
      });

      const data = await res.json();

      if (data.sucesso && data.dados) {
        mostrarFeedback(DOM.registroFeedback, 'Conta criada! Verifique seu e-mail para confirmar a conta.', true);
        estado.token = data.dados.token;
        estado.usuario = data.dados.usuario;
        localStorage.setItem('token', data.dados.token);
        atualizarNavbar();
        DOM.registroForm.reset();
        setTimeout(() => fecharModal(DOM.authModal), 3000);
      } else {
        mostrarFeedback(DOM.registroFeedback, data.erro || 'Erro ao criar conta.', false);
      }
    } catch (err) {
      mostrarFeedback(DOM.registroFeedback, 'Erro de conexão com o servidor.', false);
    }

    DOM.btnRegistro.disabled = false;
    DOM.btnRegistro.textContent = 'Criar Conta';
  });

  async function handleGoogleCallback(response) {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
      });

      const data = await res.json();

      if (data.sucesso && data.dados) {
        estado.token = data.dados.token;
        estado.usuario = data.dados.usuario;
        localStorage.setItem('token', data.dados.token);
        atualizarNavbar();
        fecharModal(DOM.authModal);
      } else {
        const feedbackEl = DOM.tabLogin.classList.contains('active') ? DOM.loginFeedback : DOM.registroFeedback;
        mostrarFeedback(feedbackEl, data.erro || 'Erro no login com Google.', false);
      }
    } catch (err) {
      const feedbackEl = DOM.tabLogin.classList.contains('active') ? DOM.loginFeedback : DOM.registroFeedback;
      mostrarFeedback(feedbackEl, 'Erro de conexão com o servidor.', false);
    }
  }

  window.onload = async function () {
    if (window.google) {
      try {
        const resp = await fetch('/api/auth/google/client-id');
        const data = await resp.json();

        if (data.clientId) {
          google.accounts.id.initialize({
            client_id: data.clientId,
            callback: handleGoogleCallback,
            use_fedcm_for_prompt: false
          });

          const handleGoogleClick = () => google.accounts.id.prompt();

          if (DOM.btnGoogleLogin) DOM.btnGoogleLogin.addEventListener('click', handleGoogleClick);
          if (DOM.btnGoogleRegistro) DOM.btnGoogleRegistro.addEventListener('click', handleGoogleClick);
        }
      } catch (err) {
        console.warn('Google Auth não disponível.');
      }
    }
  };
  
  DOM.navAvatar.addEventListener('click', async () => {
    abrirModal(DOM.perfilModal);
    DOM.perfilNome.value = estado.usuario?.nome || '';
    
    try {
      const resp = await fetch('/api/auth/perfil', {
        headers: { 'Authorization': `Bearer ${estado.token}` }
      });
      const data = await resp.json();
      if (data.sucesso && data.dados && data.dados.usuario) {
        const u = data.dados.usuario;
        DOM.perfilNome.value = u.nome || '';
        DOM.perfilCpf.value = u.cpf || '';
        DOM.perfilLocalidade.value = u.localidade || '';
        DOM.perfilPix.value = u.chave_pix || '';
        DOM.perfilCartao.value = u.cartao_final || '';
      }
    } catch (e) { console.error('Erro ao buscar perfil', e); }
  });

  DOM.btnFecharPerfil.addEventListener('click', () => {
    fecharModal(DOM.perfilModal);
    esconderFeedback(DOM.perfilFeedback);
  });

  DOM.btnSairConta.addEventListener('click', () => {
    fecharModal(DOM.perfilModal);
    logout();
  });

  DOM.tabDados.addEventListener('click', () => {
    DOM.tabDados.classList.add('active');
    DOM.tabCartao.classList.remove('active');
    DOM.areaDados.classList.add('visible');
    DOM.areaCartao.classList.remove('visible');
  });

  DOM.tabCartao.addEventListener('click', () => {
    DOM.tabCartao.classList.add('active');
    DOM.tabDados.classList.remove('active');
    DOM.areaCartao.classList.add('visible');
    DOM.areaDados.classList.remove('visible');
  });

  DOM.perfilForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    esconderFeedback(DOM.perfilFeedback);
    setCarregando(DOM.btnSalvarPerfil, true, 'Salvando...');

    try {
      const resp = await fetch('/api/auth/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${estado.token}`
        },
        body: JSON.stringify({
          nome: DOM.perfilNome.value,
          cpf: DOM.perfilCpf.value,
          localidade: DOM.perfilLocalidade.value,
          chave_pix: DOM.perfilPix.value,
          cartao_final: DOM.perfilCartao.value
        })
      });

      const data = await resp.json();
      if (resp.ok) {
        mostrarFeedback(DOM.perfilFeedback, data.mensagem || 'Perfil salvo com sucesso!', true);
        if (estado.usuario) {
          estado.usuario.nome = DOM.perfilNome.value;
          atualizarNavbar();
        }
      } else {
        mostrarFeedback(DOM.perfilFeedback, data.erro || 'Erro ao salvar perfil.', false);
      }
    } catch (err) {
      mostrarFeedback(DOM.perfilFeedback, 'Falha na comunicação com o servidor.', false);
    } finally {
      setCarregando(DOM.btnSalvarPerfil, false, 'Salvar Alterações');
    }
  });

  function criarCardPlano(plano, isAnual) {
    const tierConfig = TIER_CONFIG[plano.id] || { icon: '📦', desc: '' };

    const article = document.createElement('article');
    article.className = 'plan-card';
    article.setAttribute('data-tier', plano.id);

    if (plano.popular) {
      const badge = document.createElement('span');
      badge.className = 'plan-card-popular-badge';
      badge.textContent = '★ Mais Popular';
      article.appendChild(badge);
    }

    const iconDiv = document.createElement('div');
    iconDiv.className = 'plan-card-icon';
    iconDiv.textContent = tierConfig.icon;
    article.appendChild(iconDiv);

    const nameEl = document.createElement('h2');
    nameEl.className = 'plan-card-name';
    nameEl.textContent = plano.nome;
    article.appendChild(nameEl);

    const descEl = document.createElement('p');
    descEl.className = 'plan-card-desc';
    descEl.textContent = tierConfig.desc;
    article.appendChild(descEl);

    const priceWrapper = document.createElement('div');
    priceWrapper.className = 'plan-card-price-wrapper';

    const priceEl = document.createElement('span');
    priceEl.className = 'plan-card-price';

    if (plano.isGratis) {
      priceEl.textContent = 'Grátis';
    } else {
      const valor = isAnual ? plano.precoAnual : plano.precoMensal;
      priceEl.textContent = `R$ ${valor.toFixed(2)}`;
    }

    priceWrapper.appendChild(priceEl);

    if (!plano.isGratis) {
      const periodEl = document.createElement('span');
      periodEl.className = 'plan-card-price-period';
      periodEl.textContent = isAnual ? '/ano' : '/mês';
      priceWrapper.appendChild(periodEl);
    }

    article.appendChild(priceWrapper);

    const ul = document.createElement('ul');
    ul.className = 'plan-card-features';

    plano.recursos.forEach(recurso => {
      const li = document.createElement('li');

      const iconSpan = document.createElement('span');
      iconSpan.className = 'feature-icon';
      iconSpan.textContent = '✓';

      li.appendChild(iconSpan);
      li.appendChild(document.createTextNode(recurso));
      ul.appendChild(li);
    });

    article.appendChild(ul);

    const btn = document.createElement('button');
    btn.className = 'plan-card-btn';
    btn.textContent = plano.isGratis ? 'Resgatar Grátis' : 'Assinar Pacote';

    btn.addEventListener('click', () => {
      if (!estado.usuario) {
        alternarTab('login');
        abrirModal(DOM.authModal);
        return;
      }
      abrirCheckout(plano);
    });

    article.appendChild(btn);

    return article;
  }

  function renderPlanos(isAnual) {
    const cardsExistentes = DOM.cardsContainer.querySelectorAll('.plan-card');
    cardsExistentes.forEach(card => card.remove());

    const errorState = DOM.cardsContainer.querySelector('.error-container');
    if (errorState) errorState.remove();

    estado.planos.forEach(plano => {
      const card = criarCardPlano(plano, isAnual);
      DOM.cardsContainer.appendChild(card);
    });

    DOM.labelMensal.classList.toggle('active', !isAnual);
    DOM.labelAnual.classList.toggle('active', isAnual);
  }

  function mostrarErroPlanos() {
    if (DOM.loadingState) DOM.loadingState.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-container';

    const icon = document.createElement('div');
    icon.className = 'error-icon';
    icon.textContent = '⚠️';

    const title = document.createElement('h3');
    title.className = 'error-title';
    title.textContent = 'Não foi possível carregar os pacotes';

    const msg = document.createElement('p');
    msg.className = 'error-message';
    msg.textContent = 'Verifique sua conexão e tente novamente.';

    const btn = document.createElement('button');
    btn.className = 'btn-gamer btn-gamer-primary';
    btn.textContent = 'Tentar Novamente';
    btn.addEventListener('click', carregarPlanos);

    errorDiv.appendChild(icon);
    errorDiv.appendChild(title);
    errorDiv.appendChild(msg);
    errorDiv.appendChild(btn);

    DOM.cardsContainer.appendChild(errorDiv);
  }

  async function carregarPlanos() {
    const errorState = DOM.cardsContainer.querySelector('.error-container');
    if (errorState) errorState.remove();

    if (!DOM.loadingState) {
      const loading = document.createElement('div');
      loading.className = 'loading-container';
      loading.id = 'loadingState';
      const p = document.createElement('p');
      p.className = 'loading-text';
      p.textContent = 'Carregando pacotes...';
      loading.appendChild(p);
      DOM.cardsContainer.appendChild(loading);
    }

    try {
      const res = await fetch('/api/planos');
      if (!res.ok) throw new Error('Falha na rede');

      const data = await res.json();
      estado.planos = data.dados || data;

      const loadingEl = document.getElementById('loadingState');
      if (loadingEl) loadingEl.remove();

      renderPlanos(DOM.pricingToggle.checked);
    } catch (err) {
      console.error('Erro ao buscar pacotes:', err);
      mostrarErroPlanos();
    }
  }

  DOM.pricingToggle.addEventListener('change', () => {
    if (estado.planos.length > 0) {
      renderPlanos(DOM.pricingToggle.checked);
    }
  });
  function abrirCheckout(plano) {
    estado.planoSelecionado = plano;
    DOM.checkoutPlanoNome.textContent = plano.nome;
    esconderFeedback(DOM.checkoutFeedback);
    DOM.metodoPagamento.value = '';
    DOM.btnConfirmarCompra.disabled = false;

    if (plano.isGratis) {
      DOM.areaPagamento.style.display = 'none';
      DOM.btnConfirmarCompra.textContent = 'Resgatar Benefícios Grátis';
      DOM.btnConfirmarCompra.className = 'btn-gamer btn-gamer-success';
    } else {
      DOM.areaPagamento.style.display = 'block';
      DOM.btnConfirmarCompra.textContent = 'Ir para Pagamento Seguro';
      DOM.btnConfirmarCompra.className = 'btn-gamer btn-gamer-primary';
    }

    abrirModal(DOM.checkoutModal);
  }

  DOM.btnFecharCheckout.addEventListener('click', () => fecharModal(DOM.checkoutModal));
  DOM.btnCancelarCheckout.addEventListener('click', () => fecharModal(DOM.checkoutModal));

  DOM.checkoutModal.addEventListener('click', (e) => {
    if (e.target === DOM.checkoutModal) fecharModal(DOM.checkoutModal);
  });

  DOM.btnConfirmarCompra.addEventListener('click', async () => {
    const plano = estado.planoSelecionado;
    if (!plano) return;

    const metodoPagamento = DOM.metodoPagamento.value;

    if (!plano.isGratis && !metodoPagamento) {
      mostrarFeedback(DOM.checkoutFeedback, 'Por favor, selecione Pix ou Cartão de Crédito.', false);
      return;
    }

    DOM.btnConfirmarCompra.disabled = true;
    DOM.btnConfirmarCompra.textContent = 'Processando...';
    esconderFeedback(DOM.checkoutFeedback);

    try {
      const res = await fetchAutenticado('/api/comprar', {
        method: 'POST',
        body: JSON.stringify({
          planoId: plano.id,
          metodoPagamento: metodoPagamento,
          isGratis: plano.isGratis
        })
      });

      const data = await res.json();

      if (data.sucesso && data.dados) {
        mostrarFeedback(DOM.checkoutFeedback, data.dados.mensagem, true);

        if (plano.isGratis) {
          DOM.btnConfirmarCompra.textContent = 'Concluído ✓';

          if (estado.usuario) {
            estado.usuario.saldo_tokens += plano.tokens || 100;
            DOM.navTokenCount.textContent = estado.usuario.saldo_tokens.toLocaleString('pt-BR');
          }

          setTimeout(() => fecharModal(DOM.checkoutModal), 2000);
        } else if (data.dados.urlCheckout) {
          window.location.href = data.dados.urlCheckout;
        }
      } else {
        mostrarFeedback(DOM.checkoutFeedback, data.erro || 'Erro ao processar compra.', false);
        DOM.btnConfirmarCompra.disabled = false;
        DOM.btnConfirmarCompra.textContent = plano.isGratis ? 'Resgatar Benefícios Grátis' : 'Ir para Pagamento Seguro';
      }
    } catch (err) {
      mostrarFeedback(DOM.checkoutFeedback, 'Erro de conexão com o servidor.', false);
      DOM.btnConfirmarCompra.disabled = false;
      DOM.btnConfirmarCompra.textContent = plano.isGratis ? 'Resgatar Benefícios Grátis' : 'Ir para Pagamento Seguro';
    }
  });

  // ================== RANKING ==================
  async function carregarRanking() {
    try {
      const res = await fetch('/api/game/ranking?limite=10');
      const data = await res.json();
      if (res.ok && data.dados) {
        DOM.rankingTableBody.innerHTML = '';
        data.dados.forEach((jogador, index) => {
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
          
          let medal = `${index + 1}º`;
          if (index === 0) medal = '🥇';
          if (index === 1) medal = '🥈';
          if (index === 2) medal = '🥉';

          tr.innerHTML = `
            <td style="padding: 10px; font-weight: bold;">${medal}</td>
            <td style="padding: 10px; font-weight: 600; color: #fff;">${jogador.nome.split(' ')[0]}</td>
            <td style="padding: 10px; color: #fbbf24;">🏆 ${jogador.trofeus || 0}</td>
            <td style="padding: 10px; color: #34d399;">⚔️ ${jogador.vitorias || 0}</td>
            <td style="padding: 10px; color: #60a5fa;">⭐ ${jogador.xp || 0}</td>
          `;
          DOM.rankingTableBody.appendChild(tr);
        });
      }
    } catch (e) { console.error('Erro ao buscar ranking', e); }
  }

  const abrirRank = () => {
    carregarRanking();
    abrirModal(DOM.rankingModal);
  };
  if (DOM.btnRanking) DOM.btnRanking.addEventListener('click', abrirRank);
  if (DOM.btnRankingLogged) DOM.btnRankingLogged.addEventListener('click', abrirRank);
  if (DOM.btnFecharRanking) DOM.btnFecharRanking.addEventListener('click', () => fecharModal(DOM.rankingModal));
  if (DOM.rankingModal) DOM.rankingModal.addEventListener('click', (e) => {
    if (e.target === DOM.rankingModal) fecharModal(DOM.rankingModal);
  });

  // ================== ADMIN PANEL ==================
  async function carregarAdminUsers() {
    try {
      const res = await fetchAutenticado('/api/admin/usuarios');
      const data = await res.json();
      if (res.ok && data.dados) {
        DOM.adminTableBody.innerHTML = '';
        data.dados.forEach(u => {
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
          const badgeStatus = u.status === 'banido' ? '<span style="color:#ef4444;font-size:0.8rem;">Banido</span>' : '<span style="color:#34d399;font-size:0.8rem;">Ativo</span>';
          
          tr.innerHTML = `
            <td style="padding: 8px;">${u.id}</td>
            <td style="padding: 8px;">${u.nome.split(' ')[0]}<br><small style="color:var(--text-muted);">${u.email}</small></td>
            <td style="padding: 8px;">🪙 ${u.saldo_tokens}</td>
            <td style="padding: 8px;">${badgeStatus}</td>
            <td style="padding: 8px; display: flex; gap: 5px;">
              <button class="btn-gamer btn-gamer-ghost toggle-status" data-id="${u.id}" data-status="${u.status === 'banido' ? 'ativo' : 'banido'}" style="padding: 4px 8px; font-size: 0.75rem;">
                ${u.status === 'banido' ? 'Desbanir' : 'Banir'}
              </button>
            </td>
          `;
          DOM.adminTableBody.appendChild(tr);
        });

        document.querySelectorAll('.toggle-status').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const userId = e.target.getAttribute('data-id');
            const newStatus = e.target.getAttribute('data-status');
            await fetchAutenticado('/api/admin/usuarios/status', {
              method: 'POST',
              body: JSON.stringify({ usuarioId: userId, status: newStatus })
            });
            carregarAdminUsers(); // Atualiza a tabela
          });
        });
      }
    } catch (e) { console.error('Erro ao buscar usuários', e); }
  }

  if (DOM.btnAdminPanel) DOM.btnAdminPanel.addEventListener('click', () => {
    carregarAdminUsers();
    abrirModal(DOM.adminModal);
  });
  if (DOM.btnFecharAdmin) DOM.btnFecharAdmin.addEventListener('click', () => fecharModal(DOM.adminModal));
  if (DOM.adminModal) DOM.adminModal.addEventListener('click', (e) => {
    if (e.target === DOM.adminModal) fecharModal(DOM.adminModal);
  });

  if (DOM.adminTokensForm) DOM.adminTokensForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = DOM.adminTokensForm.querySelector('button');
    setCarregando(btn, true, 'Adicionando...');
    try {
      const res = await fetchAutenticado('/api/admin/usuarios/tokens', {
        method: 'POST',
        body: JSON.stringify({
          usuarioId: DOM.adminUserId.value,
          quantidade: DOM.adminTokenAmount.value
        })
      });
      const data = await res.json();
      if (res.ok) {
        mostrarFeedback(DOM.adminFeedback, data.dados.mensagem, true);
        DOM.adminTokensForm.reset();
        carregarAdminUsers();
      } else {
        mostrarFeedback(DOM.adminFeedback, data.erro || 'Erro', false);
      }
    } catch (err) {
      mostrarFeedback(DOM.adminFeedback, 'Erro de conexão', false);
    } finally {
      setCarregando(btn, false, 'Adicionar');
    }
  });
  async function inicializar() {
    atualizarNavbar();
    await restaurarSessao();
    await carregarPlanos();
  }

  inicializar();

});
