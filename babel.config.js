module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
            "@legacy": "./packages/legacy/ElaraFriendship",
            "@shared": "./packages/shared"
          },
          extensions: [".js", ".jsx", ".ts", ".tsx", ".json"]
        }
      ]
    ]
  };
};
