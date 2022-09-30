const BASE_URL = 'https://rickandmortyapi.com/api/';
const charactersContainer = document.getElementById('characters-container');
const characterTemplate = document.getElementById('character-template');
const txtSearch = document.getElementById('txt-search');
const btnSearch = document.getElementById('btn-search');
const divLoadingCharacters = document.getElementById('loading-characters');

// Character detail
const characterDetail = document.getElementById('character-detail');
const cdBtnClose = characterDetail.querySelector('.cd-btn-close');
const cdName = characterDetail.querySelector('.cd-name');
const cdStatus = characterDetail.querySelector('.cd-status');
const cdImg = characterDetail.querySelector('.cd-img');
const cdProperties = characterDetail.querySelector('.cd-properties');
let objCdNameCrazyText = undefined;

const characters = { data: [] };
const handler = {
    get(target, key) {
        if (typeof target[key] === 'object' && target[key] !== null) {
            return new Proxy(target[key], handler)
        } else {
            return target[key];
        }
    },
    set: function(target, property, value, receiver) {
        target[property] = value;

        if (property === 'length') {
            return true;
        }

        charactersContainer.textContent = '';

        characters.data.forEach(character => {
            const template = characterTemplate.content.cloneNode(true);
            const container = template.querySelector('.character');
            const img = template.querySelector('.ch-img');
            const name = template.querySelector('.ch-name');
            const status = template.querySelector('.ch-status');

            img.setAttribute('style', `background-image: url(${character.image})`);
            name.textContent = character.name;

            status.classList.add(character.status.toLowerCase());
            status.textContent = character.status;

            charactersContainer.appendChild(template);
            container.addEventListener('click', () => showCharacterDetail(character));
        });

        return true;
    }
};
const charactersProxy = new Proxy(characters, handler);
let paginator = null;

txtSearch.addEventListener('keyup', (e) => {
    if (e.code === 'Enter') {
        btnSearch.click();
    }
});

btnSearch.addEventListener('click', async () => {
    const textToSearch = txtSearch.value.trim();

    if (textToSearch.length < 1) {
        new Toast('ingresa al menos 1 caracter para el nombre.');
        return false;
    }

    searchCharactersByName(textToSearch);
});

cdBtnClose.addEventListener('click', () => hideCharacterDetail());

new CrazyText('logo', "Rick's Supersystem");

async function searchCharactersByName(textToSearch, page = null) {
    divLoadingCharacters.classList.add('show');

    try {
        const url = page === null
            ? BASE_URL + `character/?name=${textToSearch}`
            : BASE_URL + `character/?page=${page}&name=${textToSearch}`;

        const response = await fetch(url);
        const responseData = await response.json();

        if ('error' in responseData) {
            new Toast('Sin resultados en la búsqueda.');
            return false;
        }

        const config = {
            totalPages: responseData.info.pages,
            currentPage: page ?? 1,
            paginatorId: 'paginator',
            action(page) {
                searchCharactersByName(textToSearch, page);
            }
        };

        charactersProxy.data = responseData.results;

        if (page === null) {
            if (paginator) {
                paginator.paginator.textContent = '';
                paginator.paginator.removeAttribute('class');
            }

            paginator = new Paginator(config, 'paginator');
        }

        new Toast(
            `Mostrando <strong>${responseData.results.length}</strong> items de
            <strong>${responseData.info.count}</strong>.`,
            { type: Toast.TOAST_SUCCESS }
        );
    } catch (error) {
        new Toast(
            `Ocurrió un error al realizar la búsqueda de <strong>${textToSearch}</strong>.
            Revisa tu conexión a internet.`,
            { type: Toast.TOAST_ERROR }
        );

        console.log(error);
    } finally {
        divLoadingCharacters.classList.remove('show');
    }
}

function hideCharacterDetail() {
    objCdNameCrazyText = undefined;
    characterDetail.classList.add('hidden');
    cdName.textContent = '';
    cdProperties.textContent = '';
}

async function showCharacterDetail(character) {
    const id = crypto.randomUUID();

    characterDetail.classList.remove('hidden');
    cdName.setAttribute('id', id);

    cdStatus.classList.remove('unknown', 'alive', 'dead');
    cdStatus.classList.add(character.status.toLowerCase());
    cdStatus.textContent = character.status;

    cdImg.setAttribute('style', `background-image: url(${character.image})`);

    cdProperties.appendChild(createCdPropertyDetail('Species', character.species));
    cdProperties.appendChild(createCdPropertyDetail('Type', character.type));
    cdProperties.appendChild(createCdPropertyDetail('Gender', character.gender));
    cdProperties.appendChild(createCdPropertyDetail('Origin', character.origin.name));
    cdProperties.appendChild(createCdPropertyDetail('Location', character.location.name));

    if (character.episode.length > 0) {
        cdProperties.appendChild(await createCdPropertyDetailWithLocations(
            'Episodes',
            character.episode
        ));
    }

    objCdNameCrazyText = new CrazyText(id, character.name);
}

function createCdPropertyDetail(title, text) {
    const div = document.createElement('div');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');

    h3.classList.add('cd-property-title');
    h3.textContent = title;

    p.classList.add('cd-property-text');
    p.textContent = text ? text : '?';

    div.classList.add('cd-property-detail')
    div.appendChild(h3);
    div.appendChild(p);

    return div;
}

async function createCdPropertyDetailWithLocations(title, episodeList) {
    const ids = episodeList.map(episode =>  episode.split('/').pop());
    const url = BASE_URL + `episode/${ ids.join(',') }`;

    const div = document.createElement('div');
    const h3 = document.createElement('h3');

    h3.classList.add('cd-property-title');
    h3.textContent = title;

    div.classList.add('cd-property-detail')
    div.appendChild(h3);

    try {
        const response = await fetch(url);
        const responseData = await response.json();

        if ('error' in responseData) {
            new Toast('No se pudieron obtener los detalles de los episodios.');
            return false;
        }

        if (Array.isArray(responseData)) {
            responseData.forEach(episode => div.appendChild(createPropertyEpisode(episode)));
        } else {
            div.appendChild(createPropertyEpisode(responseData));
        }
    } catch (error) {
        new Toast(
            `Ocurrió un error al realizar la búsqueda de <strong>episodios</strong> para el personaje.
            Revisa tu conexión a internet.`,
            { type: Toast.TOAST_ERROR }
        );

        console.log(error);
    } finally {
        return div;
    }
}

function createPropertyEpisode(episode) {
    const propertyEpisode = document.createElement('div');
    const propertyEpisodeNumber = document.createElement('span');
    const propertyEpisodeName = document.createElement('span');
    const propertyEpisodeDate = document.createElement('span');

    propertyEpisodeNumber.classList.add('cd-p-episode-number');
    propertyEpisodeNumber.textContent = episode.episode;

    propertyEpisodeName.classList.add('cd-p-episode-name');
    propertyEpisodeName.textContent = episode.name;

    propertyEpisodeDate.classList.add('cd-p-episode-date');
    propertyEpisodeDate.textContent = episode.air_date;

    propertyEpisode.classList.add('cd-property-episode');
    propertyEpisode.appendChild(propertyEpisodeNumber);
    propertyEpisode.appendChild(propertyEpisodeName);
    propertyEpisode.appendChild(propertyEpisodeDate);

    return propertyEpisode;
}
