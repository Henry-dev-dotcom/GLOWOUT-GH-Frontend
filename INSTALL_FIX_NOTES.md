# Install Fix Notes

This version removes the package-lock file that was generated in the ChatGPT sandbox environment and forced npm to use an internal registry URL.

## Install steps on your PC

```bash
cd GlowoutGH-React-Tailwind-Fixed
npm cache clean --force
npm config set registry https://registry.npmjs.org/
npm install
npm run dev
```

If npm still tries to use `packages.applied-caas-gateway1.internal.api.openai.org`, delete `package-lock.json` and `node_modules`, then run the commands again.

```bash
rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm cache clean --force
npm config set registry https://registry.npmjs.org/
npm install
npm run dev
```
