class Entity {
    constructor(row, col, canvas) {
        this.id = crypto.randomUUID();
        this.row = row;
        this.col = col;
        this.canvas = canvas;
        this.type = '';
        this.life = undefined;
        this.damage = 0;
        this.maxMovement = null;
    }

    async paint() {
        const cell = await this.getCell();
        const div = await this.createDiv();
        cell.element.appendChild(div);
    }

    destroy() {
        this.canvas.destroy(this.type, this.id);
    }

    getCell() {
        const idxs = this.canvas.getCellIdx(this.row, this.col);
        return this.canvas.rows[idxs.rowIdx].cells[idxs.cellIdx];
    }

    createDiv() {
        const div = document.createElement('div');
        div.classList.add(this.type);
        if (this.life !== undefined) {
            div.textContent = this.life;
        }
        return div;
    }

    async move(direction, funcUndefinedIndxs = undefined) {
        if (this.maxMovement !== null) {
            if (this.maxMovement === 0) {
                return false;
            }

            --this.maxMovement;
        }

        const nextRowCol = await this.nextRowCol(direction);

        if (nextRowCol === undefined) {
            return false;
        }

        const idxs = await this.getCellIdx(direction, nextRowCol);

        if (idxs === undefined) {
            if (funcUndefinedIndxs !== undefined) {
                funcUndefinedIndxs();
            }

            return false;
        }

        this.updateColRow(direction, nextRowCol);
    }

    getCellIdx(direction, nextRowCol) {
        if (["left", "right"].includes(direction)) {
            return this.canvas.getCellIdx(this.row, nextRowCol);
        } else if (["top", "bottom"].includes(direction)) {
            return this.canvas.getCellIdx(nextRowCol, this.col);
        }

        return undefined;
    }

    getCurrentCell(direction, idxs) {
        if (["left", "right"].includes(direction)) {
            return this.canvas.rows[idxs.rowIdx].cells[
                this.currentIdx(direction, idxs)
            ];
        } else if (["top", "bottom"].includes(direction)) {
            return this.canvas.rows[this.currentIdx(direction, idxs)].cells[
                idxs.cellIdx
            ];
        }

        return undefined;
    }

    updateColRow(direction, nextRowCol) {
        if (["left", "right"].includes(direction)) {
            this.col = nextRowCol;
        } else if (["top", "bottom"].includes(direction)) {
            this.row = nextRowCol;
        }
    }

    nextRowCol(direction) {
        switch (direction) {
            case "right":
                return this.col + 1;
            case "left":
                return this.col - 1;
            case "top":
                return this.row - 1;
            case "bottom":
                return this.row + 1;
            default:
                return undefined;
        }
    }

    currentIdx(direction, idxs) {
        switch (direction) {
            case "right":
                return idxs.cellIdx - 1;
            case "left":
                return idxs.cellIdx + 1;
            case "top":
                return idxs.rowIdx + 1;
            case "bottom":
                return idxs.rowIdx - 1;
            default:
                return idxs.cellIdx;
        }
    }

    async reduceLife(damage) {
        if (this.life === undefined) {
            return false;
        }

        this.life -= this.life > damage ? damage : this.life;

        if (this.life > 0) {
            const cell = await this.getCell();
            const div = await this.createDiv();
            cell.element.appendChild(div);
        }
    }

    reduceDamage(enemyLife) {
        if (this.damage <= 0) {
            return false;
        }

        this.damage -= this.damage > enemyLife ? enemyLife : this.damage;
    }
}
