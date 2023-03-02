/** @type {import('next').NextConfig} */

const withTM = require("next-transpile-modules")(["web-ifc-three"])

module.exports = withTM({
  reactStrictMode: true,
  webpack: function (config) {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: "js-yaml-loader",
    })
    return config
  },
})
