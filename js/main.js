const sections = Array.from(document.querySelectorAll('.section-content'));
        const navLinks = Array.from(document.querySelectorAll('.nav-link'));
        const menu = document.getElementById('mobile-menu');
        const backdrop = document.getElementById('mobile-backdrop');
        const menuButton = document.getElementById('menu-button');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let revealObserver;

        function setActiveNav(id) {
            navLinks.forEach((link) => link.classList.toggle('active', link.id === `nav-${id}`));
        }

        function revealActiveSection() {
            const activeSection = document.querySelector('.section-content.active');
            if (!activeSection) return;

            const revealItems = activeSection.querySelectorAll('.reveal');
            revealItems.forEach((item) => {
                if (reduceMotion) {
                    item.classList.add('is-visible');
                    return;
                }
                if (!revealObserver) {
                    item.classList.add('is-visible');
                    return;
                }
                revealObserver.observe(item);
            });
        }

        function showSection(id) {
            const target = document.getElementById(id);
            if (!target) return;

            sections.forEach((section) => {
                section.classList.toggle('active', section === target);
            });
            setActiveNav(id);
            toggleMenu(false);
            window.scrollTo(0, 0);
            revealActiveSection();
        }

        function toggleMenu(forceOpen) {
            const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !menu.classList.contains('open');
            menu.classList.toggle('open', shouldOpen);
            backdrop.classList.toggle('open', shouldOpen);
            document.body.classList.toggle('menu-open', shouldOpen);
            menuButton?.setAttribute('aria-expanded', String(shouldOpen));
        }

        function initReveal() {
            if (reduceMotion || !('IntersectionObserver' in window)) {
                document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
                return;
            }

            revealObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

            revealActiveSection();
        }

        function initParticles() {
            if (reduceMotion || !window.THREE) return;

            const canvas = document.getElementById('bg-canvas');
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: false,
                powerPreference: 'low-power'
            });

            camera.position.z = 6;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
            renderer.setSize(window.innerWidth, window.innerHeight, false);

            const isMobile = window.matchMedia('(max-width: 767px)').matches;
            const particlesCount = isMobile ? 360 : 900;
            const positions = new Float32Array(particlesCount * 3);

            for (let index = 0; index < positions.length; index += 1) {
                positions[index] = (Math.random() - 0.5) * 15;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const material = new THREE.PointsMaterial({
                size: isMobile ? 0.008 : 0.006,
                color: '#7dd3fc',
                transparent: true,
                opacity: isMobile ? 0.45 : 0.62,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const mesh = new THREE.Points(geometry, material);
            scene.add(mesh);

            let rafId = 0;
            let mouseX = 0;
            let mouseY = 0;
            let resizeFrame = 0;

            function render() {
                mesh.rotation.y += 0.0007 + (mouseX - mesh.rotation.y) * 0.015;
                mesh.rotation.x += 0.00035 + (mouseY - mesh.rotation.x) * 0.015;
                renderer.render(scene, camera);
                rafId = requestAnimationFrame(render);
            }

            function resize() {
                if (resizeFrame) return;
                resizeFrame = requestAnimationFrame(() => {
                    resizeFrame = 0;
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight, false);
                });
            }

            if (!isMobile) {
                window.addEventListener('pointermove', (event) => {
                    mouseX = (event.clientX / window.innerWidth - 0.5) * 0.35;
                    mouseY = (event.clientY / window.innerHeight - 0.5) * 0.35;
                }, { passive: true });
            }

            window.addEventListener('resize', resize, { passive: true });
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    cancelAnimationFrame(rafId);
                    return;
                }
                render();
            });

            render();
        }

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') toggleMenu(false);
        });

        window.addEventListener('load', () => {
            window.lucide?.createIcons();
            initReveal();
            initParticles();
            setActiveNav('home');
        });

