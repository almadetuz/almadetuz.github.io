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
        console.log('CallToAction.onClick: START');
        e.preventDefault();
        if (typeof this.cb_click == 'function') {
            console.log('CallToAction.cb_click: START');
            await this.cb_click(e);
            console.log('CallToAction.cb_click: END');
        }
        // Wait for the callback to finish
        console.log('CallToAction.cb_click: Wait 10 seconds');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Redirect to the URL
        const url = this.ctaurl.getAttribute("href");
        const target = this.ctaurl.getAttribute("target");
        console.log('CallToAction.onClick: Go to URL: ' + url);
        if (target === '_blank') {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
        console.log('CallToAction.onClick: END');
    }

    static add(...args) {
        const obj = new CallToAction(...args);
        this._instances.push(obj);
    }
}
