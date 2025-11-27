class CallToAction {
    static _instances = [];

    constructor(prefix, id, cb_click = null) {
        this.id = id;
        this.cta = document.getElementById(prefix + "-cta-" + this.id);
        this.ctaurl = document.getElementById(prefix + "-ctaurl-" + this.id);
        this.cb_click = cb_click;
        this.init();
    }

    init() {
        this.onClick = this.onClick.bind(this);
        this.cta.addEventListener("click", this.onClick, false);
    }

    async onClick(e) {
        e.preventDefault();
        if (this.processing) return;
        this.processing = true;
        this.ctaurl.classList.add('disabled');

        if (typeof this.cb_click == 'function') {
            await this.cb_click(e);
        }
        // Wait for async callbacks to finish
        await new Promise(resolve => setTimeout(resolve, 500));

        // Redirect to the URL
        const url = this.ctaurl.getAttribute("href");
        const target = this.ctaurl.getAttribute("target");
        if (target === '_blank') {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
        this.processing = false;
        this.ctaurl.classList.remove('disabled');
    }

    static add(...args) {
        const obj = new CallToAction(...args);
        this._instances.push(obj);
    }
}
