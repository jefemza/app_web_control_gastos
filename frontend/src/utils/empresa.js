const STORAGE_KEY = 'empresaActiva';

export const EMPRESAS = ['ESM', 'BROD'];

export const getEmpresaActiva = () => {
  if (typeof window === 'undefined') return 'ESM';
  const v = localStorage.getItem(STORAGE_KEY);
  return v && EMPRESAS.includes(v) ? v : 'ESM';
};

export const setEmpresaActiva = (empresa) => {
  if (typeof window === 'undefined') return;
  const value = EMPRESAS.includes(empresa) ? empresa : 'ESM';
  localStorage.setItem(STORAGE_KEY, value);
  // Notificar a la app
  window.dispatchEvent(new CustomEvent('empresaChanged', { detail: { empresa: value } }));
};


