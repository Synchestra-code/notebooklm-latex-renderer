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

1.  **Download/Clone:** Obtain the extension files (e.g., by cloning the repository or downloading a source code archive).

2.  **Check for KaTeX Files:** Look inside the downloaded/cloned folder. Does a subfolder named `katex` already exist and contain files like `katex.min.js`, `katex.min.css`, and a `fonts` subfolder?
    * **If YES:** The necessary KaTeX files are already included in the repository. You can **skip Step 3**.
    * **If NO:** You need to download KaTeX manually as described in Step 3.

3.  **Download KaTeX (Only if not already included):**
    * Go to the [KaTeX Releases page](https://github.com/KaTeX/KaTeX/releases).
    * Download the latest release archive (e.g., `katex.zip` or `katex.tar.gz`).
    * Extract the archive.

4.  **Organize Files (Only if KaTeX was downloaded in Step 3):**
    * Create a `katex` subfolder inside the main extension directory (`notebooklm-latex-renderer/`).
    * Copy the following files/folders from the extracted KaTeX archive into the `katex` subfolder:
        * `katex.min.css`
        * `katex.min.js`
        * `contrib/auto-render.min.js` (Copy this file directly into `katex/`, renaming it or adjusting the manifest path if needed - the current manifest expects it as `katex/auto-render.min.js`)
        * The entire `fonts` folder.
        * **Important:** Also copy the KaTeX `LICENSE` file (or similar, e.g., `COPYING`) into this `katex` directory or the project root.

5.  **Verify File Structure:** Ensure your final structure looks like this (the `katex` folder should be present either from the download or because it was already in the repository):
    ```
    notebooklm-latex-renderer/
    ├── manifest.json
    ├── content_script.js
    ├── custom_styles.css
    ├── README.md
    ├── (Optional: LICENSE file for this project)
    └── katex/
        ├── katex.min.css
        ├── katex.min.js
        ├── auto-render.min.js
        ├── LICENSE         <-- KaTeX License file
        └── fonts/
            ├── KaTeX_AMS-Regular.woff2
            ├── ... (all other .woff2 files)
    ```

6.  **Load in Chrome:**
    * Open Chrome and navigate to `chrome://extensions/`.
    * Enable "Developer mode" (toggle switch usually in the top right).
    * Click "Load unpacked".
    * Select the main `notebooklm-latex-renderer` folder (which now definitely contains the `katex` subfolder).

## Usage

Once installed and enabled, simply navigate to `https://notebooklm.google.com/`. The extension will automatically detect and render any LaTeX formulas within the chat/notebook content as it appears.

## Configuration / Customization

* **Chat Container Selector:** The `content_script.js` uses a `CHAT_CONTAINER_SELECTOR` constant to know where to look for dynamically added content. The default (`'body'`) is broad. For better performance, inspect the NotebookLM page structure (using F12 Developer Tools) and find a more specific CSS selector for the main chat/message area. Update the constant in `content_script.js` accordingly.
* **Styling:** Modify the `custom_styles.css` file to change the appearance of the rendered formulas (e.g., background color, padding, border-radius). Remember to reload the extension in `chrome://extensions/` after making changes to CSS or JS files.

## Dependencies

* [KaTeX](https://katex.org/) - Included in the `katex/` directory. Distributed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues. (Optional: Add more specific contribution guidelines if desired).

## License

This project itself is licensed under the MIT License - see the (optional) `LICENSE` file for details.

This project includes the KaTeX library (in the `katex/` directory), which is distributed under its own MIT License. You must retain the KaTeX copyright notice and license file when distributing this extension, as required by the KaTeX license.
