var gulp       = require('gulp'), // Подключаем Gulp
	sass         = require('gulp-sass'), //Подключаем Sass пакет,
	htmlmin = require('gulp-htmlmin'), //Минификатор html
	rigger = require('gulp-rigger'), //Минификатор html
	browserSync  = require('browser-sync'), // Подключаем Browser Sync
	concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
	uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
	cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
	rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
	imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
	autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов

gulp.task('htmlmin', function() {
  return gulp.src('app/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'))
});

gulp.task('html', function () {
    return gulp.src('app/html/*.html') //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest('app/')) //выгрузим их в папку build
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('sass', function(){ // Создаем таск Sass
	return gulp.src(['app/sass/**/*.scss', 'app/libs/bootstrap-sass/assets/stylesheets/**/*.scss']) // Берем источник
		.pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
		.pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
		.pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'app' // Директория для сервера - app
		},
		notify: false // Отключаем уведомления
	});
});

gulp.task('js-libs', function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'app/libs/jQuery/dist/jquery.min.js', // Берем jQuery
		'app/libs/bootstrap-sass/assets/javascripts/bootstrap.min.js',
		'app/libs/mmenu/jquery.mmenu.js',
		'app/libs/wow/dist/wow.min.js',
		'app/js/common.js'
		])
		.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('app/js')) // Выгружаем в папку app/js
});

gulp.task('css-libs', ['sass'], function() {
	return gulp.src([
		'app/css/bootstrap.css',
		'app/libs/animate.css/animate.min.css',
		'app/libs/mmenu/jquery.mmenu.all.css',
		'app/css/style.css',
		]) // Выбираем файлы
		.pipe(concat('libs.min.css')) // Собираем их в кучу в новом файле libs.min.css
		.pipe(cssnano()) // Сжимаем
		.pipe(gulp.dest('app/css')) // Выгружаем в папку app/css
		.pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('watch', ['html', 'sass', 'css-libs', 'js-libs', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.scss', ['css-libs']); // Наблюдение за sass файлами в папке sass
	gulp.watch('app/libs/bootstrap-sass/assets/stylesheets/**/*.scss', ['css-libs']); // Наблюдение за sass файлами в папке sass
	gulp.watch('app/html/**/*.html', ['html']); // Наблюдение за HTML файлами в корне проекта
	gulp.watch('app/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
	return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*') // Берем все изображения из app
		.pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'html', 'sass', 'css-libs', 'js-libs', 'htmlmin'], function() {

	var buildCss = gulp.src(['app/css/libs.min.css']) // Переносим библиотеки в продакшен
	.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
	.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src(['app/js/libs.min.js']) // Переносим скрипты в продакшен
	.pipe(gulp.dest('dist/js'))

	//var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
	//.pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('default', ['watch']);
