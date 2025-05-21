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

## Recent Improvements

*   **Performance Optimizations:** Significant improvements have been made to prevent hangs or slowdowns, especially on large notebooks. This was achieved through:
    *   **Targeted Rendering:** The extension now intelligently processes only new or changed content for LaTeX, rather than re-rendering the entire page on every update.
    *   **Debounced Rendering Calls:** Rendering requests are grouped and processed efficiently (debounced) to prevent excessive updates during rapid content changes (e.g., while typing or receiving fast updates from Gemini).
    *   **Specific Content Selector:** The default selector for identifying the main content area (`CHAT_CONTAINER_SELECTOR`) has been made more specific (`[role="main"]`), which helps focus the extension's efforts and improves efficiency.

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

## Configuration and Customization

### 1. Styling Rendered LaTeX

You can customize the appearance of the rendered LaTeX formulas (e.g., background color, padding, text color) by modifying the `custom_styles.css` file. After making changes:

1.  Save the `custom_styles.css` file.
2.  Navigate to `chrome://extensions/` in your Chrome browser.
3.  Find the "NotebookLM LaTeX Renderer" extension.
4.  Click the reload icon (a circular arrow) for the extension.
5.  Refresh your NotebookLM page to see the changes.

### 2. Customizing the Content Container (`CHAT_CONTAINER_SELECTOR`)

The extension needs to identify the main content area of NotebookLM to monitor for new text and apply LaTeX rendering. This is done using a CSS selector defined as `CHAT_CONTAINER_SELECTOR` in the `content_script.js` file.

*   **Current Default Value:** `[role="main"]`
*   **Purpose:** This selector tells the extension which part of the NotebookLM page contains the text content that should be scanned for LaTeX. A more specific selector helps the extension run more efficiently by not unnecessarily scanning irrelevant parts of the page (like sidebars or menus).

While the default selector `[role="main"]` is chosen to be reasonably specific and work for many users, web page structures can change, or you might find a more optimal selector for your specific view or version of NotebookLM.

**Why you might (rarely) need to change it:**

*   If NotebookLM's underlying HTML structure changes significantly and the default selector no longer points to the main content area.
*   If you observe that LaTeX is not rendering in certain parts of the main content.
*   For advanced users seeking to fine-tune performance even further with an ultra-specific selector.

**How to find and change the `CHAT_CONTAINER_SELECTOR`:**

1.  **Open Developer Tools:**
    *   Navigate to the NotebookLM page where you want LaTeX to be rendered.
    *   Right-click on the main content area of the page (e.g., where the text of your notes or chat messages appears).
    *   Select "Inspect" or "Inspect Element" from the context menu. This will open your browser's developer tools, usually docked to the side or bottom of the window.

2.  **Inspect Elements:**
    *   In the "Elements" panel of the developer tools, you'll see the HTML structure of the page.
    *   Click the "select an element" tool (often looks like a mouse cursor in a box) in the developer tools toolbar.
    *   Hover over the main content area in NotebookLM. The developer tools will highlight the corresponding HTML element and its parents.
    *   Look for an element that seems to uniquely wrap all the content you want the extension to process. It might have a specific ID (e.g., `id="notebook-content"`) or a descriptive class name (e.g., `class="main-text-area"`) or a role attribute (like the current `role="main"`).
    *   **Goal:** Find the most specific, stable selector for this container.
        *   An ID is usually very good (e.g., `#my-id`).
        *   A specific class name can work (e.g., `.my-class-name`). Be wary of very generic class names.
        *   Attribute selectors like `[data-testid="some-meaningful-id"]` or `[role="main"]` can also be robust.
        *   Avoid selectors that are too generic (like `div` or `body` unless absolutely necessary) or seem likely to change frequently.

3.  **Identify a Selector:**
    *   Once you've found a suitable element, you need its CSS selector.
    *   If it has an ID, the selector is `#your-id-name`.
    *   If it has a unique class, it might be `.your-class-name`.
    *   You can also right-click the element in the "Elements" panel and choose "Copy" > "Copy selector" (though this might sometimes generate a very long, overly specific selector; try to simplify it if possible).
    *   **Examples of what you might look for (these are illustrative, you need to find what's current on the page):**
        *   `#notebook-scroll-area`
        *   `.conversation-view`
        *   `div[data-testid="main-chat-window"]`

4.  **Update `content_script.js`:**
    *   Open the `content_script.js` file in your extension's source code directory.
    *   Find the line:
        ```javascript
        const CHAT_CONTAINER_SELECTOR = '[role="main"]';
        ```
    *   Replace `'[role="main"]'` with your new selector, keeping the quotes. For example:
        ```javascript
        const CHAT_CONTAINER_SELECTOR = '#my-new-selector';
        ```
    *   Save the `content_script.js` file.

5.  **Reload the Extension:**
    *   Go to `chrome://extensions/`.
    *   Click the reload icon for the "NotebookLM LaTeX Renderer" extension.
    *   Refresh the NotebookLM page. The extension will now use your new selector.

**Important Considerations:**

*   **Specificity vs. Stability:** A very specific selector might be efficient but could break if NotebookLM updates its HTML structure. A slightly broader but stable selector (like `[role="main"]`) is often a good compromise.
*   **Fallback:** The script has a fallback mechanism to use `document.body` if your selector isn't found, but this is much less performant.
*   If you make a mistake, you can always revert to the default selector or try a different one.

## Dependencies

* [KaTeX](https://katex.org/) - Included in the `katex/` directory. Distributed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues. (Optional: Add more specific contribution guidelines if desired).

## License

This project itself is licensed under the MIT License - see the (optional) `LICENSE` file for details.

This project includes the KaTeX library (in the `katex/` directory), which is distributed under its own MIT License. You must retain the KaTeX copyright notice and license file when distributing this extension, as required by the KaTeX license.
