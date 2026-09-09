// Carrusel de canciones: las fichas y los slides los lleva CardCarousel, y aquí
// queda sólo el pop-up de vídeo.
//
// Cada ficha se queda cuatro segundos en pantalla, y al pasar la última vuelve
// a la primera.
const SONGS_INTERVAL = 4000;

class Songs extends CardCarousel {
  constructor(root) {
    super(root, {
      list: '.songs-list',
      card: '.song-card',
      slide_class: 'songs-slide',
      single_class: 'songs-single',
      label: '.song-card-title',
      interval: SONGS_INTERVAL
    });
    this.modal_el = root.querySelector('.modal');
    this.video = this.modal_el.querySelector('.song-modal-video');
    this.title = this.modal_el.querySelector('.song-modal-title');
    this.text = this.modal_el.querySelector('.song-modal-text');
    this.modal = null;
  }

  bind() {
    super.bind();

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
