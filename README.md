# NotebookLM LaTeX Renderer - Chrome Extension

## Description

This Chrome extension automatically finds and renders LaTeX mathematical formulas embedded within Google's NotebookLM service (`notebooklm.google.com`). It uses the KaTeX library to display both inline (`$...$`) and display (`$$...$$`) math expressions beautifully and correctly.

Additionally, it applies a subtle light gray background to the rendered formulas for better visual distinction.

## Features

* **Automatic Rendering:** Detects and renders LaTeX expressions on the fly.
* **KaTeX Powered:** Utilizes the fast and efficient KaTeX library.
* **Supports Inline and Display Math:** Correctly handles both `$..$` and `$$..$$` delimiters (as well as `\(...\)` and `\[...\]`).
* **Dynamic Content Handling:** Uses a `MutationObserver` to render formulas even in content loaded dynamically (like Gemini responses).
* **Visual Highlighting:** Adds a configurable light gray background and padding to rendered formulas via `custom_styles.css`.
* **Self-Contained:** Bundles the KaTeX library (JS, CSS, fonts) so it works offline and doesn't rely on external CDNs.
* **Manifest V3 Compliant:** Built using the current Chrome extension standard.

## Installation (from source)

1.  **Download/Clone:** Obtain the extension files.
2.  **Download KaTeX:**
    * Go to the [KaTeX Releases page](https://github.com/KaTeX/KaTeX/releases).
    * Download the latest release archive (e.g., `katex.zip` or `katex.tar.gz`).
    * Extract the archive.
3.  **Organize Files:**
    * Create a `katex` subfolder inside the main extension directory (`notebooklm-latex-renderer/`).
    * Copy the following files/folders from the extracted KaTeX archive into the `katex` subfolder:
        * `katex.min.css`
        * `katex.min.js`
        * `contrib/auto-render.min.js` (Copy this file directly into `katex/`, renaming it or adjusting the manifest path if needed - the current manifest expects it as `katex/auto-render.min.js`)
        * The entire `fonts` folder.
    * Ensure your final structure looks like this:
        ```
        notebooklm-latex-renderer/
        ├── manifest.json
        ├── content_script.js
        ├── custom_styles.css
        └── katex/
            ├── katex.min.css
            ├── katex.min.js
            ├── auto-render.min.js
            └── fonts/
                ├── KaTeX_AMS-Regular.woff2
                ├── ... (all other .woff2 files)
        ```
4.  **Load in Chrome:**
    * Open Chrome and navigate to `chrome://extensions/`.
    * Enable "Developer mode" (toggle switch usually in the top right).
    * Click "Load unpacked".
    * Select the main `notebooklm-latex-renderer` folder.

## Usage

Once installed and enabled, simply navigate to `https://notebooklm.google.com/`. The extension will automatically detect and render any LaTeX formulas within the chat/notebook content as it appears.

## Configuration / Customization

* **Chat Container Selector:** The `content_script.js` uses a `CHAT_CONTAINER_SELECTOR` constant to know where to look for dynamically added content. The default (`'body'`) is broad. For better performance, inspect the NotebookLM page structure (using F12 Developer Tools) and find a more specific CSS selector for the main chat/message area. Update the constant in `content_script.js` accordingly.
* **Styling:** Modify the `custom_styles.css` file to change the appearance of the rendered formulas (e.g., background color, padding, border-radius). Remember to reload the extension in `chrome://extensions/` after making changes to CSS or JS files.

## Dependencies

* [KaTeX](https://katex.org/) - Included in the `katex/` directory.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues. Paypal: samuelrettig@gmail.com


