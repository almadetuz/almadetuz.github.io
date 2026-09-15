// Carrusel de canciones: la tira de fichas la lleva CardCarousel, y aquí queda
// sólo el pop-up de vídeo.
//
// Cada ficha se queda cuatro segundos en pantalla, y al pasar la última vuelve
// a la primera.
const SONGS_INTERVAL = 4000;

class Songs extends CardCarousel {
  constructor(root) {
    super(root, {
      list: '.songs-list',
      card: '.song-card',
      single_class: 'songs-single',
      label: '.song-card-title',
      interval: SONGS_INTERVAL
    });
    this.modal_el = root.querySelector('.modal');
    this.video = this.modal_el.querySelector('.song-modal-video');
    this.title = this.modal_el.querySelector('.song-modal-title');
    this.text = this.modal_el.querySelector('.song-modal-text');
    this.modal = null;

    // Ficha de la canción abierta (o su copia del bucle, que lleva los mismos
    // atributos) y el tiempo que lleva sonando con este pop-up abierto.
    this.card = null;
    this.clock = null;
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
    this.modal_el.addEventListener('show.bs.modal', () => this.pause());

    // `play` llega al arrancar y al seguir tras una pausa. Si el navegador
    // bloquea el arranque no hay `play` y no se manda nada.
    this.video.addEventListener('play', () => {
      this.clock.start(Date.now());
      AdtEngagement.send('SongStart', this.card);
    });
    // Sólo la pausa de la usuaria. Bootstrap quita `show` en cuanto empieza a
    // cerrar, y la pausa de `hidden.bs.modal` llega después como otra tarea,
    // así que ya no la encuentra. Un flag puesto y quitado en ese handler ya
    // estaría quitado.
    this.video.addEventListener('pause', () => {
      if (this.modal_el.classList.contains('show')) {
        AdtEngagement.send('SongStop', this.card, { play_time: this.clock.stop(Date.now()) });
      }
    });
    // Al empezar a cerrar el vídeo aún suena: el total cuenta el tramo abierto.
    this.modal_el.addEventListener('hide.bs.modal', () => {
      AdtEngagement.send('SongClose', this.card, { play_time: this.clock.total(Date.now()) });
    });
    this.modal_el.addEventListener('hidden.bs.modal', () => {
      this.video.pause();
      // Suelta el fichero en vez de dejarlo cargado: la próxima vez se vuelve a
      // pedir, y mientras tanto no hay un vídeo por canción en memoria.
      this.video.removeAttribute('src');
      this.video.load();
      this.cycle();
    });
  }

  open(button) {
    const card = button.closest('.song-card');
    this.card = card;
    this.clock = new AdtEngagement.PlayClock();
    AdtEngagement.send('SongOpen', card);
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
