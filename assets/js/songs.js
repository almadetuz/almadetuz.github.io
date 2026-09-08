// Cada ficha se queda cuatro segundos en pantalla, y al pasar la última vuelve
// a la primera.
const SONGS_INTERVAL = 4000;

class Songs {
  constructor(root) {
    this.root = root;
    this.list = root.querySelector('.songs-list');
    this.carousel_el = root.querySelector('.carousel');
    this.inner = this.carousel_el.querySelector('.carousel-inner');
    this.indicators = this.carousel_el.querySelector('.carousel-indicators');
    this.modal_el = root.querySelector('.modal');
    this.video = this.modal_el.querySelector('.song-modal-video');
    this.title = this.modal_el.querySelector('.song-modal-title');
    this.text = this.modal_el.querySelector('.song-modal-text');
    this.desktop = window.matchMedia('(min-width: 768px)');
    this.cards = Array.from(this.list.querySelectorAll('.song-card'));
    this.slides = [];
    this.carousel = null;
    this.modal = null;
    // Índice dentro de this.cards de la primera ficha en pantalla. Sobrevive a
    // un rebuild, que es lo que deja a la lectora en la misma canción cuando el
    // ancho cambia entre una y tres fichas por slide.
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
    return this.desktop.matches ? 3 : 1;
  }

  bind() {
    // Tres fichas por slide en escritorio, una en móvil, así que cruzar el
    // breakpoint cambia cuántos slides hay y el carrusel entero se reconstruye
    // alrededor de la ficha que estaba en pantalla.
    this.desktop.addEventListener('change', () => this.build());
    this.carousel_el.addEventListener('slid.bs.carousel', (e) => {
      this.first_card = e.to * this.visibleCount();
    });

    this.modal = new bootstrap.Modal(this.modal_el);
    this.root.addEventListener('click', (e) => {
      const button = e.target.closest('.song-card-play');
      if (button) {
        this.open(button);
      }
    });

    // Con el pop-up abierto el carrusel de detrás se queda quieto.
    this.modal_el.addEventListener('show.bs.modal', () => this.carousel.pause());
    this.modal_el.addEventListener('hidden.bs.modal', () => {
      this.video.pause();
      // Suelta el fichero en vez de dejarlo cargado: la próxima vez se vuelve a
      // pedir, y mientras tanto no hay un vídeo por canción en memoria.
      this.video.removeAttribute('src');
      this.video.load();
      if (this.slides.length > 1) {
        this.carousel.cycle();
      }
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
      interval: SONGS_INTERVAL,
      ride: 'carousel',
      wrap: true,
      touch: true
    });

    // Si todas las fichas caben en un slide no hay a dónde ir: fuera flechas,
    // fuera puntitos y fuera el paso automático.
    const single = this.slides.length < 2;
    this.carousel_el.classList.toggle('songs-single', single);
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
    cards.className = 'songs-slide';
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
    return slide.map((card) => card.querySelector('.song-card-title').textContent).join(', ');
  }

  open(button) {
    const card = button.closest('.song-card');
    this.title.textContent = button.dataset.songTitle;
    this.text.textContent = card.querySelector('.song-card-text').textContent.trim();
    this.video.poster = button.dataset.songPoster;
    // El vídeo no existe hasta aquí: la ficha del carrusel sólo carga su imagen.
    this.video.src = button.dataset.songVideo;
    this.modal.show();
    // Sigue dentro del click, así que cuenta como gesto de la usuaria y el
    // navegador lo deja arrancar con sonido. Si aun así lo bloquea, quedan los
    // controles del vídeo.
    this.video.play().catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.songs').forEach((root) => new Songs(root).start());
});
