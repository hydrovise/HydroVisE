class JSONReader {
    constructor(completed = null) {
        this.onCompleted = completed;
        this.result = undefined;
        this.input = document.createElement('input');
        this.input.type = 'file';
        this.input.accept = 'text/json|application/json';
        this.input.addEventListener('change', this.onChange.bind(this), false);
        this.input.style.display = 'none';
        document.body.appendChild(this.input);
        this.input.click();
    }

    destroy() {
        this.input.removeEventListener('change', this.onChange.bind(this), false);
        document.body.removeChild(this.input);
    }

    onChange(event) {
        if (event.target.files.length > 0) {
            this.readJSON(event.target.files[0]);
        }
    }

    readJSON(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target.readyState === 2) {
                this.result = JSON.parse(reader.result);
                if (typeof this.onCompleted === 'function') {
                    this.onCompleted(this.result);
                }
                this.destroy();
            }
        };
        reader.readAsText(file);
    }

    static read(callback = null) {
        return new JSONReader(callback);
    }
}