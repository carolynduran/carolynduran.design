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
    // 4. Project Page: Modal Gallery (Click to Expand)
    // ------------------------------------
    
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const captionText = document.getElementById("caption");
    const closeBtn = document.querySelector(".modal .close-btn"); // Use specific selector

    // Get all the clickable image wrappers
    const galleryItemWrappers = document.querySelectorAll(".scrollable-gallery .gallery-item-wrapper");
    const totalImages = galleryItemWrappers.length;

    // Navigation buttons inside the modal
    const prevModalBtn = document.querySelector("#imageModal .prev-btn");
    const nextModalBtn = document.querySelector("#imageModal .next-btn");

    let currentImageIndex = 0; 

    // Function to display an image based on its index
    const showSlide = (n) => {
        // Wrap around logic: ensure index stays within bounds
        if (n >= totalImages) {
            currentImageIndex = 0;
        } else if (n < 0) {
            currentImageIndex = totalImages - 1;
        } else {
            currentImageIndex = n;
        }

        const imgElement = galleryItemWrappers[currentImageIndex].querySelector('img');
        
        // Use the original image source for the modal (important if using lazy loading data-src)
        const src = imgElement.dataset.src || imgElement.src;

        modalImage.src = src;
        modalImage.alt = imgElement.alt;
        captionText.innerHTML = imgElement.alt;
    }

    // Function to open the modal
    const openModal = (index) => {
        modal.style.display = "block";
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        showSlide(index); 
    }

    // Function to close the modal
    const closeModal = () => {
        modal.style.display = "none";
        document.body.style.overflow = ''; // Restore background scrolling
    }

    // 1. Attach click listener to every gallery image wrapper
    galleryItemWrappers.forEach((wrapper, index) => {
        wrapper.addEventListener('click', function() {
            openModal(index); // Open modal with the index of the clicked image
        });
    });

    // 2. Click listeners for modal navigation arrows
    if (prevModalBtn && nextModalBtn) {
        prevModalBtn.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevents click from closing the modal via background
            showSlide(currentImageIndex - 1);
        });

        nextModalBtn.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevents click from closing the modal via background
            showSlide(currentImageIndex + 1);
        });
    }

    // 3. Close modal listeners (X button and background)
    closeBtn.onclick = closeModal;

    modal.onclick = function(event) {
        // Only close if the click is directly on the modal element (the dark background)
        if (event.target === modal) {
            closeModal();
        }
    }

    // 4. Keyboard navigation (Left/Right arrows) and Escape
    document.addEventListener('keydown', function(event) {
        if (modal.style.display === 'block') { // Only active when modal is open
            if (event.key === 'Escape') {
                closeModal();
            } else if (event.key === 'ArrowRight') {
                showSlide(currentImageIndex + 1);
            } else if (event.key === 'ArrowLeft') {
                showSlide(currentImageIndex - 1);
            }
        }
    });

});