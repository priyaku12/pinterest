import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
const user = JSON.parse(localStorage.getItem('user'));
  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools', 'favorites','login'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });
if (!user)
  {
   
   const link1 = nav.querySelector(".nav-favorites");
   const lin=link1.querySelector("div>p>a");
      lin.href ="/login";
  }
  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }
 const toolsSection = nav.querySelector('.nav-tools .default-content-wrapper');
if (toolsSection) {
  const pTag = toolsSection.querySelector('p');
  if (pTag) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'nav-search';
    input.placeholder = 'Search ideas...';
    input.id = 'search';
    pTag.appendChild(input);
  }
}
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  
  navWrapper.append(nav);
  block.append(navWrapper);


    // Add logout if user is already logged in
  const loginSection = nav.querySelector('.nav-login');
  if (loginSection) {
    
    
    if (user) {
      loginSection.textContent = ''; // Clear existing content
      const logoutBtn = document.createElement('button');
      logoutBtn.textContent = 'Logout';
    //  logoutBtn.className = 'logout-button';
      logoutBtn.style.cursor = 'pointer';

      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.reload(); // Refresh to reflect logout
      });
      loginSection.appendChild(logoutBtn);
    } 
  }

}

