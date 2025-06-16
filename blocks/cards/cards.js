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

  ////masonry 

  block.querySelectorAll('.cards.masonry li p').forEach((p) => {
    const tagRegex = /\[([^\]]+)\]/g;
    const rawText = p.textContent;

    // Create wrapper container
    const wrapper = document.createElement('div');
    wrapper.classList.add('tag-scroll-container');

    // Create tag scroller
    const scroller = document.createElement('div');
    scroller.classList.add('tag-scroller');

    // Extract tags
    let match;
    while ((match = tagRegex.exec(rawText)) !== null) {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = match[1];
      scroller.appendChild(span);
    }

    // Create left arrow with SVG
    const leftArrow = document.createElement('button');
    leftArrow.className = 'scroll-arrow scroll-left';
    leftArrow.setAttribute('aria-label', 'Scroll Left');
    leftArrow.innerHTML = `
    <svg aria-label="Scroll Left" viewBox="0 0 24 24" width="12" height="12">
      <path d="M15.3 23.7 3.58 12 15.29.3l1.42 1.4L6.4 12l10.31 10.3z"></path>
    </svg>
  `;

    // Create right arrow with SVG
    const rightArrow = document.createElement('button');
    rightArrow.className = 'scroll-arrow scroll-right';
    rightArrow.setAttribute('aria-label', 'Scroll Right');
    rightArrow.innerHTML = `
    <svg aria-label="Scroll Right" viewBox="0 0 24 24" width="12" height="12">
      <path d="M8.7.3 20.42 12 8.71 23.7l-1.42-1.4L17.6 12 7.29 1.7z"></path>
    </svg>
  `;

    // Append arrows and scroller into wrapper
    wrapper.appendChild(leftArrow);
    wrapper.appendChild(scroller);
    wrapper.appendChild(rightArrow);

    // Replace original <p> with new tag scroll wrapper
    p.replaceWith(wrapper);

    // Scroll behavior
    leftArrow.addEventListener('click', () => {
      scroller.scrollBy({ left: -100, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
      scroller.scrollBy({ left: 100, behavior: 'smooth' });
    });
  });

  //show more
  
  if (block.classList.contains('big')) {
    // const ul1 = block.querySelector('ul');

    const liItems = Array.from(ul.querySelectorAll('li'));
    const showLimit = 6;

    if (liItems.length <= showLimit) return; // Nothing to hide

    // // Hide items beyond the limit
    liItems.forEach((li, index) => {
      if (index >= showLimit) {
        li.style.display = 'none';
        li.classList.add('hidden-card');
      }
    });

    // // Create "Show More" button
    const bigCardBlock = document.querySelector('.big');
    console.log(bigCardBlock);
    const showMoreBtn = document.createElement('button');
    showMoreBtn.className = 'show-more-button';
    showMoreBtn.textContent = 'See More';
    console.log(showMoreBtn);
    // Insert after the list
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
  //  const cardsb=block.closest('.cards');
  if (block.classList.contains('category')) {

    const liItems = Array.from(ul.querySelectorAll('li'));
    const showLimit = 10;

    if (liItems.length <= showLimit) return; // Nothing to hide

    // // Hide items beyond the limit
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
    // Insert after the list
    CategoryBlock.append(showMoreBtn);


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

  ul.querySelectorAll('.masonry .cards-card-image').forEach((imageWrapper) => {
    // Ensure relative position
    imageWrapper.style.position = 'relative';

    const picture = imageWrapper.querySelector('picture');
    const img = picture?.querySelector('img');

    if (!img) return;

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.className = 'custom-overlay';

    // "Open" text
    const openText = document.createElement('span');
    openText.className = 'custom-open-text';
    openText.textContent = 'Open';

    // Heart icon
    const heartIcon = document.createElement('span');
    heartIcon.className = 'custom-heart';
    heartIcon.innerHTML = '❤️';
    
    // Append both to overlay
    overlay.appendChild(openText);
    overlay.appendChild(heartIcon);

    // Insert overlay after picture
    picture.insertAdjacentElement('afterend', overlay);

    // ⭐ Add heart click listener
    heartIcon.addEventListener('click', () => {
      const li = imageWrapper.closest('li');

      const tags = Array.from(li.querySelectorAll('.tag')).map(tag => tag.textContent.trim());
      const title = li.querySelector('h4 strong')?.textContent.trim() || '';
      const description = li.querySelectorAll('h4')[1]?.textContent.trim() || '';
      console.log("hello");
      // ✅ Get userId from localStorage (or wherever it's stored after login)
      // const userId = localStorage.getItem('user.id');

      const rawSrc = img?.getAttribute('src') || '';
      const basePath = 'https://main--pinterest--priyaku12.aem.page';

      // Prepend full URL if not already absolute
      const imgSrc = rawSrc.startsWith('http') ? rawSrc : `${basePath}${rawSrc}`;


      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id;
      console.log("user", userId);
      if (!userId) {
        alert('Please log in to save cards.');
        return;
      }

      const cardData = {
        userId,        // ✅ send user ID with card
        image: imgSrc,
        tags,
        title,
        description,
      };

      console.log('Saving card:', cardData);
      
      // ✅ Send to correct backend API endpoint
      fetch('http://localhost:8000/api/authFavCard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      })
        .then((res) => {
          if (res.ok) {
            alert('Card saved!');
          } else {
            alert('Failed to save card.');
          }
        })
        .catch((err) => {
          console.error('Error saving card:', err);
        });
    });
  });

  //fav







// fav mas
  const favUl = document.querySelector('.cards.mas.block ul');

  // 👇 Get the logged-in user ID from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;
   console.log("user", userId);
  if (block.classList.contains("mas")) {
  block.classList.add("masonry");
}
  if (!userId) {
    alert('Please log in to view favorites.');
  } else {
    fetch(`http://localhost:8000/api/authFavCard?userId=${userId}`)
      .then(res => res.json())
      .then(cardsData => {
         console.log("Fetched Cards:", cardsData);
        cardsData.forEach((card) => {
          const li = document.createElement('li');
          const tagHTML = card.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

          li.innerHTML = `
          <div class="cards-card-image" style="position: relative;">
            <picture>
              <img src="${card.image}" alt="">
            </picture>
            <div class="custom-overlay">
              <span class="custom-open-text">Open</span>
              <span class="custom-heart">❤️</span>
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
          favUl.appendChild(li);
        });
      })
      .catch(err => {
        console.error('Error loading favorite cards:', err);
      });
  }





}