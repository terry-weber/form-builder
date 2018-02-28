var webpack = require('webpack');
var HTMLWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

var HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
    template: __dirname + '/web/index.html',
    filename: 'index.html',
    inject: 'body'
});

module.exports = {
    entry : __dirname + '/web/index.js',
    module : {
        loaders : [
            {
                test : /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" }
                ]
            },
            { loader: 'url-loader?limit=100000', test: /.(png|woff|woff2|eot|ttf|svg)$/ },
            {
                test: /.(png|woff|woff2|eot|ttf|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {}
                    }
                ]
            }
        ]
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, '..', "build"),
        publicPath: "/"
    },
    plugins: [
        HTMLWebpackPluginConfig,
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],
    devServer: {
        historyApiFallback: true,
        contentBase: './'
    }
};