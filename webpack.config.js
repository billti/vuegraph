const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/main.ts",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "wwwroot")
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
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [new VueLoaderPlugin()],
    externals: {
        "vue": "Vue"
    },
    stats: {
        errorDetails: true
    }
};
