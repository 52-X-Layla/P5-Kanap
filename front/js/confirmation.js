// confirmation.js 
const id = new URLSearchParams(location.search).get("orderId");
const out = document.getElementById("orderId");
if (id && out) {
  out.textContent = id;
  localStorage.removeItem("cart"); // vider le panier seulement après une commande
}
