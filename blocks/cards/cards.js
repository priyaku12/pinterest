// decorate.js
import {
  getUserId,
  getFavorites,
  saveFavorites,
  transformBlockToList,
  createTagScrollerFromParagraph,
  createOverlay,
  addShowMore,
} from "../../scripts/helpers.js";

export async function createHeartIcon(
  picture,
  imgSrc,
  li,
  userId,
  isOnFavoritesPage
) {
  let isFavorited = false;
  const heartIcon = document.createElement("span");
  heartIcon.className = "custom-heart";
  heartIcon.style.cursor = "pointer";
  picture.appendChild(heartIcon);

  const redheart = "/icons/favredheart.svg";
  const whiteheart = "/icons/white-heart.svg";

  async function loadIcon() {
    const iconPath = isFavorited ? redheart : whiteheart;
    try {
      const res = await fetch(iconPath);
      const svg = await res.text();
      heartIcon.innerHTML = svg;
    } catch {
      heartIcon.textContent = isFavorited ? "♥" : "♡";
    }
  }

  function isCardFavorited(imgSr) {
    const favorites = getFavorites(userId);
    return favorites.some((card) => card.image === imgSr);
  }

  await (async () => {
    if (userId) {
      isFavorited = isCardFavorited(imgSrc);
    }
    await loadIcon();

    heartIcon.addEventListener("click", async () => {
      if (!userId) {
        alert("Please login to save into favorites!");
        return;
      }

      const tags = Array.from(li.querySelectorAll(".tag")).map((t) =>
        t.textContent.trim()
      );
      const title = li.querySelector("h4 strong")?.textContent.trim() || "";
      const description =
        li.querySelectorAll("h4")[1]?.textContent.trim() || "";

      const cardData = {
        userId,
        image: imgSrc,
        tags,
        title,
        description,
      };
      let favorites = getFavorites(userId);

      if (!isFavorited) {
        favorites.push(cardData);
        saveFavorites(userId, favorites);
        isFavorited = true;
        await loadIcon();
      } else {
        favorites = favorites.filter((card) => card.image !== imgSrc);
        saveFavorites(userId, favorites);
        isFavorited = false;
        await loadIcon();
        if (isOnFavoritesPage) li.remove();
      }
    });
  })();
}

export default async function decorate(block) {
  if (block.classList.contains("big") || block.classList.contains("category")) {
    transformBlockToList(block);
    if (block.classList.contains("big")) addShowMore("big", 3);
    if (block.classList.contains("category")) addShowMore("category", 5);
  }

  if (block.classList.contains("filter")) {
    transformBlockToList(block);
  }

  if (block.classList.contains("masonry")) {
    const userId = getUserId();
    const isOnFavoritesPage = window.location.pathname.includes("favorites");

    if (block.classList.contains("static")) {
      transformBlockToList(block);

      const ul = block.querySelector("ul");
      block
        .querySelectorAll(".cards.masonry li p")
        .forEach(createTagScrollerFromParagraph);

      const wrappers = ul.querySelectorAll(".cards-card-image");
      wrappers.forEach((imageWrapper) => {
        const li = imageWrapper.closest("li");
        const picture = imageWrapper.querySelector("picture");
        const img = picture?.querySelector("img");
        if (!img) return;

        imageWrapper.style.position = "relative";
        const rawSrc = img.getAttribute("src") || "";
        const basePath = "https://main--pinterest--priyaku12.aem.page";
        const imgSrc = rawSrc.startsWith("http")
          ? rawSrc
          : `${basePath}${rawSrc}`;

        createHeartIcon(picture, imgSrc, li, userId, isOnFavoritesPage);
        createOverlay(picture);
      });
    }

    if (block.classList.contains("dyanmic")) {
      let favUl = block.querySelector("ul");
      if (!favUl) {
        favUl = document.createElement("ul");
        block.appendChild(favUl);
      }

      const favoritesData = getFavorites(userId);

      if (!favoritesData || favoritesData.length === 0) {
        const favo = document.querySelector(".favourite h1");
        if (favo) favo.style.display = "none";
        const head = document.createElement("h2");
        head.textContent = "NO FAVOURITES FOUND";
        head.className = "nofav";
        block.append(head);
      } else {
        for (const card of favoritesData) {
          const li = document.createElement("li");

          const imageDiv = document.createElement("div");
          imageDiv.className = "cards-card-image";
          imageDiv.style.position = "relative";

          const picture = document.createElement("picture");
          const img = document.createElement("img");
          img.src = card.image;
          img.alt = "";
          picture.appendChild(img);

          imageDiv.appendChild(picture);
          createOverlay(picture);

          const bodyDiv = document.createElement("div");
          bodyDiv.className = "cards-card-body";

          const fakeParagraph = document.createElement("p");
          fakeParagraph.textContent = card.tags
            .map((tag) => `[${tag}]`)
            .join(" ");
          bodyDiv.appendChild(fakeParagraph);
          await createTagScrollerFromParagraph(fakeParagraph);
          const titleEl = document.createElement("h4");
          titleEl.innerHTML = `<strong>${card.title}</strong>`;
          const descEl = document.createElement("h4");
          descEl.textContent = card.description;
          bodyDiv.append(titleEl, descEl);

          li.append(imageDiv, bodyDiv);
          favUl.appendChild(li);

          // Add heart icon and click logic (like in createHeartIcon but simpler)
          const heartIcon = document.createElement("span");
          heartIcon.className = "custom-heart";
          heartIcon.style.cursor = "pointer";

          const heartImg = document.createElement("img");
          heartImg.src = "/icons/favredheart.svg";
          heartImg.alt = "Favorite";
          heartImg.width = 24;
          heartImg.height = 24;

          heartIcon.appendChild(heartImg);
          picture.appendChild(heartIcon);

          heartIcon.addEventListener("click", () => {
            let favorites = getFavorites(userId);
            favorites = favorites.filter((c) => c.image !== card.image);
            saveFavorites(userId, favorites);
            li.remove();

            if (favorites.length === 0) {
              const head = document.createElement("h2");
              head.textContent = "NO FAVOURITES FOUND";
              head.className = "nofav";
              block.append(head);
            }
          });
        }
      }
    }
  }
}
