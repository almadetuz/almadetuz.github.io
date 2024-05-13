class Form {
    static _instances = [];

    constructor(prefix, id, activity_code) {
        this.id = id;
        this.activity_code = activity_code;
        this.form = document.getElementById(prefix + "-form-" + this.id);
        this.btn = document.getElementById(prefix + "-sumbit-" + this.id);
        this.msg = document.getElementById(prefix + "-error-message-" + this.id);
        this.spinner = document.getElementById(prefix + "-spinner-" + this.id);
        this.init();
    }

    init() {
        this.onSubmit = this.onSubmit.bind(this);
        this.form.addEventListener("submit", this.onSubmit, false);
        this.btn.classList.remove("disabled");
    }

    async api_call(data) {
        // TO BE DEFINED
    }

    local_save(data) {
        // TO BE DEFINED
    }

    async onSubmit(e) {
        this.loading_start();
        e.preventDefault();
        if (this.form.checkValidity()) {
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

}


class FormSignup extends Form {

    async api_call(data) {
        return await api_user_activity_access(this.activity_code, data);
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
