/**
 * Ruma's Cake Arcade & Academy - Frontend Interactivity Script
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initHeroSlider();
    initProductFilters();
    initLightboxModal();
    initOrderFormHelper();
});

/* ==========================================================================
   Navigation & Mobile Menu
   ========================================================================== */
function initNavigation() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                if (mobileMenu.classList.contains('active')) {
                    icon.className = 'bx bx-x';
                } else {
                    icon.className = 'bx bx-menu';
                }
            }
        });
    }

    // Active link detection based on current page
    const currentPath = window.location.pathname.split('/').pop() || 'project.html';
    const navLinks = document.querySelectorAll('.navbar a, .mobile-menu a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath || (currentPath === '' && linkPath === 'project.html')) {
            link.classList.add('active');
        }
    });

    // Glass header scroll behavior
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
                header.style.background = 'rgba(26, 19, 21, 0.96)';
            } else {
                header.style.boxShadow = 'none';
                header.style.background = 'rgba(26, 19, 21, 0.92)';
            }
        });
    }
}

/* ==========================================================================
   Hero Slider
   ========================================================================== */
function initHeroSlider() {
    const track = document.querySelector('.hero-slider-track');
    if (!track) return;

    const slides = track.querySelectorAll('.hero-slide');
    if (slides.length <= 1) return;

    let currentIndex = 0;
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');

    function updateSlidePosition() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlidePosition();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlidePosition();
    }

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Auto loop slide every 4 seconds
    let slideInterval = setInterval(nextSlide, 4000);

    const sliderBox = document.querySelector('.hero-slider-box');
    if (sliderBox) {
        sliderBox.addEventListener('mouseenter', () => clearInterval(slideInterval));
        sliderBox.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 4000);
        });
    }
}

/* ==========================================================================
   Product Search & Category Filter
   ========================================================================== */
function initProductFilters() {
    const searchInput = document.querySelector('.search-input');
    const filterChips = document.querySelectorAll('.filter-chip');
    const productBoxes = document.querySelectorAll('.product-grid .product-card, .product-container .box');

    if (!productBoxes.length) return;

    function filterProducts() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const activeChip = document.querySelector('.filter-chip.active');
        const category = activeChip ? activeChip.getAttribute('data-category') : 'all';

        productBoxes.forEach(box => {
            const title = box.querySelector('h3')?.textContent.toLowerCase() || '';
            const price = box.querySelector('h4')?.textContent.toLowerCase() || '';
            const boxCategory = box.getAttribute('data-category') || 'all';

            const matchesQuery = title.includes(query) || price.includes(query);
            const matchesCategory = (category === 'all') || (boxCategory === category);

            if (matchesQuery && matchesCategory) {
                box.style.display = '';
            } else {
                box.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            filterProducts();
        });
    });
}

/* ==========================================================================
   Lightbox Modal Preview
   ========================================================================== */
function initLightboxModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" aria-label="Close modal">&times;</button>
            <img class="modal-img" src="" alt="Enlarged Preview">
        </div>
    `;
    document.body.appendChild(modalOverlay);

    const modalImg = modalOverlay.querySelector('.modal-img');
    const closeBtn = modalOverlay.querySelector('.modal-close');

    function openModal(src) {
        if (!src) return;
        modalImg.src = src;
        modalOverlay.classList.add('active');
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Attach click listener to price chart images or gallery items
    const zoomableElements = document.querySelectorAll('.price-chart-img, .gallery-item img, .zoomable');
    zoomableElements.forEach(el => {
        el.addEventListener('click', () => {
            openModal(el.getAttribute('src'));
        });
    });
}

/* ==========================================================================
   Order Form & Quick Buy Helper
   ========================================================================== */
function initOrderFormHelper() {
    // If BUY NOW buttons have data-product attribute or href to contact page, pre-fill order
    const buyNowButtons = document.querySelectorAll('a[href*="contact me.html"]');

    buyNowButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.product-card, .box');
            if (card) {
                const productName = card.querySelector('h3')?.textContent.trim();
                const productPrice = card.querySelector('h4')?.textContent.trim();
                if (productName) {
                    localStorage.setItem('selectedProduct', JSON.stringify({
                        name: productName,
                        price: productPrice || ''
                    }));
                }
            }
        });
    });

    // Pre-fill on Contact/Order Page
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        const itemInput = document.getElementById('orderItem');
        const savedProduct = localStorage.getItem('selectedProduct');

        if (savedProduct && itemInput) {
            try {
                const item = JSON.parse(savedProduct);
                itemInput.value = item.name + (item.price ? ` (${item.price})` : '');
                localStorage.removeItem('selectedProduct'); // clear after prefill
            } catch (e) {
                console.error('Error parsing saved product', e);
            }
        }

        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Thank you! Your order inquiry has been received. We will call you shortly.', 'bxs-check-circle');
            orderForm.reset();
        });
    }
}

/* Toast notification helper */
function showToast(message, icon = 'bxs-info-circle') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class='bx ${icon}' style="font-size: 1.4rem; color: var(--primary-gold);"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
