class PixelWar {
    static CANVAS_ID = "canvas";
    static DIFFICULT = {
        EASY: 'easy',
        NORMAL: 'normal',
        HARD: 'hard'
    };
    static TOTAL_COLUMNS_DEFAULT_VALUE = 11;
    static TOTAL_ROWS_DEFAULT_VALUE = 20;
    static LIMIT_TOTAL_COLUMNS = {
        min: 5,
        max: 50,
    };
    static LIMIT_TOTAL_ROWS = {
        min: 10,
        max: 30,
    };
    static CELL_SIZE = {
        width: 1,
        height: 1
    };
    static ENTITY = {
        STARSHIP: 'starship',
        SHOT: 'shot',
        SUPER_SHOT: 'super-shot',
        PORTAL_SHOT: 'portal-shot',
        ENEMY: 'enemy',
    };
    static CLASS_LIST = {
        GAME_CONTAINER: 'game-container',
        CANVAS: 'canvas',
        CONTROLS: 'controls',
        CBXS_CANVAS_SIZE: 'cbxs-canvas-size',
        CBX_DIFFICULT_GAME: 'cbx-difficult-game',
        BTN_START_GAME:  'btn-start-game',
        PLAYING: 'playing',
        BTN_PAUSE_GAME: 'btn-pause-game',
        BTN_NEW_GAME: 'btn-new-game',
        BTN_HELP_GAME: 'btn-help-game',
        GAME_MODAL: 'game-modal',
        GAME_MODAL_SIZE_MEDIUM: 'game-modal-md',
        GAME_MODAL_CONTAINER: 'game-modal-container',
        GAME_MODAL_HEADER: 'game-modal-header',
        GAME_MODAL_BODY: 'game-modal-body',
        GAME_MODAL_FOOTER: 'game-modal-footer',
        GAME_MODAL_HIDDEN: 'game-modal-hidden',
        GAME_MODAL_BTN_CLOSE: 'game-modal-btn-close',
    };
    static TEXT_CONENT_LIST = {
        PAUSE: 'Pausar',
        PLAY: 'Jugar',
        CONTINUE: 'Continuar',
        NEW_GAME: 'Nuevo juego',
        HELP_GAME: '?',
        GAME_MODAL_BTN_HEADER_CLOSE: '&#x2716;',
        GAME_MODAL_BTN_FOOTER_CLOSE: 'Cerrar',
    };

    constructor(gameContainerId) {
        this.document = document.querySelector('body');
        this.objCanvas = undefined;
        this.gameContainer = document.getElementById(gameContainerId)
        this.canvas = this.createCanvas();
        this.gameHelpModal = this.createGameHelpModal();
        this.controlsGame = this.createControlsGame();

        this.gameContainer.classList.add(PixelWar.CLASS_LIST.GAME_CONTAINER);
        this.gameContainer.appendChild(this.canvas);
        this.gameContainer.appendChild(this.controlsGame);

        this.document.appendChild(this.gameHelpModal.el);
    }

    createCanvas() {
        const canvas = document.createElement('div');
        canvas.classList.add(PixelWar.CLASS_LIST.CANVAS);
        canvas.setAttribute('id', PixelWar.CANVAS_ID);
        return canvas;
    }

    createControlsGame() {
        const div = document.createElement('div');
        const containerCanvasSize = this.createContainerCanvasSize();
        const cbxDifficultGame = this.createCbxDifficultGame();
        const btnStartGame = this.createBtnStartGame(cbxDifficultGame, containerCanvasSize);
        const btnPauseGame = this.createBtnPauseGame();
        const btnNewGame = this.createBtnNewGame(btnPauseGame);
        const btnHelp = this.createBtnHelp();

        div.classList.add(PixelWar.CLASS_LIST.CONTROLS);
        div.appendChild(containerCanvasSize.el);
        div.appendChild(cbxDifficultGame);
        div.appendChild(btnStartGame);
        div.appendChild(btnPauseGame);
        div.appendChild(btnNewGame);
        div.appendChild(btnHelp);

        return div;
    }

