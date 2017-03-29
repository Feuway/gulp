'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const minify = require('gulp-minify-css');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const debug = require('gulp-debug');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const newer = require('gulp-newer');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const remember = require('gulp-remember');
const eslint = require('gulp-eslint');
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const del = require('del');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const named = require('vinyl-named');
const browserSync = require('browser-sync').create();


// const webpackStream = require('webpack-stream');
// const webpack = webpackStream.webpack;
//
// let options = {
//     watch: true,
//     module: {
//
//     },
//     plagins: [
//
//     ]
// }
//
// gulp.task('webpack', () => {
//
//     return gulp.src('src/script/*.js')
//         .pipe(plumber({
//             errorHandler: notify.onError(err => ({
//                 title: 'Webpack',
//                 message: err.message
//             }))
//         }))
//         .pipe(named())
//         .pipe(webpackStream(options))
//         .pipe(uglify())
//         .pipe(gulp.dest('build/scripts'))
// });

gulp.task('style', () => {
    return gulp.src('src/style/main.scss')
        .pipe(debug({title: 'src'}))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on('error', notify.onError(err => ({
                title: 'style',
                message: err.message
        })))
        .pipe(autoprefixer())
        .pipe(gulp.dest('build/style'))
        .pipe(minify())
        .pipe(rename('main.min.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/style'))
});

gulp.task('clean', () => {
    return del('build');
});

gulp.task('html', () => {
    return gulp.src('src/*.html', {since: gulp.lastRun('html')})
        .pipe(newer('build'))
        .pipe(debug({title: 'src'}))
        .pipe(gulp.dest('build'));
});

gulp.task('image', () => {
    return gulp.src('src/img/**/*.{png,jpg,gif}', {base: 'src'}, {since: gulp.lastRun('html')})
        .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.jpegtran({progressive: true})
        ]))
        .pipe(gulp.dest('build'))
});

gulp.task('svg', () => {
    return gulp.src('src/img/**/*.svg')
        .pipe(svgSprite({
            mode: {
                css: {
                    dest: '.',
                    bust: false,
                    sprite: 'sprite.svg',
                    layout: 'vertical',
                    dimensions: true,
                    prefix: '%',
                    render: {
                        scss: {
                            dest: 'sprite.scss'
                        }

                    }
                }
            }
        }))
        .pipe(debug({title: 'svg'}))
        .pipe(gulpIf('*scss',gulp.dest('tmp/style') ,gulp.dest('build/img/svg')));
});

gulp.task('script', () => {
    return gulp.src('src/script/main.js', {base: 'src'})
        .pipe(babel())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build'));
});

gulp.task('watch', () => {
    gulp.watch('src/style/**/*.scss', gulp.series('style'));
    gulp.watch('src/*.html', gulp.series('html'));
    gulp.watch('src/img/**/*.{png,jpg,svg,gif}', gulp.series('image', 'svg'));
    gulp.watch('src/script/**/*.js', gulp.series('script'));
});

gulp.task('lint', () => {
    return gulp.src('src/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
});

gulp.task('server', () => {
    browserSync.init({
        server: {
            baseDir: 'build'
        }
    });
    browserSync.watch('build/**/*.*').on('change', browserSync.reload);
});


gulp.task('build', gulp.series('clean', gulp.parallel('svg', 'style', 'html', 'image', 'script')));

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'server')));