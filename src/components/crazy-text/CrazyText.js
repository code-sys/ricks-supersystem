/**
 * Genera un texto animado, cada letra es animada con
 * parámetros aleatorios.
 *
 * Dependencias:
 *  + utils:
 *      - Random
 */
class CrazyText {
    constructor(containerId, text) {
        this.container = document.getElementById(containerId);
        this.text = text;
        this.animationsList = this.getAnimationsList();
        this.prevAnimation = 0;
        this.totalAnimations = 5;
        this.animationDuration = 1;
        this.init();
    }

    init() {
        for (let letter of this.text) {
            const animatedLetter = this.makeAnimatedLetter(letter);
            this.container.appendChild(animatedLetter);
        }
    }

    makeAnimatedLetter(letter) {
        const span = document.createElement('span');
        span.textContent = letter;

        if (letter.trim().length === 0) {
            return span;
        }

        this.setAnimation(span);

        setInterval(() => {
            this.setAnimation(span);
        }, 1000);

        return span;
    }

    setAnimation(span) {
        let animation = Random.generate(1, this.totalAnimations);

        if (this.prevAnimation === animation) {
            animation = animation < this.totalAnimations
                ? animation + 1
                : animation - 1;
        }

        this.prevAnimation = animation;

        const timingFunction = this.animationsList[Random.generate(0, this.animationsList.length) - 1];
        span.classList.add('animateCrazyText');
        span.setAttribute(
            'style',
            `animation-name: crazyTextAnimation${animation}; animation-duration: ${this.animationDuration}s; animation-timing-function: ${timingFunction};`
        );
    }

    getAnimationsList() {
        return [
            'linear',
            'ease',
            'ease-in',
            'ease-out',
            'ease-in-out',
        ];
    }
}