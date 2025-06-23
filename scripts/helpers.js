// helpers.js
import { createOptimizedPicture } from "./aem.js";

export function getRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.random() * 10; // 70-80%
  const lightness = 80 + Math.random() * 10; // 80-90%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getUserId() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  return user?.username || null;
}

export function getFavorites(userId) {
  if (!userId) return [];
  const allFavs = JSON.parse(localStorage.getItem("favorites") || "{}");
  return allFavs[userId] || [];
}

export function saveFavorites(userId, favorites) {
  if (!userId) return;
  const allFavs = JSON.parse(localStorage.getItem("favorites") || "{}");
  allFavs[userId] = favorites;
  localStorage.setItem("favorites", JSON.stringify(allFavs));
}

export function transformBlockToList(block) {
  const ul = document.createElement("ul");
  [...block.children].forEach((row) => {
    const li = document.createElement("li");
    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }
    if (block.classList.contains("filter")) {
      li.style.backgroundColor = getRandomColor();
    }
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector("picture")) {
        div.className = "cards-card-image";
      } else {
        div.className = "cards-card-body";
      }
    });
    ul.append(li);
  });
  // Optimize pictures
  ul.querySelectorAll("picture > img").forEach((img) => {
    img
      .closest("picture")
      .replaceWith(
        createOptimizedPicture(img.src, img.alt, false, [{ width: "750" }])
      );
  });
  block.textContent = "";
  block.append(ul);
}

export async function createTagScrollerFromParagraph(p) {
  const tagRegex = /\[([^\]]+)\]/g;
  const rawText = p.textContent;
  const wrapper = document.createElement("div");
  wrapper.classList.add("tag-scroll-container");
  const scroller = document.createElement("div");
  scroller.classList.add("tag-scroller");

  let match = tagRegex.exec(rawText);
  while (match) {
    const span = document.createElement("span");
    span.className = "tag";
    const [, capturedText] = match;
    span.textContent = capturedText;
    scroller.appendChild(span);
    match = tagRegex.exec(rawText);
  }

  const leftArrow = document.createElement("button");
  leftArrow.className = "scroll-arrow scroll-left";
  leftArrow.setAttribute("aria-label", "Scroll Left");

  const rightArrow = document.createElement("button");
  rightArrow.className = "scroll-arrow scroll-right";
  rightArrow.setAttribute("aria-label", "Scroll Right");

  async function loadSVG(button, iconPath) {
    try {
      const res = await fetch(iconPath);
      const svgText = await res.text();
      button.innerHTML = svgText;
    } catch {
      button.textContent = iconPath.includes("left") ? "←" : "→";
    }
  }

  await loadSVG(leftArrow, "/icons/left-arrow.svg");
  await loadSVG(rightArrow, "/icons/right-arrow.svg");

  leftArrow.addEventListener("click", () => {
    scroller.scrollBy({ left: -100, behavior: "smooth" });
  });
  rightArrow.addEventListener("click", () => {
    scroller.scrollBy({ left: 100, behavior: "smooth" });
  });

  wrapper.append(leftArrow, scroller, rightArrow);
  p.replaceWith(wrapper);
}

export function createOverlay(picture) {
  const overlay = document.createElement("div");
  overlay.className = "custom-overlay";
  const openText = document.createElement("span");
  openText.className = "custom-open-text";
  openText.textContent = "Open";
  overlay.appendChild(openText);
  picture.insertAdjacentElement("afterend", overlay);
}

export function addShowMore(containerClassName, visibleCount) {
  const container = document.querySelector(`.${containerClassName}`);
  if (!container) return;

  const ul = container.querySelector("ul");
  if (!ul) return;

  const allCards = Array.from(ul.querySelectorAll("li"));
  ul.innerHTML = "";

  let currentIndex = 0;
  const showMoreBtn = document.createElement("button");
  showMoreBtn.className = "show-more-button";
  showMoreBtn.textContent = "Show More";

  function renderNextBatch() {
    const end = Math.min(currentIndex + visibleCount, allCards.length);
    for (let i = currentIndex; i < end; i += 1) {
      ul.appendChild(allCards[i]);
    }
    currentIndex = end;
    if (currentIndex >= allCards.length) {
      showMoreBtn.remove();
    }
  }

  renderNextBatch();
  container.appendChild(showMoreBtn);
  showMoreBtn.addEventListener("click", renderNextBatch);
}
