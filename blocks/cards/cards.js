import { createOptimizedPicture } from '../../scripts/aem.js';
const config = await fetch('/config.json').then((res) => res.json());

function addShowMore(containerClassName, visibleCount) {
  const container = document.querySelector(`.${containerClassName}`);
  if (!container) return;
  const ul = container.querySelector('ul');
  if (!ul) return;
  const liItems = Array.from(ul.querySelectorAll('li'));
  if (liItems.length <= visibleCount) return;
  // Hide items beyond visibleCount
  liItems.forEach((li, index) => {
    if (index >= visibleCount) {
      li.style.display = 'none';
      li.classList.add('hidden-card');
    }
  });
  // Create and append "See More" button
  const showMoreBtn = document.createElement('button');
  showMoreBtn.className = 'show-more-button';
  showMoreBtn.textContent = 'See More';
  container.append(showMoreBtn);
  showMoreBtn.addEventListener('click', () => {
    const hiddenCards = ul.querySelectorAll('.hidden-card');
    hiddenCards.forEach((card) => {
      card.style.display = '';
      card.classList.remove('hidden-card');
    });
    showMoreBtn.remove();
  });
}
function transformBlockToList(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });
    ul.append(li);
  });
  // Optimize pictures
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
    );
  });
  // Clear and append new list
  block.textContent = '';
  block.append(ul);
}
async function createTagScrollerFromParagraph(p) {
  const tagRegex = /\[([^\]]+)\]/g;
  const rawText = p.textContent;
  const wrapper = document.createElement('div');
  wrapper.classList.add('tag-scroll-container');
  const scroller = document.createElement('div');
  scroller.classList.add('tag-scroller');
  let match = tagRegex.exec(rawText);
  while (match) {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = match[1]; // match[1] is the text inside []
    scroller.appendChild(span);
    match = tagRegex.exec(rawText);
  }
  const leftArrow = document.createElement('button');
  leftArrow.className = 'scroll-arrow scroll-left';
  leftArrow.setAttribute('aria-label', 'Scroll Left');
  const rightArrow = document.createElement('button');
  rightArrow.className = 'scroll-arrow scroll-right';
  rightArrow.setAttribute('aria-label', 'Scroll Right');
  async function loadSVG(button, iconPath) {
    try {
      const res = await fetch(iconPath);
      const svgText = await res.text();
      button.innerHTML = svgText;
    } catch {
      button.textContent = iconPath.includes('left') ? '←' : '→';
    }
  }
  await loadSVG(leftArrow, '/icons/left-arrow.svg');
  await loadSVG(rightArrow, '/icons/right-arrow.svg');
  leftArrow.addEventListener('click', () => {
    scroller.scrollBy({ left: -100, behavior: 'smooth' });
  });
  rightArrow.addEventListener('click', () => {
    scroller.scrollBy({ left: 100, behavior: 'smooth' });
  });
  wrapper.append(leftArrow, scroller, rightArrow);
  p.replaceWith(wrapper);
}
function createOverlay(picture) {
  const overlay = document.createElement('div');
  overlay.className = 'custom-overlay';
  const openText = document.createElement('span');
  openText.className = 'custom-open-text';
  openText.textContent = 'Open';
  overlay.appendChild(openText);
  picture.insertAdjacentElement('afterend', overlay);
}
async function createHeartIcon(picture, imgSrc, li, userId, config, isOnFavoritesPage) {
  let isFavorited = false;
  const heartIcon = document.createElement('span');
  heartIcon.className = 'custom-heart';
  heartIcon.style.cursor = 'pointer';
  picture.appendChild(heartIcon);
  const redheart = '/icons/favredheart.svg';
  const whiteheart = '/icons/white-heart.svg';

  async function loadIcon() {
    const iconPath = isFavorited ? redheart : whiteheart;
    try {
      const res = await fetch(iconPath);
      const svg = await res.text();
      heartIcon.innerHTML = svg;
    } catch {
      heartIcon.textContent = isFavorited ? '♥' : '♡';
    }
  }

  try {
    const res = await fetch(`${config.backendUrl}/isFavCard?userId=${userId}&image=${encodeURIComponent(imgSrc)}`);
    const data = await res.json();
    isFavorited = data?.favorited === true;
  } catch {}

  await loadIcon();

  heartIcon.addEventListener('click', () => {
    if (!userId) {
      alert('Please login to save into favorites!');
      return;
    }

    const tags = Array.from(li.querySelectorAll('.tag')).map(tag => tag.textContent.trim());
    const title = li.querySelector('h4 strong')?.textContent.trim() || '';
    const description = li.querySelectorAll('h4')[1]?.textContent.trim() || '';

    const cardData = { userId, image: imgSrc, tags, title, description };

    if (!isFavorited) {
      fetch(`${config.backendUrl}/authFavCard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData),
      }).then(res => {
        if (res.ok) {
          isFavorited = true;
          loadIcon();
        } else {
          alert('Failed to save card.');
        }
      }).catch(console.error);
    } else {
      fetch(`${config.backendUrl}/removeFavCard`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, image: imgSrc }),
      }).then(res => {
        if (res.ok) {
          isFavorited = false;
          loadIcon();
          if (isOnFavoritesPage) li.remove();
        } else {
          alert('Failed to remove card.');
        }
      }).catch(console.error);
    }
  });
}

export default function decorate(block) {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;
  // limit show more button big
  if (block.classList.contains('big') || block.classList.contains('category')) {
  transformBlockToList(block);
  if (block.classList.contains('big')) {
    addShowMore('big', 3);
  }
  if (block.classList.contains('category')) {
    addShowMore('category', 5);
  }
}

if (block.classList.contains('filter')) {
  transformBlockToList(block);
}
// masonry loayout
if (block.classList.contains('masonry')) {
  // Transform block and add masonry class
  transformBlockToList(block);
  block.classList.add('masonry');
  const ul = block.querySelector('ul');

  // Create tag scrollers
  block.querySelectorAll('.cards.masonry li p').forEach(p => {
    createTagScrollerFromParagraph(p);
  });

  // Process each image wrapper
  const wrappers = ul.querySelectorAll('.cards-card-image');

  (async () => {
    for (const imageWrapper of wrappers) {
      const li = imageWrapper.closest('li');
      const picture = imageWrapper.querySelector('picture');
      const img = picture?.querySelector('img');
      if (!img) continue;

      imageWrapper.style.position = 'relative';

      const rawSrc = img.getAttribute('src') || '';
      const basePath = 'https://main--pinterest--priyaku12.aem.page';
      const imgSrc = rawSrc.startsWith('http') ? rawSrc : `${basePath}${rawSrc}`;

      await createHeartIcon(
        picture,
        imgSrc,
        li,
        userId,
        config,
        window.location.pathname.includes('favorites'),
      );

      createOverlay(picture);
    }
  })();
}
if (block.classList.contains('dyanmic')) {
 block.classList.add('masonry');
 let favUl = block.querySelector('ul');
  if (!favUl) {
    favUl = document.createElement('ul');
    block.appendChild(favUl);
  }
  fetch(`${config.backendUrl}/authFavCard?userId=${userId}`)
    .then((res) => res.json())
    .then((cardsData) => {
      if (!cardsData || cardsData.length === 0) {
        const favo = document.querySelector('.favourite h1');
        if (favo) favo.style.display = 'none';

        const head = document.createElement('h2');
        head.textContent = 'NO FAVOURITES FOUND';
        head.className = 'nofav';
        block.append(head);
        return;
      }

      cardsData.forEach((card) => {
        const li = document.createElement('li');
        const imageDiv = document.createElement('div');
        imageDiv.className = 'cards-card-image';
        imageDiv.style.position = 'relative';

        const picture = document.createElement('picture');
        const img = document.createElement('img');
        img.src = card.image;
        img.alt = '';
        picture.appendChild(img);
        const heartIcon = document.createElement('span');
        heartIcon.className = 'custom-heart';
        heartIcon.style.cursor = 'pointer';

        const heartImg = document.createElement('img');
        heartImg.src = '/icons/favredheart.svg';
        heartImg.alt = 'Favorite';
        heartImg.width = 24;
        heartImg.height = 24;
        heartIcon.appendChild(heartImg);
        picture.appendChild(heartIcon);
        imageDiv.appendChild(picture);
        createOverlay(picture);

        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'cards-card-body';

        const fakeParagraph = document.createElement('p');
        fakeParagraph.textContent = card.tags.map(tag => `[${tag}]`).join(' ');
        createTagScrollerFromParagraph(fakeParagraph);
        bodyDiv.appendChild(fakeParagraph);

        const titleEl = document.createElement('h4');
        titleEl.innerHTML = `<strong>${card.title}</strong>`;
        const descEl = document.createElement('h4');
        descEl.textContent = card.description;
        bodyDiv.append(titleEl, descEl);

        li.append(imageDiv, bodyDiv);
        favUl.appendChild(li);

        heartIcon.addEventListener('click', () => {
          fetch(`${config.backendUrl}/removeFavCard`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, image: card.image }),
          })
            .then((res) => {
              if (res.ok) {
                li.remove();
              } else {
                alert('Failed to remove card.');
              }
            })
            .catch((err) => {
              console.error('Error removing card:', err);
            });
        });
      });
    })
    .catch((err) => {
      console.error('Error loading favorite cards:', err);
    });
}

}
