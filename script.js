// Données initiales d'exemple
const sampleListings = [
  {
    id: 'c1',
    title: 'Toyota Corolla 2018',
    brand: 'Toyota',
    year: 2018,
    price: 9500,
    img: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=abc',
    description: 'Très bon état, 120 000 km, entretien régulier.',
    contact: 'vendeur@example.com'
  },
  {
    id: 'c2',
    title: 'BMW Série 3 2016',
    brand: 'BMW',
    year: 2016,
    price: 14000,
    img: 'https://images.unsplash.com/photo-1542362567-3e0b2f37d4d9?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=def',
    description: 'Berline sportive, excellent historique.',
    contact: 'bmwseller@example.com'
  },
  {
    id: 'c3',
    title: 'Honda Civic 2019',
    brand: 'Honda',
    year: 2019,
    price: 11000,
    img: 'https://images.unsplash.com/photo-1617361782535-8f07b1c6b739?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=ghi',
    description: 'Faible kilométrage, très propre.',
    contact: 'honda@example.com'
  }
];

const STORAGE_KEY = 'carora_listings_v1';
let listings = loadListings();

// --- Render ---
const container = document.getElementById('cardsContainer');
const yearSpan = document.getElementById('year');
yearSpan.textContent = new Date().getFullYear();

function loadListings(){
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved) {
    try { return JSON.parse(saved); } catch(e){ /* ignore */ }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleListings));
  return sampleListings.slice();
}

function saveListings(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}
function removeListings(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

function renderCards(items){
  container.innerHTML = '';
  if(items.length === 0){
    container.innerHTML = '<p class="muted">Aucune annonce trouvée.</p>';
    return;
  }
  items.forEach(item => {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <img src="${item.img || 'https://via.placeholder.com/600x400?text=Car+Image'}" alt="${escapeHtml(item.title)}" />
      <h3>${escapeHtml(item.title)}</h3>
      <div class="meta">${escapeHtml(item.brand)} • ${item.year}</div>
      <div class="price">$${Number(item.price).toLocaleString()}</div>
      <p class="muted">${escapeHtml(truncate(item.description, 120))}</p>
      <div class="actions">
        <button class="btn primary view-btn" data-id="${item.id}">Voir</button>
        <button class="btn outline contact-btn" data-id="${item.id}">Contact vendeur</button>
      </div>
    `;
    container.appendChild(el);
  });
  // bind events
  document.querySelectorAll('.view-btn').forEach(b=>b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id; openModalById(id);
  }));
  document.querySelectorAll('.contact-btn').forEach(b=>b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id; contactSellerById(id);
  }));
}

// --- Filters ---
document.getElementById('applyFilters').addEventListener('click', applyFilters);
document.getElementById('resetBtn').addEventListener('click', ()=>{ 
  document.getElementById('searchInput').value=''; document.getElementById('brandFilter').value=''; document.getElementById('minPrice').value=''; document.getElementById('maxPrice').value=''; renderCards(listings);
});

function applyFilters(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const brand = document.getElementById('brandFilter').value;
  const min = Number(document.getElementById('minPrice').value) || 0;
  const max = Number(document.getElementById('maxPrice').value) || Infinity;

  const filtered = listings.filter(l=>{
    const matchQ = q ? (l.title+ ' '+ l.description + ' '+ l.brand).toLowerCase().includes(q) : true;
    const matchBrand = brand ? l.brand === brand : true;
    const matchPrice = l.price >= min && l.price <= max;
    return matchQ && matchBrand && matchPrice;
  });
  renderCards(filtered);
}

// --- Modal detail ---
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
document.getElementById('closeModal').addEventListener('click', ()=> modal.classList.add('hidden'));

function openModalById(id){
  const item = listings.find(x=>x.id===id);
  if(!item) return;
  modalContent.innerHTML = `
    <img style="width:100%;height:300px;object-fit:cover;border-radius:8px" src="${item.img}" alt="${escapeHtml(item.title)}"/>
    <h2>${escapeHtml(item.title)}</h2>
    <div class="meta">${escapeHtml(item.brand)} • ${item.year}</div>
    <div class="price">$${Number(item.price).toLocaleString()}</div>
    <p>${escapeHtml(item.description)}</p>
    <div style="margin-top:12px;display:flex;gap:8px">
      <button class="btn primary" id="modalContact">Contacter le vendeur</button>
      <button class="btn outline" id="modalClose">Fermer</button>
    </div>
  `;
  document.getElementById('modalContact').addEventListener('click', ()=> contactSellerById(id));
  document.getElementById('modalClose').addEventListener('click', ()=> modal.classList.add('hidden'));
  modal.classList.remove('hidden');
}

function contactSellerById(id){
  const item = listings.find(x=>x.id===id);
  if(!item) return;
  // ouvre Formspree ou mailto
  // Si tu as Formspree, tu peux configurer une URL target
  const mailto = `mailto:${item.contact}?subject=${encodeURIComponent('Intérêt pour votre annonce: '+item.title)}&body=${encodeURIComponent('Bonjour,%0D%0A%0D%0AJe suis intéressé par votre annonce "'+item.title+'".%0D%0A%0D%0AMerci.%0D%0A')}`;
  window.location.href = mailto;
}

// --- Create form (demo only) ---
document.getElementById('createForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const id = 'c' + Date.now();
  const newItem = {
    id,
    title: document.getElementById('title').value || 'Annonce',
    brand: document.getElementById('brand').value || 'Autre',
    year: document.getElementById('year').value || '',
    price: Number(document.getElementById('price').value) || 0,
    img: document.getElementById('image').value || 'https://via.placeholder.com/800x500?text=Car+Image',
    description: document.getElementById('description').value || '',
    contact: document.getElementById('contactSeller').value || 'contact@carora.local'
  };
  listings.unshift(newItem);
  saveListings();
  renderCards(listings);
  alert('Annonce publiée en local ! Pour la rendre publique, push ton repo ou configure un back-end.');
  // Optionnel : envoi à Formspree (si tu veux)
  e.target.reset();
});

// --- utilitaires ---
function truncate(str, n){ return str.length>n ? str.slice(0,n-1)+'…' : str; }
function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

// initial render
renderCards(listings);
