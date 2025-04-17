/**
 * @fileoverview Content script for NotebookLM LaTeX Renderer extension.
 * Uses KaTeX auto-render extension to find and render LaTeX expressions.
 * Observes DOM changes to render LaTeX in dynamically loaded content.
 */

console.log("NotebookLM LaTeX Renderer: Content script geladen.");

/**
 * Funktion zum Ausführen des KaTeX Auto-Renderings für ein bestimmtes Element.
 * @param {Node} targetNode Das Wurzelelement, in dem nach LaTeX gesucht werden soll.
 */
function renderLatexInNode(targetNode) {
    if (typeof renderMathInElement === 'function') {
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
const CHAT_CONTAINER_SELECTOR = 'body'; // Starte breit, spezifiziere später!

// --- MutationObserver-Setup ---

// Funktion, die bei DOM-Änderungen aufgerufen wird
const mutationCallback = (mutationsList, observer) => {
    let needsRender = false;
    for (const mutation of mutationsList) {
        // Prüfen, ob Knoten hinzugefügt wurden
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
                // Prüfen, ob der neue Knoten selbst oder seine Kinder Text enthalten,
                // der potenziell LaTeX sein könnte ($ oder \).
                // Wir rendern vorsichtshalber bei jeder relevanten Änderung.
                 if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
                    if (node.textContent && (node.textContent.includes('$') || node.textContent.includes('\\'))) {
                         needsRender = true;
                         // Wir könnten hier gezielt nur 'node' rendern, aber das
                         // Neurendern des gesamten Containers ist mit auto-render oft einfacher.
                         // renderLatexInNode(node.parentElement || document.body); // Gezielter Ansatz
                    }
                 }
            });
        }
        // Optional: Auf Änderungen an Textinhalten achten (kann Performance kosten!)
        // else if (mutation.type === 'characterData') {
        //    if (mutation.target.textContent && (mutation.target.textContent.includes('$') || mutation.target.textContent.includes('\\'))) {
        //        needsRender = true;
        //        // renderLatexInNode(mutation.target.parentElement || document.body); // Gezielter Ansatz
        //    }
        // }
    }

    // Führe das Rendering aus, wenn relevante Änderungen erkannt wurden
    if (needsRender) {
        console.log("NotebookLM LaTeX Renderer: Änderungen erkannt, starte Rendering...");
        // Rendere den gesamten beobachteten Bereich neu.
        // TODO: Für bessere Performance könnte man hier "debouncing" einbauen,
        //       um zu verhindern, dass die Funktion bei vielen schnellen Änderungen
        //       ständig aufgerufen wird.
         renderLatexInNode(document.querySelector(CHAT_CONTAINER_SELECTOR) || document.body);
    }
};

// Funktion zum Starten des Observers
function startObserver() {
    const targetNode = document.querySelector(CHAT_CONTAINER_SELECTOR);

    if (targetNode) {
        console.log("NotebookLM LaTeX Renderer: Ziel-Container gefunden:", CHAT_CONTAINER_SELECTOR, ". Starte Observer und initiales Rendering.");
        // 1. Initiales Rendering für bereits vorhandenen Inhalt
        renderLatexInNode(targetNode);

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
