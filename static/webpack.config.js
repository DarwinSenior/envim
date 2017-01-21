const webpack = require('webpack');

module.exports = {
    resolve: {
        extensions: ['', '.ts', '.js', '.json'],
    },
    entry: './Main.ts',
    output: {
        path: '../build',
        filename: 'bundle.js',
    },
    module: {
        loaders: [{
            test: /\.ts$/,
            loader: 'ts-loader',
        },{
            test: /\.css$/,
            loader: 'style!css',
        }]
    },
    devtool: 'source-map',
    plugins: [new webpack.NoErrorsPlugin()],
    target: 'electron-renderer'
}
