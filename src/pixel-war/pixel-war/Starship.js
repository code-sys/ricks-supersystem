class Starship extends Entity {
    constructor(row, col, canvas) {
        super(row, col, canvas);
        this.type = PixelWar.ENTITY.STARSHIP;
    }

    shot() {
        const shot = new Shot(this.row - 1, this.col, this.canvas);
        this.canvas.shots.push(shot);
    }

    superShot() {
        const info = this.canvas.energySuperShot;

        if (info.energy < info.cost) {
            return false;
        }

        info.energy -= info.cost;

        const shot = new SuperShot(this.row - 1, this.col, this.canvas);
        this.canvas.shots.push(shot);
    }

    portalShot() {
        const info = this.canvas.energyPortalShot;

        if (info.energy < info.cost) {
            return false;
        }

        info.energy -= info.cost;

        const shot = new PortalShot(this.row - 1, this.col, this.canvas);
        this.canvas.shots.push(shot);
    }
}
