class ScrollEvent {
    static _instances = [];

    constructor(id, cb_event, threshold=0.5) {
        this.id = id;
        this.cb_event = cb_event;
        this.threshold = threshold;
        this.el = document.getElementById(this.id);
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => {
                    if (!entries[0].isIntersecting) return;
                    this.observer.unobserve(entries[0].target);
                    this.on_viewport(entries[0]);
                },{threshold: this.threshold}
            )
            this.observer.observe(this.el);
        }
    }

    on_viewport(e) {
        if (typeof this.cb_event == 'function') {
            this.cb_event(e);
        }
    }

    static add(...args) {
        const obj = new ScrollEvent(...args);
        this._instances.push(obj);
      }
}


