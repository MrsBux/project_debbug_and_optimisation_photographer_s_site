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
    button.style.color = "";
  });
}
// Boucle pour ajouter un event listener à chaque bouton
buttonFiltersName.forEach(function (name) {
  const filterButton = document.getElementById(name + "Btn");
  filterButton.addEventListener("click", function () {
    resetFilterButtons(); // Réinitialise tous les boutons de filtre
    filtrerImages(name); // Appelle la fonction de filtrage avec le tag correspondant
    filterButton.style.backgroundColor = "#BEB45A"; // Correction : utilisez "=" pour définir la couleur de fond
    filterButton.style.color = "#ffffff"; // Définir la couleur du texte
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
const modalWrapper = document.createElement("element");
modalWrapper.classList.add("modalWrapper");
modalWrapper.setAttribute(
  "style",
  "display: flex; justify-content: center; align-items: center; margin: auto; margin-top:200px; padding:15px; border:none; background-color: white; height: auto; width: 498px;"
);
modal1.appendChild(modalWrapper);

const mgPrev = document.createElement("button");
mgPrev.innerText = "<";
mgPrev.setAttribute(
  "style",
  "font-family: Inter; font-size: 16px; color: black; position: relative; top: 50%; left: -15px; background: white;"
);
const mgNext = document.createElement("button");
mgNext.innerText = ">";
mgNext.setAttribute(
  "style",
  "font-family: Inter; font-size: 16px; color: black; cursor: pointer;  relative; top: 50%; left: -15px; background: white;"
);
// variable pour suivre l'index de l'image actuellement affichée
let currentImageIndex = 0;

const pictures = document.getElementsByClassName("gallery-item");
// Utilisation d'une boucle pour ajouter un événement de clic à chaque élément
for (let i = 0; i < pictures.length; i++) {
  pictures[i].addEventListener("click", function () {
    modal1.style.display = "block";
    document.body.style.overflow = "hidden";
    let srcImg = pictures[i].src;

    // Met à jour l'index en fonction de l'élément cliqué
    currentImageIndex = i;

    // Efface le contenu précédent du modalWrapper
    modalWrapper.innerHTML = "";

    const photo = document.createElement("img");
    photo.src = srcImg;
    photo.setAttribute("style", "object-fit: cover; width: 466px;");

    modalWrapper.appendChild(mgPrev);
    modalWrapper.appendChild(photo);
    modalWrapper.appendChild(mgNext);
  });
}
// event listener pour clic hors modale/fermeture
document.addEventListener("click", (event) => {
  // condition if :  si le clic est en dehors de la modalWrapper modal 1, hors bouton d'ouverture de la modale 1 et si la modale 2 n'est pas visible
  if (
    modal1.contains(event.target) &&
    event.target !== modalWrapper &&
    event.target !== mgNext &&
    event.target !== mgPrev
  ) {
    // instructions post if pour fermer la modale 1
    modal1.style.display = "none";
    document.body.style.overflow = "";
  }
});

// Ajout d'un événement de clic à l'élément mgNext pour afficher la prochaine image
mgNext.addEventListener("click", function () {
  // Incrémentation l'index de l'image
  currentImageIndex++;
  // Vérification:  si l'index dépasse le nombre total d'images, revenir au début si nécessaire
  if (currentImageIndex >= pictures.length) {
    currentImageIndex = 0;
  }
  // Obtention de la source de l'image suivante
  let srcImg = pictures[currentImageIndex].src;
  // Effacement du contenu précédent du modalWrapper
  modalWrapper.innerHTML = "";

  // Création une nouvelle image et ajout au modalWrapper
  const photo = document.createElement("img");
  photo.src = srcImg;
  modalWrapper.appendChild(mgPrev);
  modalWrapper.appendChild(photo);
  modalWrapper.appendChild(mgNext);
});
//// Ajout d'un événement de clic à l'élément mgPrev pour afficher la prochaine image
mgPrev.addEventListener("click", function () {
  // Incrémentation l'index de l'image
  currentImageIndex--;
  // Vérification:  si l'index dépasse le nombre total d'images, revenir au début si nécessaire
  if (currentImageIndex < 0) {
    currentImageIndex = 8;
  }
  // Obtention de la source de l'image suivante
  let srcImg = pictures[currentImageIndex].src;
  // Effacement du contenu précédent du modalWrapper
  modalWrapper.innerHTML = "";

  // Création une nouvelle image et ajout au modalWrapper
  const photo = document.createElement("img");
  photo.src = srcImg;

  modalWrapper.appendChild(mgPrev);
  modalWrapper.appendChild(photo);
  modalWrapper.appendChild(mgNext);
});
