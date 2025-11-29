// API de base (pour récupérer les prix via l'id)
const API = "http://localhost:3000/api/products";

// Récupère le panier
function getCart() {
  try { return JSON.parse(localStorage.getItem("cart") || "[]"); }
  catch { return []; }
}

// Rendu d'un item dans le DOM
function renderItem(container, p, apiData) {
  const article = document.createElement("article");
  article.className = "cart__item";
  article.dataset.id = p.id;
  article.dataset.color = p.color;

  article.innerHTML = `
    <div class="cart__item__img">
      <img src="${apiData.imageUrl}" alt="${apiData.altTxt || apiData.name}">
    </div>
    <div class="cart__item__content">
      <div class="cart__item__content__titlePrice">
        <h2>${apiData.name} — ${p.color}</h2>
        <p class="itemPrice">${apiData.price} €</p>
      </div>
      <div class="cart__item__content__settings">
        <div class="cart__item__content__settings__quantity">
          <p>Qté : </p>
          <input type="number" class="itemQuantity" min="1" max="100" value="${p.qty}">
        </div>
        <div class="cart__item__content__settings__delete">
          <p class="deleteItem">Supprimer</p>
        </div>
      </div>
    </div>
  `;

  container.appendChild(article);
}

// Mettre à jour les totaux (quantité + prix)
function updateTotals() {
  const qtyEls = document.querySelectorAll(".itemQuantity");
  let totalQty = 0, totalPrice = 0;

  qtyEls.forEach(q => {
    const article = q.closest(".cart__item");
    const price = Number(article.querySelector(".itemPrice").textContent.replace(" €", ""));
    const qty = Number(q.value);
    totalQty += qty;
    totalPrice += price * qty;
  });

  document.getElementById("totalQuantity").textContent = totalQty;
  document.getElementById("totalPrice").textContent = totalPrice;
}

// changer (quantité / supprimer)
function bindItemEvents(articleEl) {
  // quantité
  articleEl.querySelector(".itemQuantity").addEventListener("change", (e) => {
    const qty = Math.max(1, Math.min(100, Number(e.target.value)));
    e.target.value = qty;

    const id = articleEl.dataset.id;
    const color = articleEl.dataset.color;
    const cart = getCart();
    const item = cart.find(i => i.id === id && i.color === color);
    if (item) {
      item.qty = qty;
      localStorage.setItem("cart", JSON.stringify(cart));
      updateTotals();
    }
  });

  // suppression 
  articleEl.querySelector(".deleteItem").addEventListener("click", () => {
    const id = articleEl.dataset.id;
    const color = articleEl.dataset.color;
    let cart = getCart();
    cart = cart.filter(i => !(i.id === id && i.color === color));
    localStorage.setItem("cart", JSON.stringify(cart));
    articleEl.remove();
    updateTotals();
  });
}

//main function
async function main() {
  const container = document.getElementById("cart__items");
  if (!container) { console.warn("Pas de #cart__items"); return; }

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = "<p>Votre panier est vide.</p>";
    updateTotals();
    return;
  }

  // Rendre chaque item (on récupère le prix/visuels via l'API)
  for (const p of cart) {
    const res = await fetch(`${API}/${p.id}`);
    const data = await res.json();
    renderItem(container, p, data);
    bindItemEvents(container.lastElementChild);
  }

  updateTotals();

}




// Form validation functions
function isValidName(name) {
  return /^[A-Za-zÀ-ÿ\s'-]{2,}$/.test(name);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidAddress(address) {
  return /^[A-Za-z0-9À-ÿ\s,'-]{5,}$/.test(address);
}

// Handle form submission
function setupOrderForm() {
  const form = document.querySelector(".cart__order__form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form data
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const email = document.getElementById("email").value;

    // Validate form data
    let isValid = true;
    
    if (!isValidName(firstName)) {
      document.getElementById("firstNameErrorMsg").textContent = "Prénom invalide";
      isValid = false;
    } else {
      document.getElementById("firstNameErrorMsg").textContent = "";
    }

    if (!isValidName(lastName)) {
      document.getElementById("lastNameErrorMsg").textContent = "Nom invalide";
      isValid = false;
    } else {
      document.getElementById("lastNameErrorMsg").textContent = "";
    }

    if (!isValidAddress(address)) {
      document.getElementById("addressErrorMsg").textContent = "Adresse invalide";
      isValid = false;
    } else {
      document.getElementById("addressErrorMsg").textContent = "";
    }

    if (!isValidName(city)) {
      document.getElementById("cityErrorMsg").textContent = "Ville invalide";
      isValid = false;
    } else {
      document.getElementById("cityErrorMsg").textContent = "";
    }

    if (!isValidEmail(email)) {
      document.getElementById("emailErrorMsg").textContent = "Email invalide";
      isValid = false;
    } else {
      document.getElementById("emailErrorMsg").textContent = "";
    }

    if (!isValid) return;

    // Get cart products
    const cart = getCart();
    if (cart.length === 0) {
      alert("Votre panier est vide");
      return;
    }

    // Create order object
    const order = {
      contact: {
        firstName,
        lastName,
        address,
        city,
        email
      },
      products: cart.map(item => item.id)
    };

    try {
      // Send order to API
      const response = await fetch(`${API}/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) throw new Error("Erreur lors de la commande");

      const data = await response.json();
      
      // Redirect to confirmation page with order ID
      window.location.href = `confirmation.html?orderId=${data.orderId}`;
    } catch (error) {
        console.error("Erreur lors de la commande:", error);
        alert(error.message || "Une erreur est survenue lors de la commande");
    }
  });
}

main();
setupOrderForm();

