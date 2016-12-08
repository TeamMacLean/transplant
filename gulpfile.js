var gulp = require('gulp');
var webpack = require('webpack-stream');
var path = require('path');


gulp.task('default', function () {
    return gulp.src('public/js/app.jsx')
        .pipe(webpack({
            watch: true,
            module: {
                loaders: [
                    {
                        test: /.jsx?$/,
                        loader: 'babel-loader',
                        exclude: /node_modules/,
                        query: {
                            presets: ['es2015', 'react']
                        }
                    },
                    {test: /\.css$/, loader: "style-loader!css-loader"},
                ]
            },
            output: {
                filename: 'app.js'
            }
        }))
        .pipe(gulp.dest('public/js'));
});