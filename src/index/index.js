document.getElementById('portal-link')
    .addEventListener('click', function (e) {
        if (e.target.tagName === 'IMG') {
            this.classList.toggle('centrar');
        }
    });

new CrazyText('dynamic-title', "Rick's Supersystem");
new CrazyText('btnLink1', "Characters");
new CrazyText('btnLink2', "Pixel War");