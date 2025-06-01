document.addEventListener('DOMContentLoaded', function() {
    // Configuración inicial
    const config = {
        formSelector: 'form',
        navLinks: 'a[href^="#"]',
        sectionsToAnimate: '.section, .career-card, .benefit-card, .testimonial-card, .campus-card',
        testimonialAutoRotateInterval: 5000,
        scrollOffset: 100
    };

    // 1. Validación de formularios mejorada
    const setupFormValidation = () => {
        document.querySelectorAll(config.formSelector).forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            
            // Validación en tiempo real
            inputs.forEach(input => {
                input.addEventListener('input', function() {
                    validateField(this);
                });
                
                input.addEventListener('blur', function() {
                    validateField(this, true);
                });
            });

            // Manejo del envío del formulario
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                let isValid = true;
                inputs.forEach(input => {
                    if (!validateField(input, true)) {
                        isValid = false;
                    }
                });

                if (isValid) {
                    showFormSuccess(form);
                    // En una aplicación real: form.submit();
                }
            });
        });
    };

    const validateField = (field, showError = false) => {
        let isValid = true;
        const errorMsg = field.nextElementSibling;
        
        // Limpiar errores previos
        if (errorMsg && errorMsg.classList.contains('error-message')) {
            errorMsg.remove();
        }

        // Validar campo requerido
        if (field.required && !field.value.trim()) {
            isValid = false;
            if (showError) {
                showFieldError(field, 'Este campo es requerido');
            }
        }

        // Validar formato de email
        if (field.type === 'email' && field.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                if (showError) {
                    showFieldError(field, 'Ingrese un email válido');
                }
            }
        }

        // Validar teléfono
        if (field.type === 'tel' && field.value.trim()) {
            const phoneRegex = /^[0-9+() -]+$/;
            if (!phoneRegex.test(field.value)) {
                isValid = false;
                if (showError) {
                    showFieldError(field, 'Ingrese un teléfono válido');
                }
            }
        }

        // Actualizar estilo del campo
        if (isValid) {
            field.style.borderColor = '';
        } else if (showError) {
            field.style.borderColor = '#ff6b6b';
        }

        return isValid;
    };

    const showFieldError = (field, message) => {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = message;
        errorMsg.style.color = '#ff6b6b';
        errorMsg.style.fontSize = '0.8rem';
        errorMsg.style.marginTop = '0.3rem';
        field.insertAdjacentElement('afterend', errorMsg);
    };

    const showFormSuccess = (form) => {
        const successHTML = `
            <div class="form-success" style="text-align: center; padding: 2rem;">
                <h3 style="color: #4CAF50; margin-bottom: 1rem;">¡Gracias por tu interés!</h3>
                <p>Nos pondremos en contacto contigo pronto.</p>
            </div>
        `;
        form.parentNode.innerHTML = successHTML;
    };

    // 2. Navegación suave con offset para el header fijo
    const setupSmoothScrolling = () => {
        document.querySelectorAll(config.navLinks).forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = document.querySelector('.main-nav').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + 
                                        window.pageYOffset - 
                                        (headerHeight + config.scrollOffset);
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Actualizar URL sin saltar
                    if (history.pushState) {
                        history.pushState(null, null, targetId);
                    } else {
                        location.hash = targetId;
                    }
                }
            });
        });
    };

    // 3. Animaciones al hacer scroll
    const setupScrollAnimations = () => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll(config.sectionsToAnimate).forEach(section => {
            observer.observe(section);
        });
    };

    // 4. Slider de testimonios
    const setupTestimonialSlider = () => {
        const slider = document.querySelector('.testimonials-slider');
        if (!slider) return;
        
        const testimonials = document.querySelectorAll('.testimonial-card');
        if (testimonials.length < 2) return;
        
        let currentIndex = 0;
        let autoRotateInterval;
        
        const goToTestimonial = (index) => {
            currentIndex = (index + testimonials.length) % testimonials.length;
            slider.scrollTo({
                left: testimonials[currentIndex].offsetLeft - slider.offsetLeft,
                behavior: 'smooth'
            });
        };
        
        const startAutoRotation = () => {
            autoRotateInterval = setInterval(() => {
                goToTestimonial(currentIndex + 1);
            }, config.testimonialAutoRotateInterval);
        };
        
        const stopAutoRotation = () => {
            clearInterval(autoRotateInterval);
        };
        
        // Controles manuales (opcional)
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.className = 'slider-btn slider-prev';
        prevBtn.addEventListener('click', () => {
            stopAutoRotation();
            goToTestimonial(currentIndex - 1);
            startAutoRotation();
        });
        
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.className = 'slider-btn slider-next';
        nextBtn.addEventListener('click', () => {
            stopAutoRotation();
            goToTestimonial(currentIndex + 1);
            startAutoRotation();
        });
        
        slider.parentNode.insertBefore(prevBtn, slider);
        slider.parentNode.appendChild(nextBtn);
        
        // Pausar al interactuar
        slider.addEventListener('mouseenter', stopAutoRotation);
        slider.addEventListener('mouseleave', startAutoRotation);
        slider.addEventListener('touchstart', stopAutoRotation);
        slider.addEventListener('touchend', startAutoRotation);
        
        startAutoRotation();
    };

    // 5. Optimización de imágenes lazy loading
    const setupLazyLoading = () => {
        if ('loading' in HTMLImageElement.prototype) {
            // El navegador soporta lazy loading nativo
            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                img.src = img.dataset.src || img.src;
            });
        } else {
            // Polyfill para navegadores que no soportan lazy loading
            const lazyImages = [].slice.call(document.querySelectorAll('img[loading="lazy"]'));
            
            if ('IntersectionObserver' in window) {
                const lazyImageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const lazyImage = entry.target;
                            lazyImage.src = lazyImage.dataset.src || lazyImage.src;
                            lazyImageObserver.unobserve(lazyImage);
                        }
                    });
                });
                
                lazyImages.forEach(lazyImage => {
                    lazyImageObserver.observe(lazyImage);
                });
            } else {
                // Fallback para navegadores muy antiguos
                lazyImages.forEach(lazyImage => {
                    lazyImage.src = lazyImage.dataset.src || lazyImage.src;
                });
            }
        }
    };

    // 6. Inicialización de todas las funciones
    const init = () => {
        setupFormValidation();
        setupSmoothScrolling();
        setupScrollAnimations();
        setupTestimonialSlider();
        setupLazyLoading();
        
        // Agregar clase de JS habilitado para estilos específicos
        document.documentElement.classList.add('js-enabled');
    };

    // Iniciar la aplicación
    init();
});