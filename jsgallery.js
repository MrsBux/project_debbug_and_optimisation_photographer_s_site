// ------------------------------------------------Galerie
// // Sélection de l'élément HTML avec la classe "portfolio" et stockage dans la variable 'sectionPortfolio'
const sectionPortfolio = document.querySelector("#portfolio");
const galleryFiltres = sectionPortfolio.querySelector(".galleryG");
const gallery = document.querySelector(".gallery");

const buttonFilters = document.createElement("div");
galleryFiltres.appendChild(buttonFilters);

// Tableau des noms de filtres
const buttonFiltersName = [
  "Tous",
  "Concert",
  "Mariage",
  "Entreprises",
  "Portrait",
];

// Ajout des boutons de filtre en utilisant les noms du tableau
buttonFiltersName.forEach(function (name) {
  const filterButton = document.createElement("button");
  filterButton.textContent = name;
  filterButton.classList.add("btn");
  filterButton.id = name + "Btn";
  buttonFilters.appendChild(filterButton);
});

// Sélection images de la galerie
const images = document.querySelectorAll(".gallery-item");

// Fonction pour filtrer les images par tag
function filtrerImages(tag) {
  images.forEach(function (img) {
    const imgTag = img.getAttribute("data-tag");
    if (imgTag === tag || tag === "Tous") {
      img.style.display = "block"; // Affiche l'image
    } else {
      img.style.display = "none"; // Cache l'image
    }
  });
}
const allBtn = document.querySelectorAll("button");

function resetFilterButtons() {
  allBtn.forEach((button) => {
    button.style.backgroundColor = "";
  });
}

// Boucle pour ajouter un event listener à chaque bouton
buttonFiltersName.forEach(function (name) {
  const filterButton = document.getElementById(name + "Btn");

  filterButton.addEventListener("click", function () {
    resetFilterButtons(); // Réinitialise tous les boutons de filtre
    filtrerImages(name); // Appelle la fonction de filtrage avec le tag correspondant
    filterButton.style = "background-color: #BEB45A ";
  });
});

const modal1 = document.createElement("aside");
modal1.classList.add("modal1");
modal1.role = "dialog";
modal1.setAttribute(
  "style",
  " position: fixed; top: 0px; left: 0px; height: 100%; width: 100%; background: rgba(0, 0, 0, 0.3); border-radius: 10px; display: flex; justify-content: space-around; align-items: center;"
);
modal1.style.display = "none";
gallery.appendChild(modal1);

const modalWrapper = document.createElement("div");
modalWrapper.classList.add("modalWrapper");
modalWrapper.setAttribute(
  "style",
  "margin: auto; margin-top: 150px; display: flex; flex-direction: column; align-items: center; gap: 20px; color: black; padding: 0px; border:none; background-color: white; height: 731px; width: 630px;overflow: auto; border-radius: 10px;"
);
modal1.appendChild(modalWrapper);

const pictures = document.getElementsByClassName("gallery-item");

// Utilisation d'une boucle pour ajouter un événement de clic à chaque élément
for (let i = 0; i < pictures.length; i++) {
  pictures[i].addEventListener("click", function () {
    modal1.style.display = "block";
    let srcImg = pictures[i].src;
    // Efface le contenu précédent du modalWrapper
    modalWrapper.innerHTML = "";
    const photo = document.createElement("img");
    photo.src = srcImg;
    modalWrapper.appendChild(photo);
  });
}

// event listener pour clic hors modale/fermeture
document.addEventListener("click", (event) => {
  // condition if :  si le clic est en dehors de la modalWrapper modal 1, hors bouton d'ouverture de la modale 1 et si la modale 2 n'est pas visible
  if (modal1.contains(event.target) && event.target !== modalWrapper) {
    // instructions post if pour fermer la modale 1
    modal1.style.display = "none";
  }
});
