# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```

## Results from explorer

![Flow Explorer](https://evm-testnet.flowscan.io/tx/0x592974fbde2fcaa9416b23334121a712db1db5c9d9c274c3ebe7cbf01ce0bceb) - Agent Registration
Agent Registry Deployed: [Flow Explorer](https://evm-testnet.flowscan.io/address/0x0dcCe2649be92E4457d9d381D8173f3fD7FcAA68?tab=txs)
Reputation Registry Deployed: [Flow Explorer](https://evm-testnet.flowscan.io/address/0xDE36662dD44343a65a60FB6c1927A2FCB042936e?tab=index)

Agent Registry Deployed: [Hedera Explorer](https://evm-testnet.flowscan.io/address/0xDE36662dD44343a65a60FB6c1927A2FCB042936e?tab=index)
Transaction Hash: [Hedera Explorer](https://hashscan.io/testnet/transaction/1748754958.315498000)
