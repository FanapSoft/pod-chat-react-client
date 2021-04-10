const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const getLocalIdent = require('css-loader/lib/getLocalIdent');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack')
const path = require("path");

module.exports = (e, argv) => {
  const mode = argv.mode;
  const define = argv.define;
  let base = {

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
            path.resolve(__dirname, "../pod-chat-ui-kit/src")
          ],

          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react"
              ],
              plugins: [
                "@babel/plugin-proposal-object-rest-spread",
                [
                  "@babel/plugin-proposal-decorators",
                  {
                    "legacy": true
                  }
                ],
                ["@babel/plugin-proposal-class-properties", {"loose": true}]
              ]
            },
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
                modules: {
                  localIdentName: mode === "production" ? "[hash:base64:5]" : "[local]",
                  getLocalIdent: (loaderContext, localIdentName, localName, options) => {
                    if ( mode === "production") {
                      return loaderContext.resourcePath.includes('ModalMedia') || loaderContext.resourcePath.includes('emoji') || localName.includes('leaflet') || localName.includes('Toastify') ?
                        localName :
                        null
                    }
                    return null;
                  }
                },

              }
            },
            {
              loader: "sass-loader",
              options: {
                additionalData: '@import "../variables.scss";',
                sassOptions: {
                  includePaths: [__dirname, "styles"]
                }

              }
            }
          ]
        },
        {
          test: /\.(png|jpg|gif|ttf|eot|woff2|woff|mp3|svg)$/,
          exclude: /((oneone|talk-logo|layers|layers-2x|marker-icon|marker-icon-2x|marker-shadow|map-fake)\.png)|(cover\.jpg)/,
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
          test: /((oneone|talk-logo|layers|layers-2x|marker-icon|marker-icon-2x|marker-shadow|map-fake)\.png)|(cover\.jpg)/,
          use: {
            loader: "file-loader",
            options: {
              name: 'assets/[name].[ext]',
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
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      //new BundleAnalyzerPlugin()
    ],
    resolve: {
      fallback: {
        path: false,
        buffer: false,
        tls: false,
      }
    }
  };

  //IF MODE IS PRODUCTION
  if (mode === "production") {

    base.externals = [
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
    ];
    base.output = {
      path: __dirname + "/dist",
      filename: "index.js",
      library: "index",
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
