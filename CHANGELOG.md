# Changelog - Performance & UI Fixes

## CSS (sv-custom.css)
- **Performance**: Reduced shadow blur values (40px→20px, 30px→12px) to improve rendering
- **Performance**: Simplified body::before background gradient (removed 3 radial gradients)
- **Performance**: Reduced backdrop-filter blur from 10px to 8px
- **Performance**: Optimized animations using translate3d for GPU acceleration
- **Performance**: Added will-change properties for transform animations
- **Partners Section**: Added responsive grid layout for partner logos with hover effects
- **Opaque Boxes**: Removed broken image reference from .sv-contact-card::before
- **Opaque Boxes**: Ensured .sv-hero__bg, .sv-hero__ribbon elements are hidden

## HTML Files
- **Performance**: Added `defer` attribute to all script tags (jQuery, frontend-script.js)
- **Performance**: Added `loading="lazy"` to partner logo images
- **Partners Section**: Replaced text-based partner list with logo images (SVG placeholders)
- **Accessibility**: Added proper aria-labels to partner logo links

## JavaScript (frontend-script.js)
- **Performance**: Added passive event listener to resize handler
- **Performance**: Increased resize debounce timer from 250ms to 300ms

## Images
- **Partners**: Created 6 SVG placeholder logos (logo-1.svg through logo-6.svg) in images/partners/

## Mobile Menu
- **Verified**: Menu toggle, link navigation, and close functionality working correctly
- **Performance**: Optimized event handlers with passive listeners where appropriate