    createContainerCanvasSize() {
        const div = document.createElement('div');
        const cbxTotalCols = document.createElement('select');
        const cbxTotalRows = document.createElement('select');

        this.addOptionsToCbxByRange(
            cbxTotalCols,
            PixelWar.LIMIT_TOTAL_COLUMNS,
            'Columnas ',
            PixelWar.TOTAL_COLUMNS_DEFAULT_VALUE
        );
        this.addOptionsToCbxByRange(
            cbxTotalRows,
            PixelWar.LIMIT_TOTAL_ROWS,
            'Filas ',
            PixelWar.TOTAL_ROWS_DEFAULT_VALUE
        );

        div.classList.add(PixelWar.CLASS_LIST.CBXS_CANVAS_SIZE);
        div.appendChild(cbxTotalCols);
        div.appendChild(cbxTotalRows);

        return {
            el: div,
            cbxTotalCols,
            cbxTotalRows,
        };
    }

    addOptionsToCbxByRange(cbx, range, concatValue = null, defaultSelect = 1) {
        for (let value = range.min; value <= range.max; ++value) {
            const option = document.createElement('option');
            option.setAttribute('value', value);
            option.textContent = `${concatValue}${value}`;

            if (value === defaultSelect) {
                option.setAttribute('selected', 'true');
            }

            cbx.appendChild(option);
        }
    }

    createCbxDifficultGame() {
        const select = document.createElement('select');
        select.classList.add(PixelWar.CLASS_LIST.CBX_DIFFICULT_GAME);
        select.innerHTML = `
            <option value="${PixelWar.DIFFICULT.EASY}">Fácil</option>
            <option value="${PixelWar.DIFFICULT.NORMAL}">Normal</option>
            <option value="${PixelWar.DIFFICULT.HARD}">Difícil</option>
        `;

        return select;
    }

    createBtnStartGame(cbxDifficultGame, { cbxTotalCols, cbxTotalRows }) {
        const btn = document.createElement('button');
        btn.classList.add(PixelWar.CLASS_LIST.BTN_START_GAME);
        btn.setAttribute('type', 'button');
        btn.textContent = PixelWar.TEXT_CONENT_LIST.PLAY;
        btn.addEventListener('click', () => {
            const canvasWidth = cbxTotalCols.value * PixelWar.CELL_SIZE.width;
            const canvasHeight = cbxTotalRows.value * PixelWar.CELL_SIZE.height;
            canvas.setAttribute('style', `width: ${canvasWidth}rem; height: ${canvasHeight}rem`);

            if (this.objCanvas === undefined) {
                this.objCanvas = new Canvas(
                    PixelWar.CANVAS_ID,
                    parseInt(cbxTotalCols.value),
                    parseInt(cbxTotalRows.value),
                    cbxDifficultGame.value
                );
            } else {
                this.objCanvas.nbrColumns = parseInt(cbxTotalCols.value);
                this.objCanvas.nbrRows = parseInt(cbxTotalRows.value);
                this.objCanvas.difficult = cbxDifficultGame.value;
            }

            this.objCanvas.startNewGame();
            this.gameContainer.classList.add(PixelWar.CLASS_LIST.PLAYING);
        });

        return btn;
    }

    createBtnPauseGame() {
        const btn = document.createElement('button');
        btn.classList.add(PixelWar.CLASS_LIST.BTN_PAUSE_GAME);
        btn.setAttribute('type', 'button');
        btn.textContent = PixelWar.TEXT_CONENT_LIST.PAUSE;
        btn.addEventListener('click', () => {
            if (this.objCanvas.gameOver) {
                return false;
            }

            if (this.objCanvas.pause) {
                btn.textContent = PixelWar.TEXT_CONENT_LIST.PAUSE;
                this.objCanvas.startGame();
            } else {
                btn.textContent = PixelWar.TEXT_CONENT_LIST.CONTINUE;
                this.objCanvas.pauseGame();
            }
        });

        return btn;
    }

    createBtnNewGame(btnPauseGame) {
        const btn = document.createElement('button');
        btn.classList.add(PixelWar.CLASS_LIST.BTN_NEW_GAME);
        btn.setAttribute('type', 'button');
        btn.textContent = PixelWar.TEXT_CONENT_LIST.NEW_GAME;
        btn.addEventListener('click', () => {
            this.objCanvas.gameOver = true;
            this.objCanvas.startGame();
            this.gameContainer.classList.remove(PixelWar.CLASS_LIST.PLAYING);
            btnPauseGame.textContent = PixelWar.TEXT_CONENT_LIST.PAUSE;
        });

        return btn;
    }

