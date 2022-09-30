class PortalShot extends Shot {
    static speed = 0.015 * 60;

    constructor(row, col, canvas) {
        super(row, col, canvas);
        this.type = PixelWar.ENTITY.PORTAL_SHOT;
        this.damage = this.calcDamage();
        this.maxMovement = Math.round(canvas.nbrRows / 2);
    }

    calcDamage() {
        switch (this.canvas.difficult) {
            case PixelWar.DIFFICULT.EASY: return 60;
            case PixelWar.DIFFICULT.NORMAL: return 40;
            case PixelWar.DIFFICULT.HARD: return 20;
            default: return 60;
        }
    }
}
