const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const getLocalIdent = require('css-loader/lib/getLocalIdent');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require("path");

module.exports = (e, argv) => {
  const mode = argv.mode;
  const define = argv.define;
  let base = {
    externals: [
      // nodeExternals(),
      {
        react: {
          root: 'React',
          commonjs2: 'react',
          commonjs: 'react',
          amd: 'react'
        },
        'react-dom': {
          root: 'ReactDOM',
          commonjs2: 'react-dom',
          commonjs: 'react-dom',
          amd: 'react-dom'
        }
      }
    ],
    devServer: {
      compress: true,
      public: "chat.fanapsoft.ir",
      historyApiFallback: true
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [
            path.resolve(__dirname, "src"),
            path.resolve(__dirname, "node_modules/raduikit/src"),
            path.resolve(__dirname, "node_modules/react-mic/dist"),
            path.resolve(__dirname, "node_modules/react-icons/*"),
            path.resolve(__dirname, "../uikit/src")
          ],
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: "html-loader",
              options: {minimize: true}
            }
          ]
        },
        {
          test: /\.scss$/,
          use: [
            "style-loader", // creates style nodes from JS strings
            {
              loader: "css-loader",
              options: {
                modules: true,
                localIdentName: mode === "production" ? "[hash:base64:5]" : "[local]",
                getLocalIdent: (loaderContext, localIdentName, localName, options) => {
                  return loaderContext.resourcePath.includes('ModalMedia') || loaderContext.resourcePath.includes('emoji') || localName.includes('leaflet') ?
                    localName :
                    getLocalIdent(loaderContext, localIdentName, localName, options);
                }
              }
            },
            {
              loader: "sass-loader",
              options: {
                data: '@import "../variables.scss";',
                includePaths: [__dirname, "styles"]
              }
            }
          ]
        },
        {
          test: /\.(png|jpg|gif|ttf|eot|woff2|woff|mp3|svg)$/,
          exclude: /(oneone|layers|layers-2x|marker-icon)\.png/,
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 2000,
                name: "assets/[hash].[ext]"
              }
            }
          ]
        },
        {
          test: /oneone\.png/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "assets/oneone.[ext]"
              }
            }
          ]
        },
        {
          test: /(layers|layers-2x|marker-icon|marker-shadow)\.png/,
          use: {
            loader: "file-loader",
            options: {
              name: '[path][name].[ext]',
            },
          },
        },
      ]
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: "./index.html",
        filename: "./index.html"
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css"
      }),
      //new BundleAnalyzerPlugin()
    ],
    node: {
      fs: "empty",
      net: "empty",
      tls: "empty"
    }
  };

  //IF MODE IS PRODUCTION
  if (mode === "production") {
    base.output = {
      path: __dirname + "/dist",
      filename: "index.js",
      library: "",
      libraryTarget: "umd"
    }
  } else if (define === "TEST") {
    base.devtool = "source-map";
    base.entry = "./src/test";
  } else {
    base.devtool = "source-map";
    base.entry = "./src/dev";
  }

  return base;
};
