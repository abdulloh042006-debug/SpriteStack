#!/usr/bin/env python3
"""Bundles modular ES modules into a single self-contained Canvas HTML file."""
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT_CANVAS = '/working_dir/c_374fa3ba6d41fd2a/artifacts/file_generation/ttl=63d/output/sprite_stack_racing.html'
OUT_PUBLIC = os.path.join(ROOT, 'public/index.html')

MODULES = [
    'src/data/vehicles.js',
    'src/data/tracks.js',
    'src/engine/progression.js',
    'src/engine/spriteStacker.js',
    'src/engine/physics.js',
    'src/app.js',
]

def strip_esm(code: str) -> str:
    # Remove import statements (single and multi-line)
    code = re.sub(r'^\s*import\s+[\s\S]*?from\s+[\'"][^\'"]+[\'"];?\s*$', '', code, flags=re.MULTILINE)
    # Remove export keywords
    code = re.sub(r'^\s*export\s+(?=(const|let|var|function|class)\b)', '', code, flags=re.MULTILINE)
    return code

def main():
    template = open(os.path.join(ROOT, 'src/template.html'), encoding='utf-8').read()
    parts = []
    for rel in MODULES:
        raw = open(os.path.join(ROOT, rel), encoding='utf-8').read()
        parts.append(f'// === MODULE: {rel} ===\n' + strip_esm(raw))
    bundle = '<script>\n(() => {\n  "use strict";\n' + '\n\n'.join(parts) + '\n})();\n</script>'
    assert '<!-- INLINED_APP_BUNDLE -->' in template, 'Placeholder missing in template.html'
    final_html = template.replace('<!-- INLINED_APP_BUNDLE -->', bundle)

    os.makedirs(os.path.dirname(OUT_CANVAS), exist_ok=True)
    os.makedirs(os.path.dirname(OUT_PUBLIC), exist_ok=True)
    open(OUT_CANVAS, 'w', encoding='utf-8').write(final_html)
    open(OUT_PUBLIC, 'w', encoding='utf-8').write(final_html)
    print(f'Bundled {len(MODULES)} modules -> {OUT_CANVAS} ({len(final_html)} bytes)')

if __name__ == '__main__':
    main()
