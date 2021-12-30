const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/main.ts",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "wwwroot")
    },
    resolve: {
        extensions: ["*.ts", "*.js", "*.vue"]
    },
    module: {
        rules: [
            { test: /\.vue$/, loader: "vue-loader" },
            { test: /\.tsx?$/, loader: "ts-loader", options: {
                appendTsSuffixTo: [/\.vue$/],
                transpileOnly: false
            }},
        ]
    },
    plugins: [new VueLoaderPlugin()]
};
