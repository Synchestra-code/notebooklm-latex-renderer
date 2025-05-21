/**
 * @fileoverview Content script for NotebookLM LaTeX Renderer extension.
 * Uses KaTeX auto-render extension to find and render LaTeX expressions.
 * Observes DOM changes to render LaTeX in dynamically loaded content.
 */

console.log("NotebookLM LaTeX Renderer: Content script geladen.");

let debounceTimer; // For debouncing rendering calls

/**
 * Funktion zum Ausführen des KaTeX Auto-Renderings für ein bestimmtes Element.
 * @param {Node} targetNode Das Wurzelelement, in dem nach LaTeX gesucht werden soll.
 */
function renderLatexInNode(targetNode) {
    if (!targetNode) {
        console.warn("NotebookLM LaTeX Renderer: renderLatexInNode aufgerufen mit ungültigem targetNode.");
        return;
    }
    if (typeof renderMathInElement === 'function') {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            try {
                // Konfiguration für KaTeX Auto-Render
                // Erkennt $...$ und $$...$$ sowie \(...\) und \[...\]
                renderMathInElement(targetNode, {
                    delimiters: [
                        {left: "$$", right: "$$", display: true}, // Display Math
                        {left: "$", right: "$", display: false},   // Inline Math
                        {left: "\\(", right: "\\)", display: false}, // Inline Math (alternative)
                        {left: "\\[", right: "\\]", display: true}   // Display Math (alternative)
                    ],
                    // Ignoriert bestimmte Tags, um Probleme zu vermeiden
                    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
                    // Verhindert, dass Fehler das gesamte Skript stoppen
                    throwOnError: false
                });
                console.log("NotebookLM LaTeX Renderer: KaTeX Auto-Render aufgerufen für", targetNode);
            } catch (error) {
                console.error("NotebookLM LaTeX Renderer: Fehler beim KaTeX Rendering:", error);
            }
        }, 300); // 300ms Verzögerung
    } else {
        console.error("NotebookLM LaTeX Renderer: KaTeX oder Auto-Render-Funktion nicht gefunden.");
    }
}

/**
 * Selektor für den Container, der die Chat-Nachrichten enthält.
 * !!! WICHTIG: Dieser Selektor muss eventuell angepasst werden! !!!
 * Untersuche die Seite mit den Entwicklertools, um den korrekten Container zu finden.
 * Mögliche Kandidaten könnten sein:
 * - Ein Element mit einer spezifischen ID: '#chat-history', '#messages-container'
 * - Ein Element mit einer bestimmten Rolle: "[role='log']", "[role='main']"
 * - Ein Element mit einer spezifischen Klasse (kann aber instabil sein): '.chat-output', '.conversation-area'
 * - Für den Anfang versuchen wir es mit 'body', um sicherzustellen, dass alles erfasst wird,
 * aber eine spezifischere Auswahl ist für die Performance besser.
 */
const CHAT_CONTAINER_SELECTOR = '[role="main"]';

// --- MutationObserver-Setup ---

// Funktion, die bei DOM-Änderungen aufgerufen wird
const mutationCallback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Prüfen, ob der neue Knoten selbst oder seine Kinder Text enthalten,
                    // der potenziell LaTeX sein könnte ($ oder \).
                    if (node.textContent && (node.textContent.includes('$') || node.textContent.includes('\\'))) {
                        console.log("NotebookLM LaTeX Renderer: childList Mutation - ElementNode hinzugefügt, rendere:", node);
                        renderLatexInNode(node);
                    }
                }
            });
        } else if (mutation.type === 'characterData') {
            if (mutation.target.textContent && (mutation.target.textContent.includes('$') || mutation.target.textContent.includes('\\'))) {
                if (mutation.target.parentElement) {
                    console.log("NotebookLM LaTeX Renderer: characterData Mutation - Text geändert, rendere parentElement:", mutation.target.parentElement);
                    renderLatexInNode(mutation.target.parentElement);
                } else {
                     // Fallback, wenn kein parentElement vorhanden ist (z.B. Textknoten direkt im Shadow DOM oder ähnliches)
                     // In diesem Fall versuchen wir, den gesamten Container neu zu rendern, aber debounced.
                    console.log("NotebookLM LaTeX Renderer: characterData Mutation - Text geändert, aber kein parentElement. Rendere den Chat-Container.");
                    renderLatexInNode(document.querySelector(CHAT_CONTAINER_SELECTOR) || document.body);
                }
            }
        }
    }
};

// Funktion zum direkten, nicht-debounced Rendern für den initialen Inhalt.
function initialRender(targetNode) {
    if (typeof renderMathInElement === 'function') {
        try {
            renderMathInElement(targetNode, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false},
                    {left: "\\(", right: "\\)", display: false},
                    {left: "\\[", right: "\\]", display: true}
                ],
                ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
                throwOnError: false
            });
            console.log("NotebookLM LaTeX Renderer: Initiales KaTeX Auto-Render aufgerufen für", targetNode);
        } catch (error) {
            console.error("NotebookLM LaTeX Renderer: Fehler beim initialen KaTeX Rendering:", error);
        }
    } else {
        console.error("NotebookLM LaTeX Renderer: KaTeX oder Auto-Render-Funktion nicht gefunden für initiales Rendering.");
    }
}

// Funktion zum Starten des Observers
function startObserver() {
    const targetNode = document.querySelector(CHAT_CONTAINER_SELECTOR);

    if (targetNode) {
        console.log("NotebookLM LaTeX Renderer: Ziel-Container gefunden:", CHAT_CONTAINER_SELECTOR, ". Starte Observer und initiales Rendering.");
        // 1. Initiales Rendering für bereits vorhandenen Inhalt (direkt, nicht debounced)
        initialRender(targetNode);

        // 2. Observer konfigurieren
        const observer = new MutationObserver(mutationCallback);
        const config = {
            childList: true,  // Beobachte hinzugefügte/entfernte Kind-Knoten
            subtree: true,    // Beobachte auch Änderungen in Unterknoten
            characterData: true // Beobachte Änderungen an Textknoten (optional, performance-intensiver)
        };

        // 3. Observer starten
        observer.observe(targetNode, config);

    } else {
        // Falls der Container nicht sofort da ist (z.B. bei Single Page Apps),
        // versuche es nach einer kurzen Verzögerung erneut.
        console.warn("NotebookLM LaTeX Renderer: Ziel-Container nicht gefunden:", CHAT_CONTAINER_SELECTOR, ". Versuche es in 2 Sekunden erneut.");
        setTimeout(startObserver, 2000);
    }
}

// Stelle sicher, dass KaTeX und die Auto-Render-Funktion geladen sind,
// bevor der Observer gestartet wird.
// Wir warten zur Sicherheit auf 'load', obwohl 'document_idle' oft reicht.
window.addEventListener('load', () => {
    if (typeof renderMathInElement !== 'undefined') {
         startObserver();
    } else {
         console.error("NotebookLM LaTeX Renderer: KaTeX Auto-Render-Funktion 'renderMathInElement' nicht verfügbar beim window.load Event.");
         // Fallback: Versuche es etwas später nochmal, falls Skripte asynchron laden.
         setTimeout(startObserver, 1000);
    }
});
