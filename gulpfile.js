const { watch, src, dest } = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const arrSrc = require('./src');

const root = './dist/assets/';

function indexJs() {
  return src(arrSrc.indexSrc.js)
    .pipe(concat('index.min.js'))
    .pipe(uglify())
    .pipe(dest(root + 'index'));
}

function indexCss() {
  return src(arrSrc.indexSrc.css)
    .pipe(concat('index.min.css'))
    .pipe(cleanCSS())
    .pipe(dest(root + 'index'));
}

function pixelWarJs() {
  return src(arrSrc.pixelWarSrc.js)
    .pipe(concat('pixel-war.min.js'))
    .pipe(uglify())
    .pipe(dest(root + 'pixel-war'));
}

function pixelWarCss() {
  return src(arrSrc.pixelWarSrc.css)
    .pipe(concat('pixel-war.min.css'))
    .pipe(cleanCSS())
    .pipe(dest(root + 'pixel-war'));
}

function charactersJs() {
  return src(arrSrc.charactersSrc.js)
    .pipe(concat('characters.min.js'))
    .pipe(uglify())
    .pipe(dest(root + 'characters'));
}

function charactersCss() {
  return src(arrSrc.charactersSrc.css)
    .pipe(concat('characters.min.css'))
    .pipe(cleanCSS())
    .pipe(dest(root + 'characters'));
}

exports.default = function() {
  watch('src/**/*.js', indexJs);
  watch('src/**/*.css', indexCss);
  watch('src/**/*.js', pixelWarJs);
  watch('src/**/*.css', pixelWarCss);
  watch('src/**/*.js', charactersJs);
  watch('src/**/*.css', charactersCss);
};