document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------
    // 1. Lazy Loading for Performance
    // ------------------------------------
    const lazyLoad = (target) => {
        const io = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // Assuming images are already placeholders or using data-src
                    const src = img.dataset.src || img.src; 
                    
                    // Simple example: replace background of placeholder divs
                    if (img.classList.contains('placeholder-image') && img.dataset.bg) {
                        img.style.backgroundImage = `url(${img.dataset.bg})`;
                        img.style.backgroundColor = 'transparent';
                    }
                    
                    // If it's a standard image tag
                    if (img.tagName === 'IMG' && img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    
                    observer.unobserve(img);
                }
            });
        });

        target.forEach(img => {
            io.observe(img);
        });
    };

    // Lazy load images/placeholders on all pages
    const placeholderImages = document.querySelectorAll('.placeholder-image');
    const contentImages = document.querySelectorAll('img[loading="lazy"]');
    lazyLoad([...placeholderImages, ...contentImages]);

    // Copyright Year Update
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        const currentYear = new Date().getFullYear();
        yearSpan.textContent = currentYear;
    };


    // ------------------------------------
    // 2. Home Page: Skills Ticker Duplication
    // ------------------------------------
    const skillsTicker = document.getElementById('skills-ticker');
    if (skillsTicker) {
        // Clone and append the skills to ensure continuous scrolling
        const skillsContent = skillsTicker.innerHTML;
        skillsTicker.innerHTML += skillsContent;
    }

    // ------------------------------------
    // 3. Project Page: Gallery Scroll Navigation (Horizontal Scroll)
    // ------------------------------------
    const galleryContainers = document.querySelectorAll('.gallery-container');
    galleryContainers.forEach(container => {
        const gallery = container.querySelector('.scrollable-gallery');
        // Note: I'm leaving your original prev/next selectors for this section
        const prevBtn = container.querySelector('.prev-nav');
        const nextBtn = container.querySelector('.next-nav');

        if (gallery && prevBtn && nextBtn) {
            const scrollDistance = gallery.clientWidth / 2; // Scroll half the container width

            prevBtn.addEventListener('click', () => {
                gallery.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
            });

            nextBtn.addEventListener('click', () => {
                gallery.scrollBy({ left: scrollDistance, behavior: 'smooth' });
            });
        }
    });

