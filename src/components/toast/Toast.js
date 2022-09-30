class Toast {
    static TOAST_SUCCESS = 'toast-success';
    static TOAST_ERROR = 'toast-error';

    constructor(text, config = {}) {
        this.container = document.querySelector('.toast-container') ?? this.createContainer();
        this.text = text;
        this.type = config.type ?? null;
        this.autoclose = config.autoclose ?? true;
        this.duration = 1000 * (config.duration ?? 8);
        this.autocloseTimeout = undefined;
        this.create();
    }

    createContainer() {
        const container = document.createElement('div');
        container.classList.add('toast-container');
        document.querySelector('body').appendChild(container);
        return container;
    }

    create() {
        const toast = document.createElement('div');
        const body = document.createElement('div')
        const btnClose = document.createElement('button')

        body.classList.add('toast-body');
        body.innerHTML = this.text;

        btnClose.classList.add('toast-btn-close');
        btnClose.innerHTML = '&#x2716;';
        btnClose.addEventListener('click', () => this.removeToast(toast));

        toast.classList.add('toast', 'bounceInLeft', 'animated');
        toast.appendChild(body);
        toast.appendChild(btnClose);

        if (this.type) {
            toast.classList.add(this.type);
        }

        if (this.autoclose) {
            this.autocloseTimeout = setTimeout(
                () => this.removeToast(toast),
                this.duration
            );
        }

        this.container.appendChild(toast);
    }

    removeToast(toast) {
        if (this.autocloseTimeout) {
            clearTimeout(this.autocloseTimeout);
        }

        toast.classList.remove('bounceInLeft');
        toast.classList.add('bounceOutLeft');
        setTimeout(() => toast.remove(), 500);
    }
}
