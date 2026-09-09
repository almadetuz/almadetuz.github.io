// Base de los carruseles de fichas del sitio.
//
// Coge una lista plana de fichas, la trocea en slides -- varias por slide en
// escritorio, una en móvil -- y se la da a un carrusel de Bootstrap. Cruzar el
// breakpoint cambia cuántas fichas caben en un slide, así que el carrusel
// entero se reconstruye alrededor de la que estaba en pantalla. Si el JS no
// corre, la lista se queda visible tal cual, sin carrusel.
//
// No se inicializa sola: cada carrusel concreto la extiende y arranca lo suyo.
const CARDS_DESKTOP = '(min-width: 768px)';
const CARDS_PER_SLIDE = 3;

class CardCarousel {
  // options:
  //   list          selector de la lista plana de fichas
  //   card          selector de cada ficha dentro de la lista
  //   slide_class   clase del contenedor de fichas de un slide
  //   single_class  clase que marca "todo cabe en un slide"
  //   label         selector, dentro de la ficha, del texto para el aria-label
  //   interval      ms entre slides, o false para no pasar solo
  constructor(root, options) {
    this.root = root;
    this.options = options;
    this.list = root.querySelector(options.list);
    this.carousel_el = root.querySelector('.carousel');
    this.inner = this.carousel_el.querySelector('.carousel-inner');
    this.indicators = this.carousel_el.querySelector('.carousel-indicators');
    this.desktop = window.matchMedia(CARDS_DESKTOP);
    this.cards = Array.from(this.list.querySelectorAll(options.card));
    this.slides = [];
    this.carousel = null;
    // Índice dentro de this.cards de la primera ficha en pantalla. Sobrevive a
    // un rebuild, que es lo que deja a la lectora en la misma ficha cuando el
    // ancho cambia entre una y varias fichas por slide.
    this.first_card = 0;
  }

  start() {
    if (!this.cards.length) {
      return;
    }
    this.bind();
    this.build();
    this.list.hidden = true;
    this.carousel_el.hidden = false;
  }

  visibleCount() {
    return this.desktop.matches ? CARDS_PER_SLIDE : 1;
  }

  bind() {
    this.desktop.addEventListener('change', () => this.build());
    this.carousel_el.addEventListener('slid.bs.carousel', (e) => {
      this.first_card = e.to * this.visibleCount();
    });
  }

  // Reparte las fichas en slides, pinta el que lleva this.first_card como
  // activo y le pasa el resultado a Bootstrap.
  build() {
    const size = this.visibleCount();
    this.slides = [];
    for (let i = 0; i < this.cards.length; i += size) {
      this.slides.push(this.cards.slice(i, i + size));
    }
    const active = Math.floor(this.first_card / size);
    // Ancla en la primera ficha del slide, para que un rebuild posterior caiga
    // en el mismo slide del que vino en vez de irse desplazando.
    this.first_card = active * size;

    if (this.carousel) {
      this.carousel.dispose();
    }
    this.render(active);
    this.carousel = new bootstrap.Carousel(this.carousel_el, {
      interval: this.options.interval,
      ride: this.options.interval ? 'carousel' : false,
      wrap: true,
      touch: true
    });

    // Si todas las fichas caben en un slide no hay a dónde ir: fuera flechas,
    // fuera puntitos y fuera el paso automático.
    const single = this.slides.length < 2;
    this.carousel_el.classList.toggle(this.options.single_class, single);
    if (single) {
      this.carousel.pause();
    }
  }

  render(active) {
    this.inner.replaceChildren();
    this.indicators.replaceChildren();
    this.slides.forEach((slide, index) => {
      this.inner.appendChild(this.renderSlide(slide, index === active));
      this.indicators.appendChild(this.renderIndicator(slide, index, index === active));
    });
  }

  // Las fichas son siempre los mismos elementos: appendChild las mueve de un
  // slide al siguiente, así que un rebuild no vuelve a construir nada.
  renderSlide(slide, active) {
    const item = document.createElement('div');
    item.className = active ? 'carousel-item active' : 'carousel-item';

    const cards = document.createElement('div');
    cards.className = this.options.slide_class;
    slide.forEach((card) => cards.appendChild(card));
    item.appendChild(cards);

    return item;
  }

  renderIndicator(slide, index, active) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.bsTarget = '#' + this.carousel_el.id;
    button.dataset.bsSlideTo = index;
    button.setAttribute('aria-label', this.slideLabel(slide));
    if (active) {
      button.className = 'active';
      button.setAttribute('aria-current', 'true');
    }
    return button;
  }

  slideLabel(slide) {
    return slide.map((card) => card.querySelector(this.options.label).textContent).join(', ');
  }
}
