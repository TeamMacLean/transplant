const path = require('path');
const webpack = require('webpack');
// const PrepackWebpackPlugin = require('prepack-webpack-plugin').default;

module.exports = {
    entry: {
        app: [
            path.resolve(path.join(__dirname, "public", "js", 'app.jsx'))
        ],
    },
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
        path: path.join(__dirname, "public", "js"),
        filename: '[name].js'
    },
    plugins: [
        // new PrepackWebpackPlugin({})
    ]
};