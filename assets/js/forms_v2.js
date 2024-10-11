class Form {
    static _instances = [];

    constructor(prefix, id, cb_submit_ok=null, cb_submit_error=null) {
        this.id = id;
        this.form = document.getElementById(prefix + "-form-" + this.id);
        this.btn = document.getElementById(prefix + "-submit-" + this.id);
        this.msg = document.getElementById(prefix + "-error-message-" + this.id);
        this.spinner = document.getElementById(prefix + "-spinner-" + this.id);
        this.cb_submit_ok = cb_submit_ok;
        this.cb_submit_error = cb_submit_error;
        this.init();
    }

    init() {
        this.onSubmit = this.onSubmit.bind(this);
        this.form.addEventListener("submit", this.onSubmit, false);
        this.btn.classList.remove("disabled");
    }

    async on_submit_ok(e) {
        if (typeof this.cb_submit_ok == 'function') {
            this.cb_submit_ok(e);
        }
    }

    async on_submit_error(e) {
        if (typeof this.cb_submit_error == 'function') {
            this.cb_submit_error(e);
        }
    }

    async onSubmit(e) {
        this.loading_start();
        if (this.form.checkValidity()) {
            this.on_submit_ok(e);
        } else {
            e.preventDefault();
            this.on_submit_error(e);
        }
        this.form.classList.add('was-validated')
        this.loading_end();
      }

    loading_start() {
        this.btn.classList.add("disabled");
        this.msg.classList.remove("d-block");
        this.spinner.classList.remove("d-none");
    }

    loading_end() {
        this.spinner.classList.add("d-none");
        this.btn.classList.remove("disabled");
    }

    static add(...args) {
        const obj = new Form(...args);
        this._instances.push(obj);
      }
  }


class FormSignup extends Form {

    constructor(prefix, id, activity_code, cb_submit_ok=null, cb_submit_error=null) {
        super(prefix, id, cb_submit_ok, cb_submit_error);
        this.activity_code = activity_code;
    }

    async api_call(data) {
        return await api_user_activity_access(this.activity_code, data);
    }

    async on_submit_ok(e) {
        const formData = new FormData(this.form);
        const response = await this.api_call(formData);
        if (response?.status == 200) {
          // User registered OK
          this.local_save(formData);
          window.location = this.form.action;
        } else {
          this.msg.classList.add("d-block");
        }
    }

    local_save(data) {
      const email = data.get('email');
      localStorage.setItem("API-User-Email", email);
    }

    static add(...args) {
      const obj = new FormSignup(...args);
      this._instances.push(obj);
    }
}
