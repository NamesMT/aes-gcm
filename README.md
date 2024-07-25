# @namesmt/aes-gcm ![TypeScript heart icon](https://img.shields.io/badge/♡-%23007ACC.svg?logo=typescript&logoColor=white)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Codecov][codecov-src]][codecov-href]
[![Bundlejs][bundlejs-src]][bundlejs-href]
[![jsDocs.io][jsDocs-src]][jsDocs-href]

**@namesmt/aes-gcm** is a dead simple, modern, cross-platform AES-GCM encryption util package.  

## Features
- [x] TypeScript ready!

## Usage
### Install package:
```sh
# npm
npm install @namesmt/aes-gcm

# yarn
yarn add @namesmt/aes-gcm

# pnpm (recommended)
pnpm install @namesmt/aes-gcm
```

### Import:
```ts
// ESM
import { decrypt, encrypt } from '@namesmt/aes-gcm'

const plaintext = 'Hello, world!'
const password = 'pw'
const encrypted = await encrypt(plaintext, password)
const decrypted = await decrypt(encrypted, password)
```

## Roadmap

- [x] Setting up Dev Container
- [ ] Become the legendary 10000x developer

## License [![License][license-src]][license-href]
[MIT](./LICENSE) License © 2023 [NamesMT](https://github.com/NamesMT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@namesmt/aes-gcm?labelColor=18181B&color=F0DB4F
[npm-version-href]: https://npmjs.com/package/@namesmt/aes-gcm
[npm-downloads-src]: https://img.shields.io/npm/dm/@namesmt/aes-gcm?labelColor=18181B&color=F0DB4F
[npm-downloads-href]: https://npmjs.com/package/@namesmt/aes-gcm
[codecov-src]: https://img.shields.io/codecov/c/gh/namesmt/aes-gcm/main?labelColor=18181B&color=F0DB4F
[codecov-href]: https://codecov.io/gh/namesmt/aes-gcm
[license-src]: https://img.shields.io/github/license/namesmt/aes-gcm.svg?labelColor=18181B&color=F0DB4F
[license-href]: https://github.com/namesmt/aes-gcm/blob/main/LICENSE
[bundlejs-src]: https://img.shields.io/bundlejs/size/@namesmt/aes-gcm?labelColor=18181B&color=F0DB4F
[bundlejs-href]: https://bundlejs.com/?q=@namesmt/aes-gcm
[jsDocs-src]: https://img.shields.io/badge/Check_out-jsDocs.io---?labelColor=18181B&color=F0DB4F
[jsDocs-href]: https://www.jsdocs.io/package/@namesmt/aes-gcm
