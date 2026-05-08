document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('oculto');
            setTimeout(() => {
                document.body.classList.remove('loading');
                loader.style.display = 'none';
            }, 800);
        }
    }, 3000);

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    const hiddenElements = document.querySelectorAll('.fade-in');
    hiddenElements.forEach((el) => observer.observe(el));

    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    if(mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if(mobileMenu) mobileMenu.classList.remove('active');
            if(navMenu) navMenu.classList.remove('active');
        });
    });

    const track = document.getElementById('historia-track');
    const prevBtn = document.getElementById('historia-prev');
    const nextBtn = document.getElementById('historia-next');
    const dotsNav = document.getElementById('historia-nav');

    if (track && prevBtn && nextBtn && dotsNav) {
        const slides = Array.from(track.children);
        const dots = Array.from(dotsNav.children);
        let currentIndex = 0;

        const updateCarousel = (index) => {
            track.style.transform = `translateX(-${index * 100}%)`;
            
            slides.forEach(slide => slide.classList.remove('current-slide'));
            slides[index].classList.add('current-slide');
            
            dots.forEach(dot => dot.classList.remove('current-dot'));
            dots[index].classList.add('current-dot');
            
            currentIndex = index;
        };

        nextBtn.addEventListener('click', () => {
            const nextIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
            updateCarousel(nextIndex);
        });

        prevBtn.addEventListener('click', () => {
            const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
            updateCarousel(prevIndex);
        });

        dotsNav.addEventListener('click', e => {
            const targetDot = e.target.closest('button');
            if (!targetDot) return;
            const targetIndex = parseInt(targetDot.getAttribute('data-index'));
            updateCarousel(targetIndex);
        });

        setInterval(() => {
            const nextIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
            updateCarousel(nextIndex);
        }, 5000);
    }

    let currentImages = [];
    let modalIndex = 0;
    let carrito = [];
    let productoActual = {};

    const modal = document.getElementById('product-modal');
    const btnCerrarModal = document.querySelector('.close-modal');
    const modalImg = document.getElementById('carousel-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalBtnPrev = document.getElementById('btn-prev');
    const modalBtnNext = document.getElementById('btn-next');
    const btnAddCart = document.getElementById('modal-add-cart');
    const btnBuyNow = document.getElementById('modal-buy-now');

    const cartSidebar = document.getElementById('cart-sidebar');
    const btnOpenCart = document.getElementById('open-cart-btn');
    const btnCloseCart = document.getElementById('close-cart');
    const cartBadge = document.getElementById('cart-badge');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const btnCheckout = document.getElementById('checkout-btn');

    const botonesAbrir = document.querySelectorAll('.open-modal');
    botonesAbrir.forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.preventDefault();
            productoActual = {
                id: boton.getAttribute('data-id'),
                title: boton.getAttribute('data-title'),
                desc: boton.getAttribute('data-desc'),
                image: boton.getAttribute('data-images').split(',')[0].trim()
            };
            if(modalTitle) modalTitle.textContent = productoActual.title;
            if(modalDesc) modalDesc.textContent = productoActual.desc;
            
            currentImages = boton.getAttribute('data-images').split(',').map(img => img.trim());
            modalIndex = 0;
            actualizarImagenCarruselModal();
            if(modal) modal.classList.add('activo');
        });
    });

    if(btnCerrarModal) {
        btnCerrarModal.addEventListener('click', () => {
            modal.classList.remove('activo');
        });
    }

    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('activo');
            }
        });
    }

    const actualizarImagenCarruselModal = () => {
        if(modalImg && currentImages.length > 0) {
            modalImg.src = currentImages[modalIndex];
            if(modalBtnPrev && modalBtnNext) {
                modalBtnPrev.style.display = currentImages.length > 1 ? 'block' : 'none';
                modalBtnNext.style.display = currentImages.length > 1 ? 'block' : 'none';
            }
        }
    };

    if(modalBtnNext) {
        modalBtnNext.addEventListener('click', () => {
            modalIndex = (modalIndex + 1) % currentImages.length;
            actualizarImagenCarruselModal();
        });
    }

    if(modalBtnPrev) {
        modalBtnPrev.addEventListener('click', () => {
            modalIndex = (modalIndex - 1 + currentImages.length) % currentImages.length;
            actualizarImagenCarruselModal();
        });
    }

    const obtenerTotalUnidades = () => {
        return carrito.reduce((total, item) => total + item.cantidad, 0);
    };

    const actualizarUI_Carrito = () => {
        if(cartBadge) cartBadge.textContent = obtenerTotalUnidades();
        if(cartItemsContainer) {
            if (carrito.length === 0) {
                cartItemsContainer.innerHTML = '<p class="cart-vacio" style="text-align:center; color:gray;">Tu carrito está vacío.</p>';
            } else {
                cartItemsContainer.innerHTML = '';
                carrito.forEach((item, index) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('cart-item');
                    itemDiv.innerHTML = `
                        <img src="${item.image}" alt="${item.title}">
                        <div class="cart-item-info">
                            <h4>${item.title}</h4>
                            <div class="qty-controls">
                                <button class="qty-btn btn-minus" data-index="${index}">-</button>
                                <span>${item.cantidad}</span>
                                <button class="qty-btn btn-plus" data-index="${index}">+</button>
                            </div>
                            <button class="remove-item" data-index="${index}">Eliminar</button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(itemDiv);
                });

                document.querySelectorAll('.remove-item').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = parseInt(e.target.getAttribute('data-index'));
                        carrito.splice(idx, 1);
                        actualizarUI_Carrito();
                    });
                });

                document.querySelectorAll('.btn-minus').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = parseInt(e.target.getAttribute('data-index'));
                        if(carrito[idx].cantidad > 1) {
                            carrito[idx].cantidad -= 1;
                        } else {
                            carrito.splice(idx, 1);
                        }
                        actualizarUI_Carrito();
                    });
                });

                document.querySelectorAll('.btn-plus').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = parseInt(e.target.getAttribute('data-index'));
                        carrito[idx].cantidad += 1;
                        actualizarUI_Carrito();
                    });
                });
            }
        }
    };

    if(btnAddCart) {
        btnAddCart.addEventListener('click', () => {
            const itemExistente = carrito.find(item => item.id === productoActual.id);
            if(itemExistente) {
                itemExistente.cantidad += 1;
            } else {
                carrito.push({...productoActual, cantidad: 1});
            }
            actualizarUI_Carrito();
            modal.classList.remove('activo');
            cartSidebar.classList.add('activo');
        });
    }

    if(btnBuyNow) {
        btnBuyNow.addEventListener('click', () => {
            const numeroWhatsapp = "573045749676";
            const mensaje = `Hola, me gustaría consultar y comprar el siguiente producto:%0A%0A- 1x de ${productoActual.title}`;
            const url = `https://wa.me/${numeroWhatsapp}?text=${mensaje}`;
            window.open(url, '_blank');
        });
    }

    if(btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            if(carrito.length === 0) {
                alert("Tu carrito está vacío. Debes agregar al menos un producto para proceder al pago.");
                return;
            }
            const numeroWhatsapp = "573045749676";
            let mensaje = "Hola, me gustaría proceder con la compra de los siguientes productos de mi carrito:%0A%0A";
            carrito.forEach(item => {
                mensaje += `- ${item.cantidad}x ${item.title}%0A`;
            });
            const url = `https://wa.me/${numeroWhatsapp}?text=${mensaje}`;
            window.open(url, '_blank');
        });
    }

    if(btnOpenCart) {
        btnOpenCart.addEventListener('click', () => {
            cartSidebar.classList.add('activo');
        });
    }

    if(btnCloseCart) {
        btnCloseCart.addEventListener('click', () => {
            cartSidebar.classList.remove('activo');
        });
    }

    const cards = document.querySelectorAll('.historia-card.interactiva');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });
});