    createBtnHelp() {
        const btn = document.createElement('button');
        btn.classList.add(PixelWar.CLASS_LIST.BTN_HELP_GAME);
        btn.textContent = PixelWar.TEXT_CONENT_LIST.HELP_GAME;
        btn.addEventListener('click', () => this.gameHelpModal.open());
        return btn;
    }

    createGameHelpModal() {
        const actions = {
            open: () => this.objCanvas?.pauseGame(),
            close: () => this.objCanvas?.startGame()
        };
        const modalGame = this.createGameModal(
            PixelWar.CLASS_LIST.GAME_MODAL_SIZE_MEDIUM,
            'AYUDA DEL JUEGO',
            actions
        );

        modalGame.body.innerHTML = `
            <strong>Movimiento</strong>
            <ul>
                <li>
                    <strong>Izquierda:</strong> A
                </li>
                <li>
                    <strong>Derecha:</strong> D
                </li>
            </ul>

            <br>

            <strong>Ataque</strong>
            <ul>
                <li>
                    <strong>Disparo normal:</strong> J
                </li>
                <li>
                    <strong>Super disparo:</strong> K<br>
                    <span style="font-size: .75rem;">
                        Varias veces más destructivo que un disparo normal.
                    </span>
                </li>
                <li>
                    <strong>Crear portal:</strong> H<br>
                    <span style="font-size: .75rem;">
                        El portal traga a tus enemigos pero tiene un límite,
                        varios disparos al mismo lugar aumenta la fuerza del portal.
                    </span>
                </li>
                <li>
                    <strong>Ralentizar el tiempo:</strong> N<br>
                    <span style="font-size: .75rem;">
                        Aumenta el tiempo que le toma a tus enemigos moverse y aparecer.
                    </span>
                </li>
            </ul>
        `;

        return modalGame;
    }

    createGameModal(size, headerText = '', actions = null) {
        const el = document.createElement('div');
        const container = document.createElement('div');
        const header = document.createElement('div');
        const body = document.createElement('div');
        const footer = document.createElement('div');
        const btnHeaderClose = document.createElement('button');
        const btnBodyClose = document.createElement('button');
        const modal = {
            el,
            header,
            body,
            footer,
            open() {
                el.classList.remove(PixelWar.CLASS_LIST.GAME_MODAL_HIDDEN);
                actions?.open();
            },
            close() {
                el.classList.add(PixelWar.CLASS_LIST.GAME_MODAL_HIDDEN);
                actions?.close();
            },
        };

        btnHeaderClose.classList.add(PixelWar.CLASS_LIST.GAME_MODAL_BTN_CLOSE);
        btnHeaderClose.addEventListener('click', () => modal.close());
        btnHeaderClose.innerHTML = PixelWar.TEXT_CONENT_LIST.GAME_MODAL_BTN_HEADER_CLOSE;

        btnBodyClose.classList.add(PixelWar.CLASS_LIST.GAME_MODAL_BTN_CLOSE);
        btnBodyClose.addEventListener('click', () => modal.close());
        btnBodyClose.innerHTML = PixelWar.TEXT_CONENT_LIST.GAME_MODAL_BTN_FOOTER_CLOSE;

        header.classList.add(PixelWar.CLASS_LIST.GAME_MODAL_HEADER);
        header.innerHTML = headerText;
        header.appendChild(btnHeaderClose);

        body.classList.add(PixelWar.CLASS_LIST.GAME_MODAL_BODY);

        footer.classList.add(PixelWar.CLASS_LIST.GAME_MODAL_FOOTER);
        footer.appendChild(btnBodyClose);

        container.classList.add(PixelWar.CLASS_LIST.GAME_MODAL_CONTAINER);
        container.appendChild(header);
        container.appendChild(body);
        container.appendChild(footer);

        el.classList.add(PixelWar.CLASS_LIST.GAME_MODAL, size);
        el.appendChild(container);

        return modal;
    }
}
