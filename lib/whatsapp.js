import { STORE, SITE_URL } from './config';
import { brl } from './format';

export function waUrl(text) {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function orderMessage(items, origin) {
  const base = origin || SITE_URL;
  const lines = items.map((i) => {
    const det = [i.size && `Tam ${i.size}`, i.color && `Cor ${i.color}`].filter(Boolean).join(', ');
    return `${i.qty}x *${i.name}*${det ? ` (${det})` : ''} - ${brl(i.price * i.qty)}\n${base}${i.path}`;
  });
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  return `Olá! Vim pelo site da *${STORE.name}* e quero finalizar este pedido:\n\n${lines.join(
    '\n\n'
  )}\n\n*Total: ${brl(total)}*\n\nPode me ajudar com pagamento e entrega?`;
}

export function helloMessage() {
  return `Olá! Vim pelo site da ${STORE.name} e gostaria de ajuda.`;
}
