# -*- coding: utf-8 -*-
"""Regenerate js/components.js from components/*.html.

Run after editing a component:
    python build.py

This bundles the shared header/navbar/footer markup into a JavaScript file so
the site renders correctly whether it is opened over http:// or by
double-clicking a file (file://) — avoiding the browser CORS/AJAX restriction.
"""
import os

base = os.path.dirname(os.path.abspath(__file__))
os.chdir(base)

components = {
    "header": "components/header.html",
    "navbar": "components/navbar.html",
    "footer": "components/footer.html",
}


def esc(s):
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")


parts = []
for key, path in components.items():
    with open(path, "r", encoding="utf-8") as f:
        content = f.read().strip("\n")
    parts.append("  %s: `%s`" % (key, esc(content)))

js = "window.COMPONENTS = {\n" + ",\n".join(parts) + "\n};\n"
with open("js/components.js", "w", encoding="utf-8") as f:
    f.write(js)

print("Generated js/components.js (%d bytes)" % len(js))
