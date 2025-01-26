/**
 * @license MIT 
 * @copyright Hilario Junior Nengare 2025
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const searchContainer = document.querySelector('.search-container');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Handle navbar
        if (currentScroll > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Handle search container
        if (searchContainer) {
            if (currentScroll > 10) {
                searchContainer.classList.add('scrolled');
            } else {
                searchContainer.classList.remove('scrolled');
            }
            
            // Hide on scroll down, show on scroll up
            if (currentScroll > lastScrollTop && currentScroll > 100) {
                // Scrolling down
                searchContainer.classList.add('hidden');
            } else {
                // Scrolling up
                searchContainer.classList.remove('hidden');
            }
            
            lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
        }
    });

    // Initialize all toasts
    const toastElList = document.querySelectorAll('.toast');
    toastElList.forEach(toastEl => {
        const toast = new bootstrap.Toast(toastEl, {
            autohide: true,
            delay: 5000
        });
        
        // Auto show the toast
        toast.show();
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            toast.hide();
        }, 5000);
    });

    // Tag input handling
    const tagInput = document.querySelector('input[name="tags"]');
    if (tagInput) {
        const tagSuggestions = document.querySelectorAll('.tag-suggestion');
        
        // Function to add a tag
        function addTag(newTag) {
            const currentTags = tagInput.value
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean);
            
            if (!currentTags.includes(newTag)) {
                const updatedTags = [...currentTags, newTag];
                tagInput.value = updatedTags.join(', ');
            }
        }

        // Handle clicking on tag suggestions
        tagSuggestions.forEach(button => {
            button.addEventListener('click', () => {
                const tag = button.dataset.tag;
                addTag(tag);
                tagInput.focus();
            });
        });

        // Handle manual tag input
        tagInput.addEventListener('input', function() {
            const currentTags = this.value.split(',');
            const currentTag = currentTags[currentTags.length - 1].trim().toLowerCase();
            
            // Update visual state of suggestion buttons
            tagSuggestions.forEach(button => {
                const tag = button.dataset.tag;
                if (this.value.includes(tag)) {
                    button.classList.add('btn-primary');
                    button.classList.remove('btn-outline-secondary');
                } else {
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-outline-secondary');
                }
            });
        });

        // Clean up tags on blur
        tagInput.addEventListener('blur', function() {
            const tags = this.value
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean);
            this.value = tags.join(', ');
        });
    }
});