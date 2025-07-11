import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata("nav");
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : "/nav";
  const fragment = await loadFragment(navPath);
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  // decorate nav DOM
  block.textContent = "";
  const nav = document.createElement("nav");
  nav.id = "nav";
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ["brand", "sections", "tools", "favorites", "login"];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });
  if (!user) {
    const link1 = nav.querySelector(".nav-favorites");
    const lin = link1.querySelector("div>p>a");
    lin.href = "/login";
  }
  const navBrand = nav.querySelector(".nav-brand");
  const brandLink = navBrand.querySelector(".button");
  if (brandLink) {
    brandLink.className = "";
    brandLink.closest(".button-container").className = "";
  }
  const toolsSection = nav.querySelector(".nav-tools .default-content-wrapper");
  if (toolsSection) {
    const pTag = toolsSection.querySelector("p");
    if (pTag) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "nav-search";
      input.placeholder = "Search for easy dinners, fashion, etc.";
      input.id = "search";
      pTag.appendChild(input);
    }
  }
  const navWrapper = document.createElement("div");
  navWrapper.className = "nav-wrapper";

  navWrapper.append(nav);
  block.append(navWrapper);

  // Add logout if user is already logged in
  const loginSection = nav.querySelector(".nav-login");
  if (loginSection) {
    if (user) {
      loginSection.textContent = ""; // Clear existing content
      const logoutBtn = document.createElement("button");
      logoutBtn.textContent = "Logout";
      //  logoutBtn.className = 'logout-button';
      logoutBtn.style.cursor = "pointer";

      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.reload(); // Refresh to reflect logout
      });
      loginSection.appendChild(logoutBtn);
    }
  }

  const searchInput = document.getElementById("search");

  // Remove any existing container first to avoid duplicates
  document.getElementById("search-results")?.remove();

  // Create and insert a new results container
  const resultsContainer = document.createElement("div");
  resultsContainer.id = "search-results";
  resultsContainer.className = "suggestion-popup"; // add class for styling

  const wrapper = searchInput?.closest("p");
  if (wrapper) {
    wrapper.insertAdjacentElement("afterend", resultsContainer);
    console.log("Search results container created.");
  }

  async function showSuggestions() {
    console.log("Fetching suggestions...");
    resultsContainer.innerHTML = ""; // clear previous content

    try {
      const res = await fetch("/query-index.json");
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const json = await res.json();
      const allData = json.data || [];

      // ✅ Filter only items under /search/
      const data = allData
        .filter((item) => item.path && item.path.startsWith("/search/"))
        .slice(0, 10);
      console.log("Filtered data:", data);

      if (data.length === 0) {
        resultsContainer.innerHTML =
          '<p class="no-suggestions">No suggestions available.</p>';
        return;
      }

      // Add heading
      const heading = document.createElement("h3");
      heading.className = "suggestion-heading";
      heading.textContent = "Popular on Pinterest";
      resultsContainer.appendChild(heading);

      // Create suggestion grid wrapper
      const grid = document.createElement("div");
      grid.className = "suggestion-grid";

      // Create and append suggestion cards
      data.forEach((item) => {
        const card = document.createElement("div");
        card.className = "suggestion-card";

        const img = document.createElement("img");
        img.src = item.image || "https://via.placeholder.com/60";
        img.alt = item.title || "Result Image";
        img.className = "suggestion-image";

        const title = document.createElement("div");
        title.textContent = item.title || "Untitled";
        title.className = "suggestion-title";

        card.appendChild(img);
        card.appendChild(title);

        if (item.path) {
          card.addEventListener("click", () => {
            window.location.href = item.path;
          });
        }

        grid.appendChild(card);
      });

      resultsContainer.appendChild(grid);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      resultsContainer.innerHTML =
        '<p class="error">Failed to load suggestions.</p>';
    }
  }

  if (searchInput && resultsContainer) {
    console.log("Suggestion script initialized.");

    // Show suggestions on focus
    const getn = document.querySelector(".nav-tools .default-content-wrapper");
    searchInput.addEventListener("focus", () => {
      if (getn) {
        getn.style.border = "3px solid #8ca9e5";
      }
      resultsContainer.style.display = "block";
      showSuggestions();
    });

    document.addEventListener("click", (e) => {
      const isClickInsideSearch = searchInput.contains(e.target);
      const isClickInsidePopup = resultsContainer.contains(e.target);

      if (!isClickInsideSearch && !isClickInsidePopup) {
        resultsContainer.style.display = "none";
      }
    });
  }
}
