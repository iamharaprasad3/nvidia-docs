// =============================================================================
// mermaid-init.js
//
// Material for MkDocs auto-switches mermaid between its 'default' and 'dark'
// themes based on the active color scheme. The dark theme uses dark fills with
// light text, which collides with our classDef-styled pastel boxes (which use
// dark text). We pin mermaid to a single 'base' theme with a fixed palette so
// every diagram looks the same in light and dark modes — pastel/grey fills,
// dark borders, dark labels — and remains legible on either page background.
// =============================================================================

(function () {
    var BASE_VARS = {
        background: "transparent",
        primaryColor: "#f5f5f5",
        primaryBorderColor: "#383838",
        primaryTextColor: "#1f1f1f",
        secondaryColor: "#e5e7eb",
        tertiaryColor: "#f3f4f6",
        lineColor: "#383838",
        mainBkg: "#f5f5f5",
        nodeBkg: "#f5f5f5",
        nodeBorder: "#383838",
        clusterBkg: "#fafafa",
        clusterBorder: "#6b7280",
        titleColor: "#1f1f1f",
        edgeLabelBackground: "#ffffff",
        textColor: "#1f1f1f",
        // sequence diagram
        actorBkg: "#f5f5f5",
        actorBorder: "#383838",
        actorTextColor: "#1f1f1f",
        actorLineColor: "#6b7280",
        signalColor: "#1f1f1f",
        signalTextColor: "#1f1f1f",
        labelBoxBkgColor: "#f5f5f5",
        labelBoxBorderColor: "#383838",
        labelTextColor: "#1f1f1f",
        loopTextColor: "#1f1f1f",
        noteBorderColor: "#B45309",
        noteBkgColor: "#FEF3C7",
        noteTextColor: "#78350F",
        // state diagram
        labelColor: "#1f1f1f",
    };

    function pinTheme() {
        if (typeof window.mermaid === "undefined") return;
        try {
            window.mermaid.initialize({
                startOnLoad: false,
                securityLevel: "loose",
                theme: "base",
                themeVariables: BASE_VARS,
                flowchart: { htmlLabels: true, curve: "basis" },
                sequence: { useMaxWidth: true },
                themeCSS: [
                    ".edgeLabel { background-color: #ffffff !important; color: #1f1f1f !important; }",
                    ".edgeLabel rect { fill: #ffffff !important; }",
                    ".cluster rect { fill: #fafafa !important; stroke: #6b7280 !important; }",
                    ".cluster .nodeLabel { color: #1f1f1f !important; fill: #1f1f1f !important; }",
                    "text.actor { fill: #1f1f1f !important; }",
                ].join(" "),
            });
        } catch (e) {
            // mermaid may not be ready on the very first call — try again later
        }
    }

    // Pin once at load so Material's own initialize call uses our config when
    // it lands; pin again on every page navigation so theme toggles & SPA-style
    // route changes don't reintroduce the dark mermaid theme.
    pinTheme();

    if (typeof document$ !== "undefined" && document$.subscribe) {
        document$.subscribe(function () {
            pinTheme();
            if (window.mermaid && typeof window.mermaid.run === "function") {
                try {
                    window.mermaid.run({ querySelector: ".mermaid" });
                } catch (e) {
                    // ignore — Material will run mermaid itself
                }
            }
        });
    }
})();
