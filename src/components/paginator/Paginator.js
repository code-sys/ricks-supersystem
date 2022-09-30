class Paginator {
    static CLASSESS = {
        SHOW_PAGE_SELECT: 'showing-page-select',
        DISPLAYED_PAGE_SELECT: 'displayed-page-select',
    };

    static DIRECTIONS = {
        UP: 'up',
        DOWN: 'down',
        LEFT: 'left',
        RIGHT: 'right'
    };

    static ANIMATIONS_TIME = {
        PAGE_SELECT: 750,
        PAGE_SELECT_WITHOUT_ANIMATION: 250,
    };

    static NBR_BTNS_TO_SHOW_VALUE = 5;

    static TIMEOUT_CALL_ACTION_VALUE = 400;

    constructor (config) {
        this.action = config.action;
        this.timeoutCallAction = undefined;
        this.timeoutCallActionActive = false;

        this.flags = {
            animatingPageButtons: false,
        };

        this.cache = {
            currentPage: {
                page: config.currentPage,
                rangeButtons: null,
            },
        };

        this.totalPages = config.totalPages;
        this.currentPage = config.currentPage;
        this.btnHeight = 2.5;
        this.btnWidth = this.btnHeight;
        this.nbrBtnsToShow = this.totalPages < Paginator.NBR_BTNS_TO_SHOW_VALUE
            ? this.totalPages
            : Paginator.NBR_BTNS_TO_SHOW_VALUE;
        this.pageSelectHeight = this.btnHeight * (this.nbrBtnsToShow + 2);
        this.pageSelectTop = this.pageSelectHeight * -1;
        this.pagesContainerHeight = this.btnHeight * this.nbrBtnsToShow;

        this.initDomElements(config.paginatorId);
    }

    async initDomElements(paginatorId) {
        this.paginator = document.getElementById(paginatorId);
        this.paginator.classList.add('pagination');
        await this.createElements();
        await this.appendElements();
    }

    createElements() {
        this.btnPrevPg = this.makeControl(['prev-page', 'disabled'], '', {
            event: 'click',
            func: () => this.changePage(Paginator.DIRECTIONS.LEFT)
        });
        this.btnCurrentPg = this.makeControl(['current-page'], this.currentPage, {
            event: 'click',
            func: () => {
                this.cachingCurrentPage(this.currentPage);
                this.centerPage(this.currentPage);
                this.togglePageSelect();
            }
        });

        const classessBtnNextPg = ['next-page'];
        if (this.totalPages <= Paginator.NBR_BTNS_TO_SHOW_VALUE) {
            classessBtnNextPg.push('disabled');
        }
        this.btnNextPg = this.makeControl(
            classessBtnNextPg,
            '',
            {
                event: 'click',
                func: () => this.changePage(Paginator.DIRECTIONS.RIGHT)
            }
        );

        this.pageSelect = this.makeDiv(
            ['page-select'],
            [
                {
                    name: 'style',
                    value: `height: 0rem; top: 0rem`
                }
            ]
        );
        this.btnArrowUp = this.makeControl(['arrow-up', 'disabled'], '', {
            event: 'click',
            func: () => this.movePageButtons(Paginator.DIRECTIONS.UP)
        });
        this.pagesContainer = this.makeDiv(
            ['pages-container'],
            [
                {
                    name: 'style',
                    value: `height: ${this.pagesContainerHeight}rem`
                }
            ]
        );
        this.pagesGroup = this.makeDiv(['pages-group']);
        this.pageButtons = this.makePageButtons();

        const classessBtnArrowDown = ['arrow-down'];
        if (this.totalPages <= Paginator.NBR_BTNS_TO_SHOW_VALUE) {
            classessBtnArrowDown.push('disabled');
        }

        this.btnArrowDown = this.makeControl(
            classessBtnArrowDown,
            '',
            {
                event: 'click',
                func: () => this.movePageButtons(Paginator.DIRECTIONS.DOWN)
            }
        );
    }

    appendElements() {
        this.pageButtons.forEach(btn => this.pagesGroup.appendChild(btn));
        this.pagesContainer.appendChild(this.pagesGroup);

        this.pageSelect.appendChild(this.btnArrowUp);
        this.pageSelect.appendChild(this.pagesContainer);
        this.pageSelect.appendChild(this.btnArrowDown);

        this.paginator.appendChild(this.btnPrevPg);
        this.paginator.appendChild(this.btnCurrentPg);
        this.paginator.appendChild(this.btnNextPg);
        this.paginator.appendChild(this.pageSelect);
    }

    togglePageSelect() {
        if (this.flags.animatingPageButtons) {
            return false;
        }

        this.flags.animatingPageButtons = true;

        const { SHOW_PAGE_SELECT, DISPLAYED_PAGE_SELECT } = Paginator.CLASSESS;
        const pageSelectIsDisplayed = this.paginator.classList.contains(DISPLAYED_PAGE_SELECT);

        if (pageSelectIsDisplayed) {
            this.pageSelect.setAttribute('style', `height: 0rem; top: 0rem`);
        } else {
            this.paginator.classList.add(SHOW_PAGE_SELECT);
            this.pageSelect.setAttribute('style', `height: ${this.pageSelectHeight}rem; top: ${this.pageSelectTop}rem`);
        }

        setTimeout(
            () => {
                this.flags.animatingPageButtons = false;
                this.paginator.classList.toggle(DISPLAYED_PAGE_SELECT);
                if (pageSelectIsDisplayed) {
                    this.paginator.classList.toggle(SHOW_PAGE_SELECT);
                }
            },
            Paginator.ANIMATIONS_TIME.PAGE_SELECT
        );
    }

    makeElement(tag, classess, content = '', attrs = [], action = null) {
        const el = document.createElement(tag);
        el.classList.add(...classess);
        el.innerHTML = content;

        attrs.forEach(attr => el.setAttribute(attr.name, attr.value));

        if (action !== null) {
            el.addEventListener(action.event, action.func);
        }

        return el;
    }

    makeDiv(classess, attr = []) {
        return this.makeElement(
            'div',
            classess,
            '',
            attr
        );
    }

    makeControl(classess, content = '', action = null) {
        return this.makeElement(
            'a',
            ['control', ...classess],
            content,
            [{'name': 'href', 'value': 'javascript:void(0)'}],
            action,
        );
    }

    makePageButtons() {
        const pageButtons = [];

        for (let page = 1; page <= this.totalPages; ++page) {
            const classess = ['page'];

            if (page == this.currentPage) {
                classess.push('active');
            }

            pageButtons.push(this.makeControl(classess, page,
                {
                    event: 'click',
                    func: () => this.pageSelected(page)
                })
            );
        }

        return pageButtons;
    }

    changePage(direction) {
        const isLeft = direction === Paginator.DIRECTIONS.LEFT;
        const nextPage = isLeft
            ? this.currentPage - 1
            : this.currentPage + 1;

        if (
            (isLeft && nextPage < 1) ||
            (!isLeft && nextPage > this.totalPages)
        ) {
            return false;
        }

        this.cachingCurrentPage(nextPage);

        this.btnCurrentPg.textContent = nextPage;

        this.makePageButtonActive(nextPage, this.currentPage);
        this.callAction(nextPage);
        this.centerPage(nextPage);
        this.disableEnableBtnsSelectPage(nextPage);

        this.currentPage = nextPage;
    }

    pageSelected(page) {
        const strCssTransformBefore = this.pagesGroup.style.transform;

        this.makePageButtonActive(page, this.currentPage);
        this.callAction(page);
        this.centerPage(page);
        this.disableEnableBtnsSelectPage(page);

        const strCssTransformAfter = this.pagesGroup.style.transform;

        const timeoutValue = strCssTransformBefore != strCssTransformAfter
            ? Paginator.ANIMATIONS_TIME.PAGE_SELECT
            : Paginator.ANIMATIONS_TIME.PAGE_SELECT_WITHOUT_ANIMATION;

        setTimeout(() => {
            this.togglePageSelect()
        }, timeoutValue);
    }

    centerPage(page) {
        const rangePageButtons = this.calcPageButtonsRange(page);
        const yPosition = this.btnHeight * -(rangePageButtons.start - 1);

        this.pagesGroup.setAttribute(
            'style',
            `transform: translateY(${yPosition}rem)`
        );

        this.currentPage = page;
        this.btnCurrentPg.textContent = page;
    }

    disableEnableBtnsSelectPage(page) {
        const { start, end } = this.calcPageButtonsRange(page);

        this.btnPrevPg.classList.remove('disabled');
        this.btnNextPg.classList.remove('disabled');

        if (page == 1) {
            this.btnPrevPg.classList.add('disabled');
        }

        if (page == this.totalPages) {
            this.btnNextPg.classList.add('disabled');
        }

        this.disableEnableBtnsNavigationPage(start, end)
        this.disableEnableBtnsNavigationPage(start, end)
    }

    disableEnableBtnsNavigationPage(start, end) {
        this.btnArrowUp.classList.remove('disabled');
        this.btnArrowDown.classList.remove('disabled');

        if (start === 1) {
            this.btnArrowUp.classList.add('disabled');
        }

        if (end === this.totalPages) {
            this.btnArrowDown.classList.add('disabled');
        }
    }


    callAction(page) {
        if (this.timeoutCallActionActive) {
            clearTimeout(this.timeoutCallAction);
            this.timeoutCallActionActive = false;
        }

        this.timeoutCallActionActive = true;
        this.timeoutCallAction = setTimeout(() => {
            this.timeoutCallActionActive = false;
            this.action(page);
        }, Paginator.TIMEOUT_CALL_ACTION_VALUE);
    }

    makePageButtonActive(page, currentPage) {
        this.pageButtons[page - 1].classList.add('active');
        this.pageButtons[currentPage - 1].classList.remove('active');
    }

    movePageButtons(direction) {
        const isUp = direction === Paginator.DIRECTIONS.UP;
        let start = 0;
        let end = 0;

        if (this.cache.currentPage.rangeButtons === null) {
            const { start: rbStart, end: rgEnd } = this.calcPageButtonsRange(this.cache.currentPage.page);
            start = rbStart;
            end = rgEnd;
        } else {
            const { start: rbStart, end: rgEnd } = this.cache.currentPage.rangeButtons;
            start = rbStart;
            end = rgEnd;
        }

        let nextPage = isUp
            ? this.cache.currentPage.page - this.nbrBtnsToShow
            : this.cache.currentPage.page + this.nbrBtnsToShow;

        let cacheStart = isUp ? start - this.nbrBtnsToShow : start + this.nbrBtnsToShow;
        let cacheEnd = isUp ? end - this.nbrBtnsToShow : end + this.nbrBtnsToShow;
        let nextStartPage = isUp
            ? start - this.nbrBtnsToShow
            : end + 1;

        if (isUp && cacheStart < 1) {
            nextPage = this.cache.currentPage.page;
            nextStartPage = 1;
            cacheStart = 1;
            cacheEnd = this.nbrBtnsToShow;
        } else if (!isUp && cacheEnd > this.totalPages) {
            nextPage = this.cache.currentPage.page;
            nextStartPage -= cacheEnd - this.totalPages;
            cacheStart = nextStartPage;
            cacheEnd = this.totalPages;
        }

        const yPosition = (this.btnHeight * (nextStartPage - 1)) * -1;

        this.cache.currentPage.page = nextPage;
        this.cache.currentPage.rangeButtons = {
            start: cacheStart,
            end: cacheEnd
        };

        this.disableEnableBtnsNavigationPage(cacheStart, cacheEnd);

        this.pagesGroup.setAttribute(
            'style',
            `transform: translateY(${yPosition}rem)`
        );
    }

    calcPageButtonsRange(page) {
        const mod = this.nbrBtnsToShow % 2;
        const half = Math.floor(this.nbrBtnsToShow / 2);
        let start = mod !== 0 ? page - half : page - half + 1;
        let end = page + half;

        end = start > 0 ? end : end + -start + 1;

        if (end > this.totalPages) {
            start -= end - this.totalPages;
            end = this.totalPages;
        }

        return {
            start: start > 0 ? start : 1,
            end,
        };
    }

    cachingCurrentPage(currentPage) {
        this.cache.currentPage = {
            page: currentPage,
            rangeButtons: null,
        };
    }
}
