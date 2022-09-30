class Shot extends Entity {
    static speed = 0.01672 * 60;

    constructor(row, col, canvas) {
        super(row, col, canvas);
        this.type = PixelWar.ENTITY.SHOT;
        this.damage = 1;
    }
}
