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
  // Hover overlay and heart icon logic
  ul.querySelectorAll('.masonry .cards-card-image').forEach((imageWrapper) => {
    // Make sure the wrapper is positioned relative
    imageWrapper.style.position = 'relative';

    // Find the picture element
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

    // Insert overlay *after* the <picture> element
    picture.insertAdjacentElement('afterend', overlay);
  });






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
//  const cardsb=block.closest('.cards');
  if (block.classList.contains('big')) 
  {
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
  if (block.classList.contains('category')) 
  {

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



}