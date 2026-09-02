export function mostrarFeedback(el, mensagem, isSucesso) {
  if (!el) return;
  el.textContent = mensagem;
  el.className = `alert-feedback visible ${isSucesso ? "success" : "error"}`;
}

export function esconderFeedback(el) {
  if (!el) return;
  el.className = "alert-feedback";
  el.textContent = "";
}

export function abrirModal(modal) {
  if (modal) modal.classList.add("visible");
}

export function fecharModal(modal) {
  if (modal) modal.classList.remove("visible");
}

export function setCarregando(btn, isLoading, texto) {
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = texto;
}

export function applyMask(inputElement, type) {
  if (!inputElement) return;
  inputElement.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (type === "cpf") {
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else if (type === "tel") {
      v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
      v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    }
    e.target.value = v;
  });
}

export const formatBRL = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
