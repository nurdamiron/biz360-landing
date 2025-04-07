document.addEventListener('DOMContentLoaded', () => {
    /* 
    * ============================================
    * Core Functionality
    * ============================================
    */
    
    // Set the correct viewport height variable (fix for mobile browsers)
    const setVhProperty = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVhProperty();
    window.addEventListener('resize', setVhProperty);
    
    // Detect touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        document.body.classList.add('touch-device');
    }
    
    /* 
    * ============================================
    * Mobile Navigation
    * ============================================
    */
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;

    if (mobileNavToggle && mainNav) {
        // Ensure the icons are correctly initialized
        const openIcon = mobileNavToggle.querySelector('.open-icon');
        const closeIcon = mobileNavToggle.querySelector('.close-icon');
        
        if (openIcon) openIcon.style.opacity = '1';
    if (openIcon) openIcon.style.visibility = 'visible';
    if (closeIcon) closeIcon.style.opacity = '0';
    if (closeIcon) closeIcon.style.visibility = 'hidden';
    
        if (!openIcon || !closeIcon) {
            console.warn('Menu icons not found. Check your HTML structure.');
        }
        
        // Handle menu toggle click
        mobileNavToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = !mainNav.classList.contains('active');
            
            // Переключаем классы для меню и кнопки
            mainNav.classList.toggle('active');
            mobileNavToggle.classList.toggle('active');
            body.classList.toggle('menu-open', isOpen);
            
            // Явно управляем видимостью иконок
            if (isOpen) {
              if (openIcon) {
                openIcon.style.opacity = '0';
                openIcon.style.visibility = 'hidden';
              }
              if (closeIcon) {
                closeIcon.style.opacity = '1';
                closeIcon.style.visibility = 'visible';
              }
              
              // Блокируем прокрутку страницы
              document.body.style.overflow = 'hidden';
            } else {
              if (openIcon) {
                openIcon.style.opacity = '1';
                openIcon.style.visibility = 'visible';
              }
              if (closeIcon) {
                closeIcon.style.opacity = '0';
                closeIcon.style.visibility = 'hidden';
              }
              
              // Восстанавливаем прокрутку через задержку
              setTimeout(() => {
                document.body.style.overflow = '';
              }, 300);
            }
          });

        // Close menu when clicking on links
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
              closeMobileMenu();
            });
          });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (body.classList.contains('menu-open') && 
                !e.target.closest('.main-nav') && 
                !e.target.closest('.mobile-nav-toggle')) {
              closeMobileMenu();
            }
          });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && body.classList.contains('menu-open')) {
                closeMobileMenu();
            }
        });

        function closeMobileMenu() {
            if (!mainNav.classList.contains('active')) return;
            
            mainNav.classList.remove('active');
            mobileNavToggle.classList.remove('active');
            body.classList.remove('menu-open');
            
            // Восстанавливаем иконки
            if (openIcon) {
              openIcon.style.opacity = '1';
              openIcon.style.visibility = 'visible';
            }
            if (closeIcon) {
              closeIcon.style.opacity = '0';
              closeIcon.style.visibility = 'hidden';
            }
            
            // Восстанавливаем прокрутку
 
          }
        
        // Fix for white screen issue - make sure menu is fully closed when navigating to new page
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && body.classList.contains('menu-open')) {
                closeMobileMenu();
            }
        });
        
        // Additional fix for page load - ensure menu is closed
        window.addEventListener('pageshow', (event) => {
            if (event.persisted || body.classList.contains('menu-open')) {
                closeMobileMenu();
            }
        });
    }

    /* 
    * ============================================
    * Smooth Scroll for All Anchor Links
    * ============================================
    */
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    /* 
    * ============================================
    * Animation System
    * ============================================
    */
    const animatedCards = document.querySelectorAll('.animate-card');
    
    // Set initial state for all animated elements
    animatedCards.forEach(card => {
        // Only set opacity if not already set inline
        if (!card.style.opacity) {
            card.style.opacity = '0';
        }
        
        // Add animation delay if specified
        if (card.style.animationDelay) {
            const delay = parseFloat(card.style.animationDelay);
            card.style.transitionDelay = `${delay}s`;
        }
    });

    // Modern Intersection Observer approach for animations
    if ('IntersectionObserver' in window && animatedCards.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px', // Start animation a bit before element is fully visible
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    entry.target.style.opacity = '1';
                    
                    // Stop observing after animation is triggered
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all animated elements
        animatedCards.forEach(card => {
            observer.observe(card);
        });
    } 
    // Fallback for older browsers
    else if (animatedCards.length > 0) {
        checkVisibilityFallback();
        
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    checkVisibilityFallback();
                    scrollTimeout = null;
                }, 100);
            }
        }, { passive: true });
    }

    function checkVisibilityFallback() {
        animatedCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            
            if (rect.top < viewportHeight * 0.9 && rect.bottom >= 0) {
                card.style.animationPlayState = 'running';
                card.style.opacity = '1';
            }
        });
    }
    
    /* 
    * ============================================
    * Active Navigation Highlighting
    * ============================================
    */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
    
    function highlightActiveNavLink() {
        let current = '';
        const scrollPosition = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = '#' + section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === current) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightActiveNavLink, { passive: true });
    highlightActiveNavLink(); // Run on page load
    
    /* 
    * ============================================
    * FAQ Accordion
    * ============================================
    */
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const summary = item.querySelector('summary');
        const icon = summary.querySelector('.faq-icon');
        
        // Fix initial state of icons
        if (item.hasAttribute('open')) {
            icon.style.transform = 'rotate(180deg)';
        } else {
            icon.style.transform = 'rotate(0deg)';
        }
        
        summary.addEventListener('click', (e) => {
            // Properly toggle the icon rotation
            if (!item.hasAttribute('open')) {
                // Will be opening
                setTimeout(() => {
                    icon.style.transform = 'rotate(180deg)';
                }, 0);
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.hasAttribute('open')) {
                        const otherIcon = otherItem.querySelector('.faq-icon');
                        otherItem.removeAttribute('open');
                        otherIcon.style.transform = 'rotate(0deg)';
                    }
                });
            } else {
                // Will be closing
                icon.style.transform = 'rotate(0deg)';
            }
        });
        
        // Add keyboard accessibility
        summary.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                summary.click();
            }
        });
    });
    
    /* 
    * ============================================
    * Time Comparison Widget Enhancement
    * ============================================
    */
    const timeWidgetCards = document.querySelectorAll('.time-widget-card');
    
    timeWidgetCards.forEach((card, index) => {
        // Initial state
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        // Animate in with delay based on position
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + (index * 200));
    });
    
    // Animate the arrow in time widget
    const timeArrow = document.querySelector('.time-widget-arrow');
    if (timeArrow) {
        timeArrow.style.opacity = '0';
        timeArrow.style.transform = 'translate(-50%, -50%) scale(0.5)';
        
        setTimeout(() => {
            timeArrow.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            timeArrow.style.opacity = '1';
            timeArrow.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 800);
    }
    
    /* 
    * ============================================
    * Reduction Card Animation
    * ============================================
    */
    const reductionBars = document.querySelectorAll('.reduction-chart .bar');
    
    reductionBars.forEach((bar, index) => {
        // Store original height for animation
        const computedHeight = getComputedStyle(bar).height;
        const height = bar.style.height || computedHeight;
        
        // Calculate height based on index if not explicitly set
        const heightValue = height !== 'auto' ? height : `${20 + (index * 10)}%`;
        
        bar.style.setProperty('--height', heightValue);
        
        // Set initial state
        bar.style.height = '0';
        bar.style.opacity = '0';
        
        // Animate in with sequential delay
        setTimeout(() => {
            bar.style.transition = 'height 1s ease, opacity 0.5s ease';
            bar.style.height = heightValue;
            bar.style.opacity = '0.7';
        }, 500 + (index * 100));
    });
    
    // Add animation to reduction value
    const reductionValue = document.querySelector('.reduction-value');
    if (reductionValue) {
        reductionValue.style.opacity = '0';
        reductionValue.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            reductionValue.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            reductionValue.style.opacity = '1';
            reductionValue.style.transform = 'scale(1)';
        }, 1000);
    }
    
    /* 
    * ============================================
    * Pricing Plan Enhancement
    * ============================================
    */
    const pricingPlans = document.querySelectorAll('.plan');
    let hoverTimeout;
    
    pricingPlans.forEach(plan => {
        plan.addEventListener('mouseover', () => {
            clearTimeout(hoverTimeout);
            
            pricingPlans.forEach(otherPlan => {
                if (otherPlan !== plan) {
                    otherPlan.style.opacity = '0.7';
                    otherPlan.style.transform = otherPlan.classList.contains('popular') 
                        ? 'scale(1)' 
                        : 'scale(0.98)';
                }
            });
        });
        
        plan.addEventListener('mouseout', () => {
            hoverTimeout = setTimeout(() => {
                pricingPlans.forEach(otherPlan => {
                    otherPlan.style.opacity = '1';
                    otherPlan.style.transform = otherPlan.classList.contains('popular') 
                        ? 'scale(1.03)' 
                        : 'scale(1)';
                });
            }, 200);
        });
        
        // Add initial transition
        plan.style.transition = 'transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease';
    });
    
    /* 
    * ============================================
    * Add touch device specific handling
    * ============================================
    */
    if (document.body.classList.contains('touch-device')) {
        // Add ripple effect to buttons
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('touchstart', function(e) {
                const rect = button.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                const y = e.touches[0].clientY - rect.top;
                
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }, { passive: true });
        });
    }
    
    /* 
    * ============================================
    * Back to top button
    * ============================================
    */
    // Create back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Вернуться наверх');
    document.body.appendChild(backToTopBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }, { passive: true });
    
    // Scroll to top when clicked
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    /* 
    * ============================================
    * Bar chart animation
    * ============================================
    */
    const barCharts = document.querySelectorAll('.bar-chart');
    
    barCharts.forEach(chart => {
        const bars = chart.querySelectorAll('.bar');
        
        bars.forEach(bar => {
            const height = bar.style.height;
            
            // Initial state
            bar.style.height = '0';
            
            // Store original height
            bar.dataset.height = height;
            
            // Prepare for animation
            bar.style.transition = 'height 1s cubic-bezier(0.25, 1, 0.5, 1)';
        });
    });
    
    // Animate bars when visible
    if ('IntersectionObserver' in window) {
        const barObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chart = entry.target;
                    const bars = chart.querySelectorAll('.bar');
                    
                    bars.forEach((bar, index) => {
                        setTimeout(() => {
                            bar.style.height = bar.dataset.height;
                        }, 200 * index);
                    });
                    
                    barObserver.unobserve(chart);
                }
            });
        }, { threshold: 0.5 });
        
        barCharts.forEach(chart => {
            barObserver.observe(chart);
        });
    }
});