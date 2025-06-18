import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
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

  //js for show more 

  // Clear and append new list
  block.textContent = '';
  block.append(ul);

  //limit show more button

  if (block.classList.contains('big')) {
    const liItems = Array.from(ul.querySelectorAll('li'));
    const showLimit = 3;

    if (liItems.length <= showLimit) return;

    liItems.forEach((li, index) => {
      if (index >= showLimit) {
        li.style.display = 'none';
        li.classList.add('hidden-card');
      }
    });

    const bigCardBlock = document.querySelector('.big');
    console.log(bigCardBlock);
    const showMoreBtn = document.createElement('button');
    showMoreBtn.className = 'show-more-button';
    showMoreBtn.textContent = 'See More';
    console.log(showMoreBtn);
    bigCardBlock.append(showMoreBtn);

    // Handle click
    showMoreBtn.addEventListener('click', () => {
      const hiddenCards = ul.querySelectorAll('.hidden-card');
      hiddenCards.forEach((card) => {
        card.style.display = '';
        card.classList.remove('hidden-card');
      });
      showMoreBtn.remove(); // Remove button after click
    });
  }

  //category 
  //show more
  if (block.classList.contains('category')) {

    const liItems = Array.from(ul.querySelectorAll('li'));
    const showLimit = 10;

    if (liItems.length <= showLimit) return;
    liItems.forEach((li, index) => {
      if (index >= showLimit) {
        li.style.display = 'none';
        li.classList.add('hidden-card');
      }
    });

    // // Create "Show More" button
    const CategoryBlock = document.querySelector('.category');

    const showMoreBtn = document.createElement('button');
    showMoreBtn.className = 'show-more-button';
    showMoreBtn.textContent = 'See More';
    console.log(showMoreBtn);
    CategoryBlock.append(showMoreBtn);

    showMoreBtn.addEventListener('click', () => {
      const hiddenCards = ul.querySelectorAll('.hidden-card');
      hiddenCards.forEach((card) => {
        card.style.display = '';
        card.classList.remove('hidden-card');
      });
      showMoreBtn.remove(); // Remove button after click
    });

  }


  //masonry layout fav
  ul.querySelectorAll('.masonry .cards-card-image').forEach(async (imageWrapper) => {
    imageWrapper.style.position = 'relative';
    const picture = imageWrapper.querySelector('picture');
    const img = picture?.querySelector('img');
    if (!img) return;

    const rawSrc = img.getAttribute('src') || '';
    const basePath = 'https://main--pinterest--priyaku12.aem.page';
    const imgSrc = rawSrc.startsWith('http') ? rawSrc : `${basePath}${rawSrc}`;

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    // --- Create heart icon (white by default) ---
    const heartIcon = document.createElement('span');
    heartIcon.className = 'custom-heart';
    heartIcon.style.cursor = 'pointer';
    picture.appendChild(heartIcon);

    // --- Determine if image is already a favorite ---
    let isFavorited = false;
    try {
      const favRes = await fetch(`http://localhost:8000/api/isFavCard?userId=${userId}&image=${encodeURIComponent(imgSrc)}`);
      const favData = await favRes.json();
      console.log(favData);
      isFavorited = favData?.favorited === true;
    } catch (err) {
      console.error('Error checking favorite:', err);
    }

    heartIcon.innerHTML = isFavorited ? '❤️' : '🤍';

    // Create overlay with Open button
    const overlay = document.createElement('div');
    overlay.className = 'custom-overlay';
    const openText = document.createElement('span');
    openText.className = 'custom-open-text';
    openText.textContent = 'Open';
    overlay.appendChild(openText);
    picture.insertAdjacentElement('afterend', overlay);

    // --- Click Listener to Add or Remove ---
    heartIcon.addEventListener('click', () => {
      if (!userId) {
        alert("Please login to save into favorites!");
        return;
      }
      const li = imageWrapper.closest('li');
      const tags = Array.from(li.querySelectorAll('.tag')).map(tag => tag.textContent.trim());
      const title = li.querySelector('h4 strong')?.textContent.trim() || '';
      const description = li.querySelectorAll('h4')[1]?.textContent.trim() || '';

      const cardData = {
        userId,
        image: imgSrc,
        tags,
        title,
        description,
      };

      if (!isFavorited) {
        // Add to favorites
        fetch('http://localhost:8000/api/authFavCard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardData),
        }).then((res) => {
          if (res.ok) {
            heartIcon.innerHTML = '❤️';
            isFavorited = true;
          } else {
            alert('Failed to save card.');
          }
        }).catch(err => {
          console.error('Error saving card:', err);
        });
      } else {
        // Remove from favorites
        fetch('http://localhost:8000/api/removeFavCard', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, image: imgSrc }),
        })
          .then((res) => {
            if (res.ok) {
              heartIcon.innerHTML = '🤍';

              // If on favorites page, remove card from UI
              if (window.location.pathname.includes('favorites')) {
                li.remove();
              }
            } else {
              alert('Failed to remove card.');
            }
          })
          .catch(err => {
            console.error('Error removing card:', err);
          });
      }
    });
  });

  //masonry 

  block.querySelectorAll('.cards.masonry li p').forEach((p) => {
    const tagRegex = /\[([^\]]+)\]/g;
    const rawText = p.textContent;


    const wrapper = document.createElement('div');
    wrapper.classList.add('tag-scroll-container');

    const scroller = document.createElement('div');
    scroller.classList.add('tag-scroller');


    let match;
    while ((match = tagRegex.exec(rawText)) !== null) {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = match[1];
      scroller.appendChild(span);
    }


    const leftArrow = document.createElement('button');
    leftArrow.className = 'scroll-arrow scroll-left';
    leftArrow.setAttribute('aria-label', 'Scroll Left');
    leftArrow.innerHTML = `
    <svg aria-label="Scroll Left" viewBox="0 0 24 24" width="12" height="12">
      <path d="M15.3 23.7 3.58 12 15.29.3l1.42 1.4L6.4 12l10.31 10.3z"></path>
    </svg>
  `;


    const rightArrow = document.createElement('button');
    rightArrow.className = 'scroll-arrow scroll-right';
    rightArrow.setAttribute('aria-label', 'Scroll Right');
    rightArrow.innerHTML = `
    <svg aria-label="Scroll Right" viewBox="0 0 24 24" width="12" height="12">
      <path d="M8.7.3 20.42 12 8.71 23.7l-1.42-1.4L17.6 12 7.29 1.7z"></path>
    </svg>
  `;


    wrapper.appendChild(leftArrow);
    wrapper.appendChild(scroller);
    wrapper.appendChild(rightArrow);


    p.replaceWith(wrapper);


    leftArrow.addEventListener('click', () => {
      scroller.scrollBy({ left: -100, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
      scroller.scrollBy({ left: 100, behavior: 'smooth' });
    });
  });





  //favourite 
  const favUl = document.querySelector('.cards.mas.block ul');

  // 👇 Get the logged-in user ID from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;
  console.log("user", userId);

  // Apply masonry class if needed
  if (block.classList.contains("mas")) {
    block.classList.add("masonry");
  }


  fetch(`http://localhost:8000/api/authFavCard?userId=${userId}`)
    .then(res => res.json())
    .then(cardsData => {
      console.log("Fetched Cards:", cardsData);
      if (cardsData.length == 0) {
        const favo = document.querySelector(".favourite h1");
        favo.style.display = 'none';

        const favBlock = document.querySelector(".mas");
        const head = document.createElement("h2");
        head.innerHTML = "NO FAVOURITES FOUND";
        head.className = "nofav";
        favBlock.append(head);
        return;
      }
      cardsData.forEach((card) => {
        const li = document.createElement('li');

        const tagHTML = card.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        li.innerHTML = `
          <div class="cards-card-image" style="position: relative;">
            <picture>
              <img src="${card.image}" alt="">
              <span class="custom-heart">❤️</span>
            </picture>
            <div class="custom-overlay">
              <span class="custom-open-text">Open</span>
            </div>
          </div>
          <div class="cards-card-body">
            <div class="tag-scroll-container">
              <div class="tag-scroller">
                ${tagHTML}
              </div>
            </div>
            <h4><strong>${card.title}</strong></h4>
            <h4>${card.description}</h4>
          </div>
        `;

        // 💔 Add remove-from-favorites click handler
        const heartIcon = li.querySelector('.custom-heart');
        heartIcon.addEventListener('click', () => {
          const confirmRemove = confirm('Remove this card from favorites?');
          if (!confirmRemove) return;

          fetch('http://localhost:8000/api/removeFavCard', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              image: card.image,
            }),
          })
            .then(res => {
              if (res.ok) {
                li.remove(); // remove from DOM
              } else {
                alert('Failed to remove card.');
              }
            })
            .catch(err => {
              console.error('Error removing card:', err);
            });
        });

        favUl.appendChild(li);
      });
    })
    .catch(err => {
      console.error('Error loading favorite cards:', err);
    });
}