require('dotenv').config();
const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

const babel = require('gulp-babel');

gulp.task('default', ['serve']);

gulp.task('nodemon', ['server'], () => {
  nodemon({
    script: './dist/app.js',
    ext: 'js',
    env: { NODE_ENV: 'development' }
  });
});

gulp.task('server', () =>
  gulp.src('server/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist'))
  );

gulp.task('build', ['nodemon']);

gulp.task('serve', ['build', 'watch']);

gulp.task('watch', () => {
  gulp.watch('./server/app.js', ['server']);
});
