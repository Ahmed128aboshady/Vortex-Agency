/* ==========================================================================
   VORTEX CREATIVE STUDIO - INTERACTIVE & ANIMATION ENGINE (2026)
   Smooth Scrolling, Canvas Particles, GSAP, Magnetic Hover, and Brief Wizard
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Lenis Smooth Scroll Initialization
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 1.5 Theme Switcher Logic
    const themeToggleBtns = document.querySelectorAll('.theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggleBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-moon';
        });
    } else {
        themeToggleBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-sun';
        });
    }

    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            
            themeToggleBtns.forEach(b => {
                const icon = b.querySelector('i');
                if (icon) {
                    icon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
                }
            });
        });
    });


    // 2. Header scroll state
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 3. Mobile Navigation Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            document.body.classList.toggle('mobile-nav-active');
            navMenu.classList.toggle('active');
            
            // Toggle hamburger icon animation
            const spans = mobileToggle.querySelectorAll('span');
            if (document.body.classList.contains('mobile-nav-active')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // 4. Interactive Hero Particles Canvas
    const canvas = document.getElementById('particlesCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        let mouse = {
            x: null,
            y: null,
            radius: 150
        };

        // Resize Canvas
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Track Mouse
        window.addEventListener('mousemove', (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        });
        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Track Touch for Mobiles & Tablets
        window.addEventListener('touchmove', (event) => {
            if (event.touches.length > 0) {
                mouse.x = event.touches[0].clientX;
                mouse.y = event.touches[0].clientY;
            }
        }, { passive: true });
        window.addEventListener('touchend', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Particle Blueprint
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.baseSize = this.size;
                this.color = Math.random() > 0.5 ? '#8A2BE2' : '#FF007F';
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                
                // Adaptive colors depending on theme
                const isLight = document.body.classList.contains('light-theme');
                if (isLight) {
                    ctx.fillStyle = this.color === '#8A2BE2' ? 'rgba(138, 43, 226, 0.4)' : 'rgba(255, 0, 127, 0.4)';
                } else {
                    ctx.fillStyle = this.color;
                }
                ctx.fill();
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Collision with boundary
                if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

                // Mouse interaction
                if (mouse.x && mouse.y) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        this.size = this.baseSize * 3;
                        // Light movement away from mouse
                        let force = (mouse.radius - distance) / mouse.radius;
                        this.x -= (dx / distance) * force * 2;
                        this.y -= (dy / distance) * force * 2;
                    } else {
                        if (this.size > this.baseSize) this.size -= 0.1;
                    }
                } else {
                    if (this.size > this.baseSize) this.size -= 0.1;
                }
            }
        }

        // Initialize particle array
        function initParticles() {
            particlesArray = [];
            const numberOfParticles = Math.floor((canvas.width * canvas.height) / 12000);
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }
        initParticles();

        // Animate particles
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // 5. Magnetic Button Effect (Luxury Feel)
    const magneticBtns = document.querySelectorAll('.btn-magnetic');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Move button slightly towards cursor
            gsap.to(btn, {
                x: x * 0.35,
                y: y * 0.35,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        btn.addEventListener('mouseleave', () => {
            // Restore button to center
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });

    // 6. GSAP Reveal Animations on Scroll
    gsap.registerPlugin(ScrollTrigger);

    let mm = gsap.matchMedia();

    // Desktop only scroll reveal animations (min-width: 769px)
    mm.add("(min-width: 769px)", () => {
        // Fade-in animations for section tags and headers
        gsap.utils.toArray('.section-tag, .section-title, .section-subtitle').forEach(el => {
            gsap.from(el, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                }
            });
        });

        // Reveal for Pillar cards individually
        gsap.utils.toArray('.pillar-card').forEach((card, index) => {
            gsap.from(card, {
                opacity: 0,
                y: 40,
                duration: 0.8,
                delay: (index % 3) * 0.15, // Stagger cards in the same row
                scrollTrigger: {
                    trigger: card,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            });
        });

        // Reveal portfolio project cards individually
        gsap.utils.toArray('.project-card').forEach((card, index) => {
            gsap.from(card, {
                opacity: 0,
                scale: 0.95,
                y: 40,
                duration: 0.8,
                delay: (index % 2) * 0.12, // Stagger columns
                scrollTrigger: {
                    trigger: card,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            });
        });
    });

    // Mobile / Tablet: show instantly without scroll delay to avoid rendering lag
    mm.add("(max-width: 768px)", () => {
        gsap.set('.section-tag, .section-title, .section-subtitle, .pillar-card, .project-card', {
            opacity: 1,
            y: 0,
            scale: 1
        });
    });

    // Refresh ScrollTrigger positions after all page elements (like videos & images) have fully loaded
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });

    // 7. Counter Animation for About Page
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'), 10);
        if (isNaN(target)) return; // skip static text elements
        gsap.from(stat, {
            scrollTrigger: {
                trigger: stat,
                start: 'top 85%',
                onEnter: () => {
                    let obj = { count: 0 };
                    gsap.to(obj, {
                        count: target,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: () => {
                            stat.innerText = Math.floor(obj.count) + (target === 98 ? '%' : '+');
                        }
                    });
                }
            }
        });
    });

    // 8. Showcase Filtering System (portfolio.html)
    const categoryBtns = document.querySelectorAll('[data-category-filter]');
    const designerBtns = document.querySelectorAll('[data-designer-filter]');
    const projectCards = document.querySelectorAll('#portfolioGrid .project-card');

    let activeCategory = 'all';
    let activeDesigner = 'all';

    function applyFilters() {
        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const designer = card.getAttribute('data-designer');

            const categoryMatch = (activeCategory === 'all' || category === activeCategory);
            const designerMatch = (activeDesigner === 'all' || designer === activeDesigner);

            if (categoryMatch && designerMatch) {
                gsap.to(card, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.4,
                    display: 'block',
                    ease: 'power2.out'
                });
            } else {
                gsap.to(card, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.4,
                    display: 'none',
                    ease: 'power2.out'
                });
            }
        });
        
        // Refresh ScrollTrigger because item layouts might change heights
        setTimeout(() => {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }, 450);
    }

    if (categoryBtns.length > 0 || designerBtns.length > 0) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-category-filter');
                applyFilters();
            });
        });
    }

    // Designer Dropdown Logic
    const dropdownTrigger = document.getElementById('designerDropdownTrigger');
    const dropdownContainer = document.querySelector('.designer-dropdown-container');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const selectedNameSpan = document.getElementById('selectedDesignerName');

    if (dropdownTrigger) {
        dropdownTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownContainer.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdownContainer.classList.remove('open');
        });

        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                dropdownItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                selectedNameSpan.textContent = item.textContent;
                activeDesigner = item.getAttribute('data-designer-filter');
                applyFilters();
            });
        });
    }

    // 9. Interactive Brief Wizard (brief.html)
    const wizardForm = document.getElementById('interactiveBriefForm');
    if (wizardForm) {
        let currentStep = 1;
        const totalSteps = 4;
        
        const steps = document.querySelectorAll('.brief-step-content');
        const indicatorNodes = document.querySelectorAll('.step-indicator-node');
        
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        const budgetRange = document.getElementById('budgetRange');
        const budgetValue = document.getElementById('budgetValue');
        
        const selectedServices = new Set();
        const optionCards = document.querySelectorAll('.brief-option-card');

        // Multi-select Service Option Cards
        optionCards.forEach(card => {
            card.addEventListener('click', () => {
                const val = card.getAttribute('data-value');
                if (selectedServices.has(val)) {
                    selectedServices.delete(val);
                    card.classList.remove('selected');
                } else {
                    selectedServices.add(val);
                    card.classList.add('selected');
                }
            });
        });

        // Budget Slider Live Update with Formatting
        if (budgetRange && budgetValue) {
            budgetRange.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10);
                const isAr = document.documentElement.lang === 'ar';
                // format as currency string depending on language
                budgetValue.innerText = val.toLocaleString(isAr ? 'ar-EG' : 'en-US');
            });
        }

        // Steps navigation logic
        function updateWizardUI() {
            // Show/Hide Steps Content
            steps.forEach(step => {
                const stepNum = parseInt(step.getAttribute('data-step'), 10);
                if (stepNum === currentStep) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });

            // Update Indicator Nodes
            indicatorNodes.forEach(node => {
                const stepNum = parseInt(node.getAttribute('data-step'), 10);
                if (stepNum === currentStep) {
                    node.className = 'step-indicator-node active';
                } else if (stepNum < currentStep) {
                    node.className = 'step-indicator-node completed';
                } else {
                    node.className = 'step-indicator-node';
                }
            });

            // Navigation buttons visibility/text
            const isAr = document.documentElement.lang === 'ar';
            if (currentStep === 1) {
                prevBtn.style.visibility = 'hidden';
            } else {
                prevBtn.style.visibility = 'visible';
                prevBtn.innerText = isAr ? 'السابق' : 'Previous';
            }

            if (currentStep === totalSteps) {
                nextBtn.innerHTML = isAr ? 'إرسال ومتابعة بالواتساب <i class="fa-solid fa-check"></i>' : 'Submit & WhatsApp <i class="fa-solid fa-check"></i>';
            } else {
                nextBtn.innerHTML = isAr ? 'التالي <i class="fa-solid fa-arrow-left"></i>' : 'Next <i class="fa-solid fa-arrow-right"></i>';
            }
        }

        nextBtn.addEventListener('click', () => {
            const isAr = document.documentElement.lang === 'ar';
            // Validation before proceeding
            if (currentStep === 1 && selectedServices.size === 0) {
                alert(isAr ? 'يرجى اختيار خدمة واحدة على الأقل للاستمرار.' : 'Please select at least one service to continue.');
                return;
            }

            if (currentStep === 4) {
                // Form validation on final step
                const name = document.getElementById('clientName').value.trim();
                const phone = document.getElementById('clientPhone').value.trim();
                const email = document.getElementById('clientEmail').value.trim();
                
                if (!name || !phone || !email) {
                    alert(isAr ? 'يرجى تعبئة الحقول الأساسية (الاسم، الهاتف، والبريد الإلكتروني) لإتمام الإرسال.' : 'Please fill in the required fields (Name, Phone & Email) to submit.');
                    return;
                }

                // Handle Form Submission
                submitBriefForm();
                return;
            }

            currentStep++;
            updateWizardUI();
        });

        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateWizardUI();
            }
        });

        // Form submission compiler
        function submitBriefForm() {
            const isAr = document.documentElement.lang === 'ar';
            const name = document.getElementById('clientName').value;
            const company = document.getElementById('clientCompany').value || (isAr ? 'غير محدد' : 'Not Specified');
            const phone = document.getElementById('clientPhone').value;
            const email = document.getElementById('clientEmail').value;
            const comm = document.getElementById('commChannel').value;
            const description = document.getElementById('brandDescription').value || (isAr ? 'لا يوجد وصف إضافي' : 'No Additional Description');
            const budget = parseInt(budgetRange.value, 10).toLocaleString('en-US');
            const services = Array.from(selectedServices).join('، ');

            // Compile neat multilingual WhatsApp message
            let messageText = '';
            if (isAr) {
                messageText = 
`*بريف مشروع جديد - وكالة Vortex*
---------------------------------------
*العميل:* ${name}
*الشركة:* ${company}
*الهاتف:* ${phone}
*البريد الإلكتروني:* ${email}
*وسيلة التواصل المفضلة:* ${comm}
---------------------------------------
*الخدمات المطلوبة:* ${services}
*الميزانية التقديرية:* $${budget}
*عن المشروع:* ${description}
---------------------------------------
تم الإرسال من منشئ مشروعات Vortex التفاعلي.`;
            } else {
                messageText = 
`*New Project Brief - Vortex Studio*
---------------------------------------
*Client:* ${name}
*Company:* ${company}
*Phone:* ${phone}
*Email:* ${email}
*Preferred Channel:* ${comm}
---------------------------------------
*Required Services:* ${services}
*Estimated Budget:* $${budget}
*About Project:* ${description}
---------------------------------------
Sent from Vortex Interactive Brief Configurator.`;
            }

            const message = encodeURIComponent(messageText);
            const whatsappUrl = `https://wa.me/201553900394?text=${message}`; // Target business WhatsApp
            
            // Set href for WhatsApp send button in overlay
            const waSendBtn = document.getElementById('whatsappSendBtn');
            if (waSendBtn) {
                waSendBtn.setAttribute('href', whatsappUrl);
            }

            // Show Success Overlay
            const successOverlay = document.getElementById('briefSuccessOverlay');
            if (successOverlay) {
                successOverlay.style.display = 'flex';
                // Trigger smooth fade-in using GSAP
                gsap.from(successOverlay, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.5,
                    ease: 'power3.out'
                });
            }
        }

        // --- TEAM MEMORIES BOARD BOARD (Only runs on team.html) ---
        const memoriesGallery = document.getElementById('memoriesGallery');
        if (memoriesGallery) {
            const isAr = document.documentElement.lang === 'ar';
            const storageKey = isAr ? 'vortex_memories_ar' : 'vortex_memories_en';

            const defaultMemoriesEn = [
                {
                    id: 'mem1',
                    caption: 'Late Night Launch',
                    location: 'Cairo HQ',
                    rating: 5,
                    details: 'Celebrating the successful launch of Lumin Real Estate compound website after a 48-hour push. Energy was off the charts!',
                    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
                    date: 'July 2, 2026'
                },
                {
                    id: 'mem2',
                    caption: 'Morning Brainstorm',
                    location: 'Design Lab',
                    rating: 5,
                    details: 'Sketching out concepts and 3D wireframes for the Aurora International Pavilion. Pure creative flow.',
                    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
                    date: 'June 25, 2026'
                },
                {
                    id: 'mem3',
                    caption: 'Team Retreat',
                    location: 'Dahab, Red Sea',
                    rating: 5,
                    details: 'Catching inspirations by the sea, windsurfing, and planning Vortex\'s next big moves under the stars.',
                    image: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=600&q=80',
                    date: 'May 12, 2026'
                },
                {
                    id: 'mem4',
                    caption: 'Coffee Fuel Run',
                    location: 'Local Espresso Bar',
                    rating: 4,
                    details: 'Our daily double shot espresso runs. Ideas scale with caffeine level.',
                    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
                    date: 'July 5, 2026'
                },
                {
                    id: 'mem5',
                    caption: 'AI Film Premiere',
                    location: 'Vortex Cinema Room',
                    rating: 5,
                    details: 'Testing our latest generative AI 3D rendering loop on the big screen. The future of cinema is here.',
                    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
                    date: 'April 20, 2026'
                }
            ];

            const defaultMemoriesAr = [
                {
                    id: 'mem1',
                    caption: 'احتفال إطلاق لومين',
                    location: 'مقر التجمع الخامس',
                    rating: 5,
                    details: 'احتفال إطلاق موقع مجموعة لومين العقارية بعد مجهود 48 ساعة متواصلة. طاقة نجاح لا توصف!',
                    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
                    date: '٢ يوليو ٢٠٢٦'
                },
                {
                    id: 'mem2',
                    caption: 'جلسة عصف ذهني',
                    location: 'استوديو التصميم',
                    rating: 5,
                    details: 'جلسة تخطيط ورسم مجسمات بوث معرض جناح أورورا الدولي ثلاثي الأبعاد. تدفق إبداعي خالص.',
                    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
                    date: '٢٥ يونيو ٢٠٢٦'
                },
                {
                    id: 'mem3',
                    caption: 'رحلة استجمام الفريق',
                    location: 'دهب، البحر الأحمر',
                    rating: 5,
                    details: 'التقاط الإلهام من أمواج البحر وجلسات التخطيط لمستقبل الوكالة تحت النجوم.',
                    image: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=600&q=80',
                    date: '١٢ مايو ٢٠٢٦'
                },
                {
                    id: 'mem4',
                    caption: 'وقود القهوة اليومي',
                    location: 'اسبريسو بار',
                    rating: 4,
                    details: 'جلسة كافيين الصباح. الأفكار الإبداعية تتناسب طردياً مع كمية الإسبريسو.',
                    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
                    date: '٥ يوليو ٢٠٢٦'
                },
                {
                    id: 'mem5',
                    caption: 'عرض فيلم الـ AI',
                    location: 'سينما الوكالة',
                    rating: 5,
                    details: 'تجربة وعرض آخر رندرات الذكاء الاصطناعي التوليدي لعام 2026 على الشاشة الكبيرة.',
                    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
                    date: '٢٠ أبريل ٢٠٢٦'
                }
            ];

            let memories = [];
            
            // Try to load from localStorage
            try {
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    memories = JSON.parse(stored);
                } else {
                    memories = isAr ? defaultMemoriesAr : defaultMemoriesEn;
                    localStorage.setItem(storageKey, JSON.stringify(memories));
                }
            } catch (err) {
                memories = isAr ? defaultMemoriesAr : defaultMemoriesEn;
            }

            // Render Memories Grid
            function renderMemories() {
                memoriesGallery.innerHTML = '';
                memories.forEach(mem => {
                    const starsHtml = '★'.repeat(mem.rating) + '☆'.repeat(5 - mem.rating);
                    const card = document.createElement('div');
                    card.className = 'polaroid';
                    card.setAttribute('data-id', mem.id);
                    card.innerHTML = `
                        <div class="polaroid-img-container">
                            <img src="${mem.image}" alt="${mem.caption}" loading="lazy">
                        </div>
                        <div class="polaroid-caption">${mem.caption}</div>
                        <div class="polaroid-stars">${starsHtml}</div>
                        <div class="polaroid-location">📍 ${mem.location}</div>
                        <div class="polaroid-details">"${mem.details}"</div>
                        <div class="polaroid-date">${mem.date}</div>
                    `;
                    
                    // Lightbox trigger on click
                    card.addEventListener('click', () => {
                        openLightbox(mem);
                    });

                    memoriesGallery.appendChild(card);
                });
            }

            // Lightbox control
            const lightbox = document.getElementById('memoryLightbox');
            const lightboxContent = document.getElementById('lightboxContent');
            const closeLightboxBtn = document.getElementById('closeLightboxBtn');

            function openLightbox(mem) {
                if (!lightbox || !lightboxContent) return;
                const starsHtml = '★'.repeat(mem.rating) + '☆'.repeat(5 - mem.rating);
                lightboxContent.innerHTML = `
                    <div class="polaroid">
                        <div class="polaroid-img-container" style="aspect-ratio: auto; max-height: 50vh;">
                            <img src="${mem.image}" alt="${mem.caption}" style="max-height: 50vh; object-fit: contain;">
                        </div>
                        <div class="polaroid-caption">${mem.caption}</div>
                        <div class="polaroid-stars">${starsHtml}</div>
                        <div class="polaroid-location">📍 ${mem.location}</div>
                        <div class="polaroid-details">"${mem.details}"</div>
                        <div class="polaroid-date">${mem.date}</div>
                    </div>
                `;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Stop scrolling
            }

            if (closeLightboxBtn) {
                closeLightboxBtn.addEventListener('click', () => {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = '';
                });
            }
            
            if (lightbox) {
                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox) {
                        lightbox.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                });
            }

            // Toggle form visibility
            const toggleFormBtn = document.getElementById('toggleMemoryFormBtn');
            const formContainer = document.getElementById('memoryFormContainer');
            if (toggleFormBtn && formContainer) {
                toggleFormBtn.addEventListener('click', () => {
                    formContainer.classList.toggle('active');
                    if (formContainer.classList.contains('active')) {
                        formContainer.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }

            // Star Rating Selector Logic
            const starSelector = document.getElementById('starSelector');
            let selectedRating = 5;
            if (starSelector) {
                const stars = starSelector.querySelectorAll('span');
                stars.forEach(star => {
                    star.addEventListener('click', () => {
                        selectedRating = parseInt(star.getAttribute('data-rating'), 10);
                        stars.forEach(s => {
                            const r = parseInt(s.getAttribute('data-rating'), 10);
                            if (r <= selectedRating) {
                                s.classList.add('active');
                            } else {
                                s.classList.remove('active');
                            }
                        });
                    });
                });
            }

            // Add Memory Form Submit
            const addForm = document.getElementById('addMemoryForm');
            if (addForm) {
                addForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const caption = document.getElementById('memCaption').value.trim();
                    const locationVal = document.getElementById('memLoc').value.trim();
                    const details = document.getElementById('memDesc').value.trim();
                    const imageFile = document.getElementById('memImage').files[0];

                    if (!caption || !locationVal || !details || !imageFile) return;

                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        const base64Img = evt.target.result;
                        
                        // Format current date
                        const d = new Date();
                        let dateString = '';
                        if (isAr) {
                            const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
                            dateString = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
                        } else {
                            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                            dateString = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                        }

                        const newMemory = {
                            id: 'mem_' + Date.now(),
                            caption: caption,
                            location: locationVal,
                            rating: selectedRating,
                            details: details,
                            image: base64Img,
                            date: dateString
                        };

                        memories.unshift(newMemory); // Add to beginning of grid
                        localStorage.setItem(storageKey, JSON.stringify(memories));
                        
                        renderMemories();

                        // Reset & Close Form
                        addForm.reset();
                        formContainer.classList.remove('active');
                        
                        // Reset star selector active states
                        if (starSelector) {
                            const stars = starSelector.querySelectorAll('span');
                            stars.forEach(s => {
                                if (parseInt(s.getAttribute('data-rating'), 10) <= 5) {
                                    s.classList.add('active');
                                }
                            });
                        }
                        selectedRating = 5;

                        // Scroll back to board
                        memoriesGallery.scrollIntoView({ behavior: 'smooth' });
                    };
                    reader.readAsDataURL(imageFile);
                });
            }

            // Run initial load
            renderMemories();
        }
    }

    // --- 9.5 Marketing Case Studies Modal Controller ---
    const caseStudiesData = {
        'campaign-1': {
            titleEn: 'Educational Campaign (Teacher Boost)',
            titleAr: 'حملة إطلاق محتوى تعليمي (لمعلم صانع محتوى)',
            descEn: 'Strategic organic reel campaign for a professional educator. Custom video formatting and hooks drove 66K+ views and a massive increase in student registrations.',
            descAr: 'حملة محتوى مستهدف لمعلم صانع محتوى. أدت الريلز المصممة استراتيجياً لزيادة التفاعل وجلب أكثر من 66 ألف مشاهدة ونمو كبير في الاشتراكات.',
            views: '66,952',
            growth: '76%',
            extraEn: '19h 7m Watch',
            extraAr: '19س 7د مشاهدة',
            graph: 'img/insights/campaign1.png'
        },
        'campaign-2': {
            titleEn: 'Luxury Real Estate Lead Gen',
            titleAr: 'حملة جلب عملاء عقارات فاخرة',
            descEn: 'Designed to drive high engagement and website clicks for a Middle Eastern luxury property group. Achieved 109k+ views with consistent watch time growth.',
            descAr: 'مصممة لزيادة التفاعل ونقرات الموقع لمجموعة عقارات فاخرة في الشرق الأوسط. حققت أكثر من 109 ألف مشاهدة مع نمو مستمر في وقت المشاهدة ونسبة وصول عالية.',
            views: '109,367',
            growth: '+39%',
            extraEn: '10h 13m Watch',
            extraAr: '10س 13د مشاهدة',
            graph: 'img/insights/campaign2.png'
        },
        'campaign-3': {
            titleEn: 'FMCG Brand Engagement',
            titleAr: 'حملة تنشيط لمنتجات استهلاكية',
            descEn: 'High-impact product promo campaign maximizing long-term viewer retention. 1-minute video views skyrocketed by 379%, cementing brand familiarity.',
            descAr: 'حملة فيديو لزيادة احتفاظ المشاهدين على المدى الطويل للسلع الاستهلاكية الفاخرة. ارتفعت مشاهدات الدقيقة الكاملة بنسبة 379%، مما عزز حضور البراند ومعدل الحفظ.',
            views: '127,561',
            growth: '+379%',
            extraEn: '26.4K 3s Views',
            extraAr: '26.4 ألف مشاهدة (3ث)',
            graph: 'img/insights/campaign3.png'
        },
        'campaign-4': {
            titleEn: 'B2B Campaign - Odoo Silver Partner',
            titleAr: 'حملة تسويق B2B لشريك أودو الفضي',
            descEn: 'Strategic reach campaign for an official Odoo Silver Partner. Reached 411K+ views, successfully engaging B2B decision-makers and IT directors.',
            descAr: 'حملة استهداف استراتيجية لشريك أودو الفضي الرسمي (Odoo Silver Partner). حققت أكثر من 411 ألف مشاهدة مستهدفة قطاع الشركات ومتخذي القرار.',
            views: '411,589',
            growth: '61%',
            extraEn: '5h 32m Watch',
            extraAr: '5س 32د مشاهدة',
            graph: 'img/insights/campaign4.png'
        },
        'campaign-5': {
            titleEn: 'Viral Campaign - Exhibition & Interior Group',
            titleAr: 'حملة فيروسية لشركة تنظيم معارض وتصميم داخلي',
            descEn: 'A blockbuster organic viral campaign for a premium exhibition and interior design group. Over 1.4 Million Views with a staggering 1,895% growth in reach.',
            descAr: 'حملة فيديو فيروسية ضخمة حققت انتشاراً كاسحاً وأرقام قياسية لشركة تنظيم معارض وتصميم داخلي. تجاوزت 1.4 مليون مشاهدة مع نمو في الوصول بنسبة 1895%.',
            views: '1,407,212',
            growth: '+1,895%',
            extraEn: '21d 7h Watch',
            extraAr: '21ي 7س مشاهدة',
            graph: 'img/insights/campaign5.png'
        },
        'app-1': {
            titleEn: 'Velo - Smart Fitness iOS App',
            titleAr: 'تطبيق Velo الذكي للياقة البدنية',
            descEn: 'Premium dark-mode iOS application engineered for active fitness tracking. Featuring custom neon metrics dashboard, high-performance UI components, and Apple Health integration.',
            descAr: 'تطبيق iOS رياضي فاخر بالوضع المظلم لمتابعة اللياقة البدنية. يتميز بلوحة تحليلات نيون متطورة، أداء متفوق، وربط مباشر مع تطبيق Apple Health.',
            views: '100K+ Installs',
            growth: '4.8 Rating',
            extraEn: 'iOS Native Swift',
            extraAr: 'لغة Swift لـ iOS',
            graph: 'img/apps/velo.png'
        },
        'app-2': {
            titleEn: 'Luxora - Luxury Jewelry App',
            titleAr: 'تطبيق Luxora للمجوهرات الفاخرة',
            descEn: 'High-end e-commerce mobile application for premium diamonds catalog. Immersive high-definition product view, interactive ring sizing, and secure tokenized checkout.',
            descAr: 'تطبيق تجارة إلكترونية فاخر لعرض وبيع الألماس والمجوهرات الراقية. يتميز بتصفح غامر عالي الدقة، قياس تفاعلي للخواتم، ودفع آمن مشفر.',
            views: '50K+ Orders',
            growth: '99.9% Secure',
            extraEn: 'Android Kotlin',
            extraAr: 'لغة Kotlin لأندرويد',
            graph: 'img/apps/luxora.png'
        },
        'app-3': {
            titleEn: 'DineOut - Smart Food Delivery App',
            titleAr: 'تطبيق DineOut لطلب الأغذية وحجز الطاولات',
            descEn: 'Modern, fast, and user-friendly cross-platform food delivery and restaurant booking application. Custom order flows, real-time rider tracking, and smart local recommendations.',
            descAr: 'تطبيق طلب طعام وحجز طاولات تفاعلي وسريع. تدفقات دفع مخصصة، تتبع مباشر للمندوب على الخريطة، وتوصيات ذكية للمطاعم المحلية المجاورة.',
            views: '500K+ Orders',
            growth: '98% On-Time',
            extraEn: 'Flutter & Node.js',
            extraAr: 'بيئة Flutter و Node.js',
            graph: 'img/apps/dineout.png'
        }
    };
    
    const caseModal = document.getElementById('caseStudyModal');
    const modalGraphImage = document.getElementById('modalGraphImage');
    const modalCampaignTitle = document.getElementById('modalCampaignTitle');
    const modalCampaignDesc = document.getElementById('modalCampaignDesc');
    const modalStatViews = document.getElementById('modalStatViews');
    const modalStatGrowth = document.getElementById('modalStatGrowth');
    const modalStatExtra = document.getElementById('modalStatExtra');
    const caseModalClose = document.getElementById('caseModalClose');
    const caseModalOverlay = document.getElementById('caseModalOverlay');
    const isArabic = document.documentElement.lang === 'ar';

    document.querySelectorAll('[data-case-study]').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const id = card.getAttribute('data-case-study');
            const data = caseStudiesData[id];
            if (!data) return;

            modalGraphImage.src = data.graph;
            modalCampaignTitle.textContent = isArabic ? data.titleAr : data.titleEn;
            modalCampaignDesc.textContent = isArabic ? data.descAr : data.descEn;
            
            const isApp = id.startsWith('app-');
            const statsGrid = caseModal.querySelector('.case-stats-grid');
            const tagEl = caseModal.querySelector('.case-tag');

            if (isApp) {
                if (statsGrid) statsGrid.style.display = 'none';
                if (tagEl) tagEl.textContent = isArabic ? 'تطبيق هاتف محمول' : 'Mobile Application';
            } else {
                if (statsGrid) statsGrid.style.display = 'grid';
                if (tagEl) tagEl.textContent = isArabic ? 'دراسة حالة تسويقية' : 'Marketing Case Study';
                modalStatViews.textContent = data.views;
                modalStatGrowth.textContent = data.growth;
                modalStatExtra.textContent = isArabic ? data.extraAr : data.extraEn;
            }

            caseModal.classList.add('active');
            gsap.to(caseModal.querySelector('.case-modal-content'), {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: 'back.out(1.2)'
            });
        });
    });

    function closeCaseModal() {
        gsap.to(caseModal.querySelector('.case-modal-content'), {
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                caseModal.classList.remove('active');
            }
        });
    }

    if (caseModalClose) {
        caseModalClose.addEventListener('click', closeCaseModal);
        caseModalOverlay.addEventListener('click', closeCaseModal);
    }

});