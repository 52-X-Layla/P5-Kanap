
const API_BASE = "http://localhost:3000/api/products";

// Récupère l'id du produit en utilisant l'URLSearchParams
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// Selection des elements du dom
const imgWrap   = document.querySelector(".item__img");
const titleEl   = document.getElementById("title");
const priceEl   = document.getElementById("price");
const descEl    = document.getElementById("description");
const colorsSel = document.getElementById("colors");
const qtyInput  = document.getElementById("quantity");
const addBtn    = document.getElementById("addToCart");

//charger les infos du produit et remplir la page
async function loadProduct() {
  try {
    // Récupérer le produit par son id
    const res = await fetch(`${API_BASE}/${productId}`);
    const p   = await res.json();

    // Image
    if (imgWrap) {
      imgWrap.innerHTML = ""; // nettoie
      const img = document.createElement("img");
      img.src = p.imageUrl;
      img.alt = p.altTxt || p.name;
      imgWrap.appendChild(img);
    }

    // Titre, Prix, Description
    if (titleEl) titleEl.textContent = p.name;
    if (priceEl) priceEl.textContent = p.price;
    if (descEl)  descEl.textContent  = p.description;

    // Couleurs (select)
    if (colorsSel && Array.isArray(p.colors)) {
      colorsSel.innerHTML = '<option value="">-- Choisissez une couleur --</option>';
      p.colors.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        colorsSel.appendChild(opt);
      });
    }

  } catch (err) {
    console.error("Impossible de charger le produit :", err);
    alert("Erreur de chargement du produit.");
  }
}

// gérer le panier dans le local storage
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Ajouter (ou cumuler) un produit au panier
function addToCart(item) {
  const cart = getCart();
  const found = cart.find(x => x.id === item.id && x.color === item.color);
  if (found) {
    found.qty += item.qty;        // cumule la quantité
  } else {
    cart.push(item);              // ajoute une nouvelle ligne
  }
  saveCart(cart);
}

// Gérer la validation des choix 
function isValidSelection(color, qty) {
  if (!color) { alert("Veuillez choisir une couleur."); return false; }
  if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
    alert("Veuillez choisir une quantité entre 1 et 100.");
    return false;
  }
  return true;
}

// gestion du clic sur le bouton ajouter au panier
if (addBtn) {
  addBtn.addEventListener("click", () => {
    const color = colorsSel ? colorsSel.value : "";
    const qty   = parseInt(qtyInput ? qtyInput.value : "0", 10);

    if (!isValidSelection(color, qty)) return;

    addToCart({ id: productId, color, qty });
    alert("Produit ajouté au panier !");
    // Option : rediriger vers le panier
    // window.location.href = "./cart.html";
  });
}


loadProduct();
