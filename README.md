# Reddit Comment Arrow (Chrome Extensions)

<p align="center">
  <img height="150px" src="./images/Logo.svg" />
</p>

This is an extension for Google Chrome to add the loved skip-to-next-top-level-comment-button from the mobile reddit apps to the desktop (web) version of reddit.

The button will be positioned on the middle left side of the screen by default.

## Instructions

- Open a reddit post page
- Wait until top comments have loaded
- Click on the button to jump to the next comment
- Hold and drag (default 500 milliseconds) to reposition the button
- You can alter several options in the action menu of the extension. Just click on the icon in the extension popover.

Chrome Web Store Url: https://chrome.google.com/webstore/detail/reddit-comment-arrow/njalndcfgcolndhkmdkjihclbcnmomjl?hl=en-GB&authuser=0

## Development

- First, Install all dependencies

  ```sh
  npm install
  ```

### Locally

- Build the extension

  ```sh
  npm run build
  ```

- Go into Chrome [Extensions page](chrome://extensions), enable developer mode (in the top right corner) and load the extension via `Load unpacked`

### Packaging

- In order for a successful packaging, the extension must be loadable after packing into a .crx file. This can be tested in Chrome with `Pack extension` from the [Extensions page](chrome://extensions), which requires a zip file of the extension. You can create this zip file with

  ```sh
  npm run package -- some-name.zip
  ```

  After packing, the crx file will be located in the **parent** folder of the zip. Drag and drop this file into the [Extensions page](chrome://extensions).
