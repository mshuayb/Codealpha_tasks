document.addEventListener('DOMContentLoaded', function() {
    
    // Data Generation (Simulating 12 images per category)
    const categories = ['natural', 'birds', 'river', 'places'];
    let galleryData = [];

    function initData() {
        categories.forEach(cat => {
            for (let i = 1; i <= 12; i++) {
                const seed = `${cat}-${i}`;
                galleryData.push({
                    id: `${cat}-${i}`,
                    src: `https://picsum.photos/seed/${seed}/600/600`,
                    category: cat,
                    title: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Photo ${i}`
                });
            }
        });
    }

    // State Variables
    let currentCategory = 'all';
    let currentSearch = '';
    let currentFilteredImages = [];
    let lightboxIndex = 0;

    // DOM Elements
    const galleryGrid = document.getElementById('gallery-grid');
    const tabs = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('search-input');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    // Add Photo Modal Elements
    const addBtn = document.getElementById('add-btn');
    const addModal = document.getElementById('add-modal');
    const modalClose = document.querySelector('.modal-close');
    const addPhotoForm = document.getElementById('add-photo-form');
    const toast = document.getElementById('toast');

    // Initialize
    initData();
    renderGallery();

    // --- Core Functions ---

    function renderGallery() {
        galleryGrid.innerHTML = '';
        
        // Filter Data
        currentFilteredImages = galleryData.filter(item => {
            const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
            const matchesSearch = item.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                                  item.category.toLowerCase().includes(currentSearch.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        // Render
        if (currentFilteredImages.length === 0) {
            galleryGrid.innerHTML = '<p style="padding: 20px; color: var(--text-muted); text-align:center;">No images found.</p>';
            return;
        }

        currentFilteredImages.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.onclick = () => openLightbox(index);
            
            div.innerHTML = `
                <img src="${item.src}" alt="${item.title}" loading="lazy">
                <div class="gallery-overlay">
                    <span class="view-icon">&#128269;</span>
                </div>
            `;
            galleryGrid.appendChild(div);
        });
    }

    // --- Tab Navigation ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            renderGallery();
        });
    });

    // --- Search Functionality ---
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderGallery();
    });

    // --- Lightbox Functions ---
    function openLightbox(index) {
        lightboxIndex = index;
        updateLightboxContent();
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    function updateLightboxContent() {
        const item = currentFilteredImages[lightboxIndex];
        lightboxImg.src = item.src;
        lightboxCaption.textContent = item.title;
    }

    function nextImage(e) {
        e.stopPropagation();
        lightboxIndex = (lightboxIndex + 1) % currentFilteredImages.length;
        updateLightboxContent();
    }

    function prevImage(e) {
        e.stopPropagation();
        lightboxIndex = (lightboxIndex - 1 + currentFilteredImages.length) % currentFilteredImages.length;
        updateLightboxContent();
    }

    // Lightbox Event Listeners
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('show')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage(e);
        if (e.key === 'ArrowLeft') prevImage(e);
    });

    // --- Add Photo Logic ---
    addBtn.addEventListener('click', () => {
        addModal.style.display = 'flex';
    });

    modalClose.addEventListener('click', () => {
        addModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == addModal) {
            addModal.style.display = "none";
        }
    }

    addPhotoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const url = document.getElementById('img-url').value;
        const category = document.getElementById('img-category').value;
        const title = document.getElementById('img-title').value;

        const newImage = {
            id: Date.now(),
            src: url,
            category: category,
            title: title
        };

        galleryData.unshift(newImage);
        addPhotoForm.reset();
        addModal.style.display = 'none';
        renderGallery();
        showToast("Photo added successfully!");
    });

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

});