// ------------------------------------
    // 4. Project Page: Modal Gallery (Scoped to specific gallery)
    // ------------------------------------
    
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const captionText = document.getElementById("caption");
    const closeBtn = document.querySelector(".modal .close-btn");
    const modalCounter = document.getElementById("modalCounter");
    const modalCaption = document.getElementById("modalCaption");
    const modalTitle = document.getElementById("modalTitle");



    const prevModalBtn = document.querySelector("#imageModal .prev-btn");
    const nextModalBtn = document.querySelector("#imageModal .next-btn");

    let currentImageIndex = 0; 
    let currentGalleryImages = []; // This will store only the images from the active gallery

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('user-is-tabbing');
        }
    }); 
    
    // Function to display an image based on its index within the ACTIVE gallery
    const showSlide = (n) => {
        const totalInGallery = currentGalleryImages.length;
        
        if (totalInGallery > 1) {
            // Navigation Logic
            if (n >= totalInGallery) currentImageIndex = 0;
            else if (n < 0) currentImageIndex = totalInGallery - 1;
            else currentImageIndex = n;

            // Show navigation and counter
            if (modalCounter) {
                modalCounter.textContent = `${currentImageIndex + 1} of ${totalInGallery}`;
                modalCounter.style.display = "block"; // Changed from flex to block
            }
            prevModalBtn.style.display = "flex";
            nextModalBtn.style.display = "flex";
        } else {
            // Hide navigation for Static Images
            currentImageIndex = 0;
            if (modalCounter) {
                modalCounter.style.display = "none";
            }
            prevModalBtn.style.display = "none";
            nextModalBtn.style.display = "none";
        }

        const activeItem = currentGalleryImages[currentImageIndex];
        const imgElement = activeItem.tagName === 'IMG' ? activeItem : activeItem.querySelector('img');
        const src = imgElement.dataset.src || imgElement.src;

        modalImage.src = src;
        modalImage.alt = imgElement.alt;
        
        // Set caption text
        if (modalCaption) {
            modalCaption.textContent = imgElement.alt || "";
            // Optional: Hide the whole footer if there is no caption AND no counter
            const footer = document.querySelector('.modal-footer');
            footer.style.display = (imgElement.alt || totalInGallery > 1) ? "flex" : "none";
        }
    };

    const setAriaHidden = (isHidden) => {
    // Target all top-level containers that are NOT the modal
    const backgroundElements = document.querySelectorAll('header, main, footer');
    
    backgroundElements.forEach(el => {
        if (isHidden) {
            el.setAttribute('aria-hidden', 'true');
        } else {
            el.removeAttribute('aria-hidden');
        }
    });
    };

    const openModal = (index, scopedImages, titleText) => {
        currentGalleryImages = scopedImages;
        currentImageIndex = index; // Set the starting index
        setAriaHidden(true);
        document.body.classList.remove('user-is-tabbing');
       
        modal.style.display = "flex";
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; 
        
        if (modalTitle) {
            modalTitle.textContent = titleText || "";
        }
        
        showSlide(index); 

        setTimeout(() => {
            modal.querySelector('.close-btn').focus({ preventScroll: true });
        }, 10);
    };

    const closeModal = () => {
        setAriaHidden(false);

        modal.style.display = "none";
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    // 1. Logic to handle clicks per gallery container
    const allGalleryContainers = document.querySelectorAll('.gallery-container');
    
    allGalleryContainers.forEach(container => {
        // Find images ONLY inside this specific container
        const sectionHeading = container.dataset.galleryTitle || 
                           container.closest('.photo-section')?.querySelector('h3')?.textContent || 
                           "";
        const imagesInThisGallery = Array.from(container.querySelectorAll(".gallery-item-wrapper"));
        
        imagesInThisGallery.forEach((wrapper, index) => {
            wrapper.addEventListener('click', function() {
                // Pass the index relative to THIS gallery and the list of images in THIS gallery
                openModal(index, imagesInThisGallery, sectionHeading);
            });
        });
    });

    // Logic for static (non-gallery) images
    const staticImages = document.querySelectorAll('.clickable-static');
    staticImages.forEach((img) => {
        img.addEventListener('click', function() {
            // Pass the single image as an array of one, and no specific title
            openModal(0, [img], "");
        });
        
        // Optional: Allow opening with 'Enter' key for accessibility
        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') img.click();
        });
    });


    // 2. Click listeners for modal navigation
    if (prevModalBtn && nextModalBtn) {
        prevModalBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showSlide(currentImageIndex - 1);
        });

        nextModalBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showSlide(currentImageIndex + 1);
        });
    }

    // Allow "Enter" key to trigger modal buttons when focused
    [closeBtn, prevModalBtn, nextModalBtn].forEach(btn => {
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    let touchstartX = 0;
    let touchendX = 0;

    const handleGesture = () => {
        const threshold = 50; // Minimum distance in pixels for a swipe
        if (touchendX < touchstartX - threshold) {
            // Swiped Left -> Next Image
            showSlide(currentImageIndex + 1);
        }
        if (touchendX > touchstartX + threshold) {
            // Swiped Right -> Previous Image
            showSlide(currentImageIndex - 1);
        }
    }

    modal.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    }, {passive: true});

    modal.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        handleGesture();
    }, {passive: true});

    // 3. Close listeners
    closeBtn.onclick = closeModal;
    modal.onclick = (event) => { if (event.target === modal) closeModal(); }

// 4. Keyboard navigation & Focus Trap (Optimized for Static & Gallery)
    document.addEventListener('keydown', (event) => {
        if (modal.style.display === 'flex') {
            // Find ALL potential focusable elements
            const allPotential = Array.from(modal.querySelectorAll('.close-btn, .prev-btn, .next-btn'));
            
            // FILTER: Only include elements currently visible (not display: none)
            const focusableElements = allPotential.filter(el => {
                return window.getComputedStyle(el).display !== 'none';
            });

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            // 1. Handle Escape Key
            if (event.key === 'Escape') {
                closeModal();
            } 
            // 2. Handle Arrow Keys (Only if arrows are visible)
            else if (event.key === 'ArrowRight' && focusableElements.length > 1) {
                showSlide(currentImageIndex + 1);
            } else if (event.key === 'ArrowLeft' && focusableElements.length > 1) {
                showSlide(currentImageIndex - 1);
            }
            // 3. Focus Trap (Tab Key)
            else if (event.key === 'Tab') {
                if (event.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus(); 
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus(); 
                    }
                }
            }
        }
    });

});