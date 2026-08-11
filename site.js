(() => {
  const drawer = document.getElementById('navDrawer');
  const openButton = document.querySelector('.menu-btn');
  const closeButton = document.querySelector('.nav-drawer__close');
  const desktopQuery = window.matchMedia('(min-width: 960px)');
  let returnFocus = null;

  const setMenuOpen = (open) => {
    if (!drawer || !openButton) return;
    drawer.hidden = !open;
    drawer.classList.toggle('is-open', open);
    openButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);

    if (open) {
      returnFocus = document.activeElement;
      closeButton?.focus();
    } else if (returnFocus instanceof HTMLElement) {
      returnFocus.focus();
    }
  };

  const syncNavigationMode = () => {
    if (!drawer || !openButton) return;
    if (desktopQuery.matches) {
      drawer.hidden = false;
      drawer.classList.remove('is-open');
      openButton.setAttribute('aria-expanded', 'true');
      document.body.classList.remove('menu-open');
    } else {
      drawer.hidden = true;
      drawer.classList.remove('is-open');
      openButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
  };

  openButton?.addEventListener('click', () => setMenuOpen(true));
  closeButton?.addEventListener('click', () => setMenuOpen(false));
  drawer?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer?.classList.contains('is-open')) {
      setMenuOpen(false);
      return;
    }

    if (event.key === 'Tab' && drawer?.classList.contains('is-open')) {
      const focusable = [...drawer.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter((element) => !element.hidden && element.getClientRects().length > 0);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  desktopQuery.addEventListener('change', syncNavigationMode);
  syncNavigationMode();

  const faqButtons = [...document.querySelectorAll('.faq-btn')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const closeFaq = (button) => {
    const panel = button.nextElementSibling;
    button.setAttribute('aria-expanded', 'false');
    button.querySelector('.faq-chev')?.classList.remove('is-open');
    if (!panel || panel.hidden) return;

    panel.classList.remove('open');
    const hidePanel = () => {
      if (!panel.classList.contains('open')) panel.hidden = true;
    };
    if (reduceMotion.matches) {
      hidePanel();
      return;
    }

    const onTransitionEnd = (event) => {
      if (event.target !== panel || event.propertyName !== 'grid-template-rows') return;
      panel.removeEventListener('transitionend', onTransitionEnd);
      hidePanel();
    };
    panel.addEventListener('transitionend', onTransitionEnd);
    window.setTimeout(() => {
      panel.removeEventListener('transitionend', onTransitionEnd);
      hidePanel();
    }, 400);
  };

  faqButtons.forEach((button, index) => {
    const panel = button.nextElementSibling;
    if (!panel) return;

    const buttonId = `faq-button-${index + 1}`;
    const panelId = `faq-panel-${index + 1}`;
    button.id = buttonId;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', panelId);
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', buttonId);
    panel.hidden = true;

    button.addEventListener('click', () => {
      const shouldOpen = button.getAttribute('aria-expanded') !== 'true';

      faqButtons.forEach(closeFaq);

      if (shouldOpen) {
        button.setAttribute('aria-expanded', 'true');
        button.querySelector('.faq-chev')?.classList.add('is-open');
        panel.hidden = false;
        void panel.offsetHeight;
        panel.classList.add('open');
      }
    });
  });

  const galleryImages = [...document.querySelectorAll('.rehab-gallery__item img')];
  if (galleryImages.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.hidden = true;
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', '写真の拡大表示');
    lightbox.innerHTML = `
      <button class="gallery-lightbox__close" type="button" aria-label="拡大表示を閉じる">
        <span aria-hidden="true">×</span>
      </button>
      <img class="gallery-lightbox__image" alt="">
    `;
    document.body.append(lightbox);

    const lightboxImage = lightbox.querySelector('.gallery-lightbox__image');
    const lightboxClose = lightbox.querySelector('.gallery-lightbox__close');
    let galleryReturnFocus = null;

    const closeLightbox = () => {
      if (lightbox.hidden) return;
      lightbox.hidden = true;
      document.body.classList.remove('lightbox-open');
      lightboxImage.removeAttribute('src');
      lightboxImage.alt = '';
      if (galleryReturnFocus instanceof HTMLElement) galleryReturnFocus.focus();
      galleryReturnFocus = null;
    };

    const openLightbox = (image) => {
      galleryReturnFocus = image;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
      lightboxClose.focus();
    };

    galleryImages.forEach((image) => {
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `${image.alt || 'ギャラリー写真'}を拡大表示`);
      image.addEventListener('click', () => openLightbox(image));
      image.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openLightbox(image);
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !lightbox.hidden) {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === 'Tab' && !lightbox.hidden) {
        event.preventDefault();
        lightboxClose.focus();
      }
    });
  }

  /* トップのヒーロースライド（クロスフェード自動送り）。
     枚数はHTML側の .hero-slide の数で決まる。1枚だけなら動かさない。 */
  document.querySelectorAll('[data-hero-slider]').forEach((slider) => {
    const slides = [...slider.querySelectorAll('.hero-slide')];
    if (slides.length < 2) return;

    const interval = Number(slider.dataset.heroInterval) || 5000;
    let index = slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (index < 0) index = 0;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));

    let timer = null;
    const showNext = () => {
      slides[index].classList.remove('is-active');
      index = (index + 1) % slides.length;
      slides[index].classList.add('is-active');
    };
    const start = () => {
      if (timer !== null || reduceMotion.matches) return;
      timer = window.setInterval(showNext, interval);
    };
    const stop = () => {
      if (timer === null) return;
      window.clearInterval(timer);
      timer = null;
    };

    // 裏タブで回し続けない（戻ってきたときに一気に飛ばない）。
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
    reduceMotion.addEventListener('change', () => {
      if (reduceMotion.matches) stop();
      else start();
    });
    start();
  });
})();
