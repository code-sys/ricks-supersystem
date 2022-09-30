class SuperShot extends Shot {
    static speed = 0.015 * 60;

    constructor(row, col, canvas) {
        super(row, col, canvas);
        this.type = PixelWar.ENTITY.SUPER_SHOT;
        this.damage = this.calcDamage();
    }

    calcDamage() {
        switch (this.canvas.difficult) {
            case PixelWar.DIFFICULT.EASY: return 8;
            case PixelWar.DIFFICULT.NORMAL: return 4;
            case PixelWar.DIFFICULT.HARD: return 2;
            default: return 8;
        }
    }
}
