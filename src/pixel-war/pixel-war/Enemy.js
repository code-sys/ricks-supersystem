class Enemy extends Entity {
    constructor(row, col, canvas) {
        super(row, col, canvas);
        this.type = PixelWar.ENTITY.ENEMY;

        const rangeLife = this.calcLife();

        this.life = Random.generate(rangeLife.min, rangeLife.max);
    }

    calcLife() {
        switch (this.canvas.difficult) {
            case PixelWar.DIFFICULT.EASY: return {min: 1, max: 2};
            case PixelWar.DIFFICULT.NORMAL: return {min: 1, max: 3};
            case PixelWar.DIFFICULT.HARD: return {min: 1, max: 4};
            default: return {min: 1, max: 2};
        }
    }
}
