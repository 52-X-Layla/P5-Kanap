// le back end qui renvoie la liste des produits
const API_URL = "http://localhost:3000/api/products";
// fonction principale pour demarrer le script
async function main() {
  const items = document.getElementById("items");

  try {
    //Envoyer une requete fetch pour recuperer les produits
    const res = await fetch(API_URL);
    //Transformer la reponse en json
    const products = await res.json();
    //Vider le contenu de la section items
    items.innerHTML = "";
    //Créer les elements html pour chaque produit
   products.forEach((p) => {
      // Lien vers la page produit
      const link = document.createElement("a");
      link.href = `./product.html?id=${p._id}`;
      items.appendChild(link);

      //  Conteneur du produit
      const article = document.createElement("article");
      link.appendChild(article);

      // Image du produit
      const img = document.createElement("img");
      img.src = p.imageUrl;
      img.alt = p.altTxt || p.name;
      article.appendChild(img);

      // Nom du produit
      const title = document.createElement("h3");
      title.classList.add("productName");
      title.textContent = p.name;
      article.appendChild(title);

      // Description du produit
      const desc = document.createElement("p");
      desc.classList.add("productDescription");
      desc.textContent = p.description;
      article.appendChild(desc);
    });
    
    // gestion des erreurs
  } catch (e) {
    console.log("Error:", e);
    // on affiche un message d'erreur dans la page
    items.innerHTML = "<p>Impossible de charger les produits.</p>";
  }
}

main();
