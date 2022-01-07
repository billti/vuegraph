const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: "development",
    devtool: "source-map",
    stats: true,
    entry: "./src/main.ts",
    output: {
        path: path.resolve(__dirname, "wwwroot/dist")
    },
    resolve: {
        extensions: [".ts", ".js", ".vue"]
    },
    module: {
        rules: [
            { test: /\.vue$/, loader: "vue-loader" },
            { test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/, options: {
                appendTsSuffixTo: [/\.vue$/],
                transpileOnly: false
            }},
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }
        ]
    },
    plugins: [new VueLoaderPlugin(), new MiniCssExtractPlugin()],
    externals: {
        "vue": "Vue"
    },
    stats: {
        errorDetails: true
    }
};
