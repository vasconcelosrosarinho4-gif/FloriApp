export async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Pedido falhou: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
