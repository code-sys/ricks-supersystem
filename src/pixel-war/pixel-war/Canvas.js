class Canvas {
    static ENEMY_CREATION_TIME_VALUE = 1 * 60;
    static LOW_TIMING_EFFECT_VALUE = 5;
    static CLASS_LIST = {
        GAME_OVER: 'game-over',
        PAUSE: 'pause',
        SLOW_TIME: 'slowTime',
        INFO: 'info',
        INFO_ENERGY: 'info-energy',
        TEXT_INFO: 'text-info',
        VALUE_INFO: 'value-info',
        CELL: 'cell',
    };

    constructor(canvasId, nbrColumns, nbrRows, difficult) {
        this.document = document.querySelector('body');
        this.canvas = document.getElementById(canvasId);
        this._nbrColumns = nbrColumns;
        this._nbrRows = nbrRows;
        this._difficult = difficult;
        this.pause = false;
        this.fShot = true;
        this.setEvents();
    }

    set gameOver(value) {
        this._gameOver = value;
    }

    get gameOver() {
        return this._gameOver;
    }

    set nbrColumns(value) {
        this._nbrColumns = value;
    }

    get nbrColumns() {
        return this._nbrColumns;
    }

    set nbrRows(value) {
        this._nbrRows = value;
    }

    get nbrRows() {
        return this._nbrRows;
    }

    set difficult(value) {
        this._difficult = value;
    }

    get difficult() {
        return this._difficult;
    }

    init() {
        this.canvas.classList.remove(Canvas.CLASS_LIST.GAME_OVER);
        this.canvas.innerHTML = '';
        this.info = {};
        this.rows = [];
        this.enemies = [];
        this.shots = [];
        this.starship = new Starship(
            this.nbrRows,
            Math.round(this._nbrColumns / 2),
            this
        );
        this.enemyCreationTime = Canvas.ENEMY_CREATION_TIME_VALUE;
        this.enemiesToSpawn = 5;

        this._gameOver = false;
        this.lifes = 5;
        this.energySuperShot = this.createEnergyObj(1000, 5, 1);
        this.energyPortalShot = this.createEnergyObj(500, 10, 2);
        this.energyTimeControl = this.createEnergyObj(250, 20, 4);

        this.speedShot = Shot.speed;
        this.speedSuperShot = SuperShot.speed;
        this.speedPortalShot = PortalShot.speed;

        this.lowTimingEffect = 0;
        this.timeMultiplier = 3;
    }

    startNewGame() {
        this.init();
        this.generate();
        window.requestAnimationFrame(this.animate.bind(this));
    }

    pauseGame() {
        this.pause = true;
        this.canvas.classList.add(Canvas.CLASS_LIST.PAUSE);
    }

    startGame() {
        this.pause = false;
        this.canvas.classList.remove(Canvas.CLASS_LIST.PAUSE);
    }

    createEnergyObj(energy, cost, chargeTime) {
        chargeTime *= 60;

        return {
            energy,
            cost,
            chargeTime,
            stateChargeTime: chargeTime,
        }
    }

    selfShotMovement(direction, ShotType) {
        return new Promise(resolve => {
            this.shots.forEach(shot => {
                if (shot.type !== ShotType) {
                    return false;
                }

                shot.move(direction, () => shot.destroy());
            });

            resolve();
        });

    }

    setEvents() {
        this.document.addEventListener('keypress', this.moveStarship.bind(this));
        this.document.addEventListener('keyup', this.enableShot.bind(this));
    }

    moveStarship(e) {
        if (this.pause) {
            return false;
        }

        if (e.code == 'KeyA') {
            this.starship.move('left');
        } else if (e.code == 'KeyD') {
            this.starship.move('right');
        } else if (e.code == 'KeyJ') {
            if (!this.fShot) {
                return false;
            }

            this.fShot = false;
            this.starship.shot(this);
        } else if (e.code == 'KeyK') {
            if (!this.fShot) {
                return false;
            }

            this.fShot = false;
            this.starship.superShot(this);
        } else if (e.code == 'KeyH') {
            if (!this.fShot) {
                return false;
            }

            this.fShot = false;
            this.starship.portalShot(this);
        } else if (e.code == 'KeyN') {
            const info = this.energyTimeControl;

            if (info.energy < info.cost) {
                return false;
            }

            info.energy -= info.cost;
            this.lowTimingEffect += Canvas.LOW_TIMING_EFFECT_VALUE;
        }
    }

    enableShot(e) {
        if (this.pause) {
            return false;
        }

        if (
            e.code == 'KeyJ' ||
            e.code == 'KeyK' ||
            e.code == 'KeyH' ||
            e.code == 'KeyN'
        ) {
            this.fShot = true;
        }
    }

    async animate() {
        if (this._gameOver) {
            this.canvas.classList.add(Canvas.CLASS_LIST.GAME_OVER);
            return false;
        }

        if (!this.pause) {
            await this.updateEnergyValues();
            await this.moveShots();
            await this.destroyEntities();

            if (--this.enemyCreationTime <= 0) {
                await this.spawnEnemies()

                if (this.lowTimingEffect > 0) {
                    this.canvas.classList.add(Canvas.CLASS_LIST.SLOW_TIME);
                    this.enemyCreationTime = Canvas.ENEMY_CREATION_TIME_VALUE * this.timeMultiplier;
                    --this.lowTimingEffect;
                } else {
                    this.canvas.classList.remove(Canvas.CLASS_LIST.SLOW_TIME);
                    this.enemyCreationTime = Canvas.ENEMY_CREATION_TIME_VALUE;
                }
            }

            await this.destroyEntities();
            await this.clearCanvas();
            await this.paintEnemies();
            await this.paintShots();
            this.updateInfoEnergy();
            this.starship.paint(this);
        }

        window.requestAnimationFrame(this.animate.bind(this))
    }

    updateEnergyValues() {
        if (--this.energySuperShot.stateChargeTime <= 0) {
            this.energySuperShot.stateChargeTime = this.energySuperShot.chargeTime;
            this.energySuperShot.energy += 1;
        }

        if (--this.energyPortalShot.stateChargeTime <= 0) {
            this.energyPortalShot.stateChargeTime = this.energyPortalShot.chargeTime;
            this.energyPortalShot.energy += 1;
        }

        if (--this.energyTimeControl.stateChargeTime <= 0) {
            this.energyTimeControl.stateChargeTime = this.energyTimeControl.chargeTime;
            this.energyTimeControl.energy += 1;
        }
    }

    async moveShots() {
        if (--this.speedShot <= 0) {
            await this.selfShotMovement('top', PixelWar.ENTITY.SHOT);
            this.speedShot = Shot.speed;
        }

        if (--this.speedSuperShot <= 0) {
            await this.selfShotMovement('top', PixelWar.ENTITY.SUPER_SHOT);
            this.speedSuperShot = SuperShot.speed;
        }

        if (--this.speedPortalShot <= 0) {
            await this.selfShotMovement('top', PixelWar.ENTITY.PORTAL_SHOT);
            this.speedPortalShot = PortalShot.speed;
        }
    }

    updateInfoEnergy() {
        const {
            lifes,
            energySuperShot: { value: valSG },
            energyPortalShot: { value: valPG },
            energyTimeControl: { value: valTC },
        } = this.info;

        lifes.value.textContent = this.lifes;
        valSG.textContent = this.energySuperShot.energy;
        valPG.textContent = this.energyPortalShot.energy;
        valTC.textContent = this.energyTimeControl.energy;
    }

    destroyEntities() {
        return new Promise(resolve => {
            for (let enemyIdx = this.enemies.length - 1; enemyIdx >= 0; --enemyIdx) {
                const enemy = this.enemies[enemyIdx];

                if (
                    enemy.row === this.starship.row &&
                    enemy.col === this.starship.col
                ) {
                    this.lifes = 0;
                    this.gameOver = true;
                    break;
                }

                for (let shot of this.shots) {
                    if (
                        shot.row !== enemy.row ||
                        shot.col !== enemy.col
                    ) {
                        continue;
                    }

                    const enemyLife = enemy.life;
                    enemy.reduceLife(shot.damage);
                    shot.reduceDamage(enemyLife);

                    if (enemy.life <= 0) {
                        enemy.destroy();
                        break;
                    }

                    if (shot.damage <= 0) {
                        shot.destroy();
                    }
                }
            }

            resolve();
        });
    }

    destroy(entity, id) {
        const propertyName = this.getPropertyNameForEntity(entity);

        if (propertyName.length === 0) {
            return false;
        }

        const idxEntity = this[propertyName].findIndex(el => el.id === id);
        this[propertyName].splice(idxEntity, 1);
    }

    getPropertyNameForEntity(entity) {
        if (PixelWar.ENTITY.ENEMY === entity) {
            return 'enemies';
        }

        if (
            PixelWar.ENTITY.SHOT === entity ||
            PixelWar.ENTITY.SUPER_SHOT === entity ||
            PixelWar.ENTITY.PORTAL_SHOT === entity
        ) {
            return 'shots';
        }

        return '';
    }

    paintShots() {
        this.shots.forEach(shot => shot.paint(this));
    }

    paintEnemies() {
        this.enemies.forEach(enemy => enemy.paint(this));
    }

    clearCanvas() {
        this.rows.forEach(row => row.cells.forEach(
            cell => cell.element.innerHTML = ''
        ));
    }

    generate() {
        this.createInfo();
        this.createCells();
        this.paintCells();
        this.paintInfo();
    }

    createInfo() {
        const info = document.createElement('div');
        info.classList.add(Canvas.CLASS_LIST.INFO);
        const lifes = this.createEnergyInfo(
            'Lifes', this.lifes
        );
        const energySuperShot = this.createEnergyInfo(
            'Energy Super Shot', this.energySuperShot.energy
        );
        const energyPortalShot = this.createEnergyInfo(
            'Energy Portal Shot', this.energyPortalShot.energy
        );
        const energyTimeControl = this.createEnergyInfo(
            'Energy Time Control', this.energyTimeControl.energy
        );

        info.appendChild(lifes.el);
        info.appendChild(energySuperShot.el);
        info.appendChild(energyPortalShot.el);
        info.appendChild(energyTimeControl.el);

        this.info = {
            el: info,
            lifes,
            energySuperShot,
            energyPortalShot,
            energyTimeControl,
        }
    }

    createEnergyInfo(text, value) {
        const div = document.createElement('div');
        div.classList.add(Canvas.CLASS_LIST.INFO_ENERGY)

        const spanText = document.createElement('span');
        spanText.classList.add(Canvas.CLASS_LIST.TEXT_INFO);
        spanText.textContent = text;

        const spanValue = document.createElement('span');
        spanValue.classList.add(Canvas.CLASS_LIST.VALUE_INFO);
        spanValue.textContent = value;

        div.appendChild(spanText);
        div.appendChild(spanValue);

        return {
            el: div,
            text: spanText,
            value: spanValue,
        }
    }

    paintInfo() {
        this.canvas.appendChild(this.info.el);
    }

    createCells() {
        for (let row = 0; row < this.nbrRows; ++row) {
            const r = row + 1;

            for (let column = 0; column < this._nbrColumns; ++column) {
                const c = column + 1;
                const cell = document.createElement("div");
                cell.classList.add(Canvas.CLASS_LIST.CELL);

                // Con propósito de información
                cell.dataset.row = r;
                cell.dataset.col = c;

                this.pushCell({
                    row: r,
                    col: c,
                    element: cell,
                });
            }
        }
    }

    pushCell(cell) {
        const rowIdx = this.getRowIdx(cell.row);

        if (rowIdx === undefined) {
            this.rows.push({
                row: cell.row,
                cells: [cell],
            });
            return false;
        }

        this.rows[rowIdx].cells.push(cell);
    }

    paintCells() {
        this.rows.forEach((row) => {
            row.cells.forEach((cell) => {
                this.canvas.appendChild(cell.element);
            });
        });
    }

    getRowIdx(row) {
        let rowIdx = undefined;

        this.rows.some((rowObj, idx) => {
            if (rowObj.row == row) {
                rowIdx = idx;
                return true;
            }
        });

        return rowIdx;
    }

    getCellIdx(row, col) {
        const rowIdx = this.getRowIdx(row);
        let cellIdx = undefined;

        if (rowIdx === undefined) {
            return undefined;
        }

        this.rows[rowIdx].cells.some((cell, idx) => {
            if (cell.col == col) {
                cellIdx = idx;
                return true;
            }
        });

        if (cellIdx === undefined) {
            return undefined;
        }

        return { rowIdx, cellIdx };
    }

    async spawnEnemies() {
        await this.moveEnemiesForward();
        const enemies = await this.createEnemies();
        await this.addEnemies(enemies);
    }

    async createEnemies() {
        const enemies = [];
        const rangeEnemies = await this.calcRangeEnemies();
        let totalEnemies = Random.generate(rangeEnemies.min, rangeEnemies.max);

        if (totalEnemies > this._nbrColumns) {
            totalEnemies = this._nbrColumns;
        }

        await new Promise(async (resolve) => {
            const colsUsed = [];

            for (let e = 1; e <= totalEnemies; e++) {
                let currentCol = Random.generate(1, this._nbrColumns);
                let maxAttempts = 10 * this._nbrColumns;

                while (
                    colsUsed.some(colUsed => colUsed == currentCol) &&
                    --maxAttempts > 0
                ) {
                    currentCol = Random.generate(1, this._nbrColumns);
                }

                colsUsed.push(currentCol);

                const enemy = new Enemy(1, currentCol, this);
                enemies.push(enemy);

                if (e === totalEnemies) {
                    resolve();
                }
            }
        });

        return enemies;
    }

    calcRangeEnemies() {
        switch (this._difficult) {
            case PixelWar.DIFFICULT.EASY: return {min: 3, max: 6};
            case PixelWar.DIFFICULT.NORMAL: return {min: 7, max: 10};
            case PixelWar.DIFFICULT.HARD: return {min: 11, max: 14};
            default: return {min: 3, max: 6};
        }
    }

    addEnemies(enemies) {
        enemies.forEach((enemie) => {
            this.enemies.push(enemie);
        });
    }

    moveEnemiesForward() {
        return new Promise(resolve => {
            this.enemies.forEach(enemy => enemy.move('bottom', () => {
                enemy.destroy();

                if (this.lifes > 0 && --this.lifes <= 0) {
                    this._gameOver = true;
                }
            }));

            resolve();
        });
    }
}
