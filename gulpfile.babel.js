// Dependencies =================================
    import gulp from 'gulp';
    import sourcemaps from 'gulp-sourcemaps';
    import gutil from 'gulp-util';
    import livereload from 'gulp-livereload';
    import { argv } from 'yargs';
    import notify from 'gulp-notify';
    import prettyTime from 'pretty-hrtime';
    import gulpif from 'gulp-if';

    //== SASS
    import sass from 'gulp-sass';
    import combinemq from 'gulp-combine-mq';
    import cssnano from 'gulp-cssnano';

    //== JS
    import browserify from 'browserify';
    import watchify from 'watchify';
    import babelify from 'babelify';
    import uglify from 'gulp-uglify';
    import eslint from 'gulp-eslint';
    import source from 'vinyl-source-stream';
    import buffer from 'vinyl-buffer';
    import glob from 'glob';
    import path from 'path';

// Setting internals ============================
    const internals = {
        isWatchify: false,
        deps: ['react', 'react-dom']
    };
    internals.static = __dirname + '/static';
    internals.src = internals.static + '/src';

// Notify on task completion ====================
    gulp.on('task_stop', function(e) {

        var quiet = (argv.quiet) ? true : false;

        if (!quiet) {
            // Dont show LINT task
            if (e.task.toUpperCase() === 'LINT') {
                return;
            }

            var time = prettyTime(e.hrDuration);
            gulp.src('').pipe(notify({
                title: "Finished: "+ e.task.toUpperCase(),
                message: "after " + time
            }));
        }
    });

// SASS Task ================================
    gulp.task('sass', function() {

        var sassOptions = {
            errLogToConsole: true,
            outputStyle: 'expanded'
        };

        return gulp
            .src([internals.src + '/sass/master.scss'])
            .pipe(sass(sassOptions).on('error', sass.logError))
            .pipe(combinemq())
            .pipe(cssnano({
                autoprefixer: { browsers: ['last 3 version'], add: true }
            }))
            .pipe(sourcemaps.init())
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(internals.static + '/css/'))
            .pipe(livereload());
    });

// JS Tasks =====================================
    const createBundle = (options, callback) => {

        options = Object.assign({ min: true }, options);
        let min = true;
        const opts = Object.assign({}, watchify.args, {
            entries: options.entries,
            debug: true
        });

        let b = browserify(opts);
        b.transform(babelify.configure({
            compact: false
        }));

        if (path.basename(options.entries) === 'main.js') {
            min = false;
            b.require(internals.deps)
        } else {
            b.external(internals.deps);
        }

        // process.env.NODE_ENV = 'production';
        const rebundle = () => {

            return b.bundle()
                // log errors if they happen
                .on('error', gutil.log.bind(gutil, 'Browserify Error'))
                .pipe(source(options.output))
                .pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                // .pipe(gulpif(options.min, uglify(), gutil.noop()))
                .pipe(sourcemaps.write('./maps'))
                .pipe(gulp.dest(options.destination))
                .pipe(livereload());
        };

        if (internals.isWatchify) {
            b = watchify(b);
            b.on('update', function(id) {
                lint(callback, id);
                rebundle();
            });
            b.on('log', gutil.log);
        }

        return rebundle();
    };

    const lint = (callback, src) => {

        return gulp
            .src(src)
            .pipe(eslint({ useEslintrc: true }))
            .pipe(eslint.format());
    };

    gulp.task('scripts', (callback) => {

        const mainFiles = [`${internals.src}/js/main.js`];
        glob(`${internals.src}/js/views/*/*.js`, (err, files) => {

            if (err) {
                done(err);
            }

            files = [...files, ...mainFiles];
            const tasks = files.map(function (entry, index) {
                entry = path.normalize(entry);
                const origin = path.normalize(`${ internals.src }/js`);
                const dest = path.normalize(`${ internals.static }/js`);
                const destMapping = entry.replace(origin, dest);
                const destination = path.dirname(destMapping);
                
                createBundle({
                    entries: entry,
                    output: path.basename(entry),
                    destination: destination
                });
            });
        });
        return callback();
    });

    gulp.task('scripts:lint', (callback) => {

        return lint(callback, [internals.src + '/js/**/*.js','!**/libs/**/*']);
    });


// Watch Tasks ==================================
    gulp.task('watch', () => {

        internals.isWatchify = true;
        livereload.listen({ quiet: true });
        gulp.watch(internals.src + '/sass/**/*.scss',['sass']);
    });

// Main Tasks ===================================
    gulp.task('default', ['sass', 'scripts', 'watch']);
