var gulp = require('gulp');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var shell = require('gulp-shell');
// var sass = require('gulp-sass');
var del = require('del');

gulp.task('coffee', function() {
	return gulp
		.src('./src/coffee/*.coffee')
		.pipe(coffee({bare: false}).on('error', gutil.log))
		.pipe(uglify())
		.pipe(gulp.dest('./assets/js/'))
});

gulp.task('default', ['build']);

gulp.task('build', ['coffee']);

gulp.task('watch', ['build'], function() {
	gulp.watch(['./src/**/*'], ['build']);
});