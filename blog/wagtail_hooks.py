"""
Wagtail hooks: inject AI generate button into BlogPage editor.
Creates a draft page server-side and redirects to its edit page.
"""
from django.urls import path
from django.utils.html import format_html

from wagtail import hooks

from blog.views_admin import ai_generate_ajax
from blog.views_pinterest import (
    pinterest_connect, pinterest_callback, pinterest_disconnect,
    pinterest_status, pinterest_publish,
)


@hooks.register('register_admin_urls')
def register_ai_urls():
    return [
        path('ai-generate/', ai_generate_ajax, name='ai-generate'),
        path('pinterest/connect/', pinterest_connect, name='pinterest-connect'),
        path('pinterest/callback/', pinterest_callback, name='pinterest-callback'),
        path('pinterest/disconnect/', pinterest_disconnect, name='pinterest-disconnect'),
        path('pinterest/status/', pinterest_status, name='pinterest-status'),
        path('pinterest/publish/', pinterest_publish, name='pinterest-publish'),
    ]


@hooks.register('insert_editor_js')
def editor_js():
    return format_html("""
<script>
(function() {{
    function init() {{
        const excerptField = document.getElementById('id_excerpt');
        if (!excerptField) return;
        if (document.getElementById('ai-generate-btn')) return;

        const titleField = document.getElementById('id_title');
        if (!titleField) return;

        // Container
        const container = document.createElement('div');
        container.style.cssText = 'margin:12px 0 16px;display:flex;align-items:center;gap:12px;';

        // Topic input
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'ai-topic-input';
        input.placeholder = 'Thema eingeben (z.B. Beste Kopfhörer unter 100€)';
        input.style.cssText = 'flex:1;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;';

        // Category select
        const catSelect = document.createElement('select');
        catSelect.id = 'ai-category-select';
        catSelect.style.cssText = 'padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;background:#fff;';
        ['Kaufberatung','Spartipps','Technik','Nachrichten','Testberichte'].forEach(function(c) {{
            const opt = document.createElement('option');
            opt.value = c; opt.textContent = c;
            catSelect.appendChild(opt);
        }});

        // Provider/model select
        const providerSelect = document.createElement('select');
        providerSelect.id = 'ai-provider-select';
        providerSelect.style.cssText = 'padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;background:#fff;';
        [
            {{value:'groq', label:'Groq · Llama 3.3 (gratis)'}},
            {{value:'mistral', label:'Mistral Small (EU, schnell + gut für Deutsch)'}},
            {{value:'claude-sonnet', label:'Claude Sonnet 4.6 (beste Qualität)'}},
            {{value:'claude-haiku', label:'Claude Haiku 4.5 (schnell)'}},
        ].forEach(function(m) {{
            const opt = document.createElement('option');
            opt.value = m.value; opt.textContent = m.label;
            providerSelect.appendChild(opt);
        }});

        // Button
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'ai-generate-btn';
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Artikel generieren';
        btn.style.cssText = 'padding:8px 18px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;display:flex;align-items:center;';

        container.appendChild(input);
        container.appendChild(catSelect);
        container.appendChild(providerSelect);
        container.appendChild(btn);

        const titlePanel = titleField.closest('[data-field]') || titleField.closest('.w-panel') || titleField.parentElement.parentElement;
        titlePanel.parentElement.insertBefore(container, titlePanel.nextSibling);

        // ── Basisinhalt Textarea (Rohtext zum Umschreiben) ───────────────
        const baseToggle = document.createElement('button');
        baseToggle.type = 'button';
        baseToggle.id = 'ai-base-toggle';
        baseToggle.innerHTML = '📄 Rohtext eingeben (optional — KI reformuliert und erweitert auf 2000+ Wörter)';
        baseToggle.style.cssText = 'margin-top:6px;padding:6px 14px;background:#f9fafb;color:#374151;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;display:block;width:100%;text-align:left;';

        const basePanel = document.createElement('div');
        basePanel.id = 'ai-base-panel';
        basePanel.style.cssText = 'display:none;margin-top:8px;';

        const baseLabel = document.createElement('div');
        baseLabel.style.cssText = 'font-size:12px;color:#6b7280;margin-bottom:6px;';
        baseLabel.innerHTML = '<b>Rohtext / Basisinhalt</b> — Mindestens 200 Wörter. Die KI übernimmt alle Fakten und baut sie zu einem strukturierten Artikel mit 2000+ Wörtern aus.';

        const baseTextarea = document.createElement('textarea');
        baseTextarea.id = 'ai-base-content';
        baseTextarea.rows = 10;
        baseTextarea.placeholder = 'Rohtext hier einf\u00fcgen \u2014 z.B. eigene Notizen, Produktbeschreibungen, Stichpunkte (mind. 200 W\u00f6rter). Beispiel: Samsung Galaxy S25: 999\u20ac, 6,2 Zoll Display, Snapdragon 8 Elite, Akku 4000 mAh...';
        baseTextarea.style.cssText = 'width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;font-family:monospace;line-height:1.5;resize:vertical;box-sizing:border-box;';

        const wordCountDisplay = document.createElement('div');
        wordCountDisplay.style.cssText = 'margin-top:4px;font-size:11px;color:#9ca3af;text-align:right;';
        wordCountDisplay.textContent = '0 Wörter';

        baseTextarea.addEventListener('input', function() {{
            const words = baseTextarea.value.trim().split(/\s+/).filter(Boolean).length;
            const color = words >= 200 ? '#059669' : words >= 100 ? '#d97706' : '#9ca3af';
            wordCountDisplay.style.color = color;
            wordCountDisplay.textContent = words + ' Wörter' + (words >= 200 ? ' ✓' : words > 0 ? ' (mind. 200 empfohlen)' : '');
        }});

        basePanel.appendChild(baseLabel);
        basePanel.appendChild(baseTextarea);
        basePanel.appendChild(wordCountDisplay);

        baseToggle.addEventListener('click', function() {{
            const isOpen = basePanel.style.display !== 'none';
            basePanel.style.display = isOpen ? 'none' : 'block';
            baseToggle.style.background = isOpen ? '#f9fafb' : '#eff6ff';
            baseToggle.style.borderColor = isOpen ? '#e5e7eb' : '#93c5fd';
            baseToggle.style.color = isOpen ? '#374151' : '#1d4ed8';
            if (!isOpen) baseTextarea.focus();
        }});

        container.parentElement.insertBefore(baseToggle, container.nextSibling);
        container.parentElement.insertBefore(basePanel, baseToggle.nextSibling);
        // ── End Basisinhalt ──────────────────────────────────────────────

        // Status
        const status = document.createElement('div');
        status.id = 'ai-status';
        status.style.cssText = 'display:none;padding:10px 14px;border-radius:6px;margin-bottom:12px;font-size:13px;';
        container.parentElement.insertBefore(status, container.nextSibling);

        // Spin CSS
        if (!document.getElementById('ai-spin-style')) {{
            const style = document.createElement('style');
            style.id = 'ai-spin-style';
            style.textContent = '@keyframes aispin {{ to {{ transform: rotate(360deg); }} }}';
            document.head.appendChild(style);
        }}

        // ── HTML Preview Panel ──────────────────────────────────────────
        const contentField = document.getElementById('id_content');
        if (contentField) {{
            const previewBtn = document.createElement('button');
            previewBtn.type = 'button';
            previewBtn.id = 'html-preview-btn';
            previewBtn.textContent = '👁 HTML-Vorschau';
            previewBtn.style.cssText = 'margin-top:8px;padding:6px 14px;background:#f3f4f6;color:#374151;border:1px solid #d1d5db;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;';

            const previewPane = document.createElement('div');
            previewPane.id = 'html-preview-pane';
            previewPane.style.cssText = 'display:none;margin-top:10px;padding:20px 24px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;max-height:600px;overflow-y:auto;font-family:Georgia,serif;font-size:16px;line-height:1.7;color:#111827;';

            const proseStyles = `
                <style>
                  #html-preview-pane h2{{font-size:1.35em;font-weight:700;margin:1.4em 0 0.5em;border-bottom:2px solid #e5e7eb;padding-bottom:0.25em;}}
                  #html-preview-pane h3{{font-size:1.1em;font-weight:600;margin:1.2em 0 0.4em;color:#1d4ed8;}}
                  #html-preview-pane p{{margin:0 0 0.9em;}}
                  #html-preview-pane ul,#html-preview-pane ol{{padding-left:1.5em;margin:0.6em 0 0.9em;}}
                  #html-preview-pane li{{margin-bottom:0.3em;}}
                  #html-preview-pane table{{width:100%;border-collapse:collapse;margin:1.2em 0;font-size:0.875em;border-radius:10px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.08),0 0 0 1px #e5e7eb;}}
                  #html-preview-pane thead{{background:#1e293b;}}
                  #html-preview-pane th{{padding:10px 13px;text-align:left;font-weight:600;font-size:0.75em;text-transform:uppercase;letter-spacing:0.04em;color:#e2e8f0;border:none;border-right:1px solid rgba(255,255,255,0.08);white-space:nowrap;}}
                  #html-preview-pane th:last-child{{border-right:none;}}
                  #html-preview-pane td{{padding:9px 13px;color:#374151;border:none;border-bottom:1px solid #f1f5f9;border-right:1px solid #f1f5f9;vertical-align:middle;}}
                  #html-preview-pane td:last-child{{border-right:none;}}
                  #html-preview-pane td:first-child{{font-weight:600;color:#1e293b;}}
                  #html-preview-pane tbody tr:nth-child(even) td{{background:#f8fafc;}}
                  #html-preview-pane tbody tr:hover td{{background:#eff6ff;}}
                  #html-preview-pane tbody tr:last-child td{{border-bottom:none;}}
                  #html-preview-pane b,#html-preview-pane strong{{font-weight:700;}}
                </style>
            `;

            function updatePreview() {{
                previewPane.innerHTML = proseStyles + contentField.value;
            }}

            previewBtn.addEventListener('click', function() {{
                if (previewPane.style.display === 'none') {{
                    updatePreview();
                    previewPane.style.display = 'block';
                    previewBtn.textContent = '✕ Vorschau schließen';
                    previewBtn.style.background = '#dbeafe';
                    previewBtn.style.borderColor = '#93c5fd';
                    previewBtn.style.color = '#1e40af';
                }} else {{
                    previewPane.style.display = 'none';
                    previewBtn.textContent = '👁 HTML-Vorschau';
                    previewBtn.style.background = '#f3f4f6';
                    previewBtn.style.borderColor = '#d1d5db';
                    previewBtn.style.color = '#374151';
                }}
            }});

            contentField.addEventListener('input', function() {{
                if (previewPane.style.display !== 'none') updatePreview();
            }});

            const contentWrapper = contentField.closest('[data-field]') || contentField.closest('.w-field') || contentField.parentElement;
            contentWrapper.appendChild(previewBtn);
            contentWrapper.appendChild(previewPane);
        }}
        // ── End Preview Panel ────────────────────────────────────────────

        btn.addEventListener('click', async function() {{
            const topic = input.value.trim();
            if (!topic) {{
                input.focus();
                input.style.borderColor = '#ef4444';
                return;
            }}
            input.style.borderColor = '#d1d5db';
            const category = catSelect.value;

            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid #93c5fd;border-top-color:#fff;border-radius:50%;animation:aispin 0.6s linear infinite;margin-right:6px;"></span>Generiert...';
            status.style.display = 'block';
            const baseForStatus = document.getElementById('ai-base-content')?.value?.trim() || '';
            const isReformMode = baseForStatus.length > 200;
            const selectedProvider = document.getElementById('ai-provider-select')?.value || 'groq';
            const providerLabel = selectedProvider === 'claude-sonnet' ? 'Claude Sonnet'
                : selectedProvider === 'claude-haiku' ? 'Claude Haiku'
                : selectedProvider === 'mistral' ? 'Mistral Small'
                : 'Groq';
            status.style.background = '#e0f2fe';
            status.style.color = '#1e40af';
            status.style.border = '1px solid #7dd3fc';
            status.textContent = isReformMode
                ? providerLabel + ' schreibt den Rohtext um und erweitert ihn auf 2000+ Wörter... Bitte warten.'
                : providerLabel + ' generiert den Artikel mit 2000+ Wörtern... Bitte warten.';

            try {{
                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value
                    || document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';

                const baseContent = document.getElementById('ai-base-content')?.value?.trim() || '';
                const provider = document.getElementById('ai-provider-select')?.value || 'groq';
                const modeLabel = baseContent.length > 200 ? 'Umschreiben & Erweitern' : 'Generieren';
                btn.querySelector('span') && (btn.querySelector('span').nextSibling.textContent = modeLabel + '...');

                const resp = await fetch('/wagtail-admin/ai-generate/', {{
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    }},
                    body: JSON.stringify({{ topic: topic, category: category, base_content: baseContent, provider: provider }}),
                }});

                const data = await resp.json();

                if (!resp.ok) {{
                    throw new Error(data.error || 'Fehler bei der Generierung');
                }}

                // Server created a draft page — redirect to its edit page
                status.style.background = '#d1fae5';
                status.style.color = '#065f46';
                status.style.border = '1px solid #6ee7b7';
                status.innerHTML = 'Artikel "<b>' + data.title + '</b>" als Entwurf erstellt! Weiterleitung...';

                setTimeout(function() {{
                    window.location.href = data.edit_url;
                }}, 1000);

            }} catch (err) {{
                status.style.background = '#fee2e2';
                status.style.color = '#991b1b';
                status.style.border = '1px solid #fca5a5';
                status.textContent = 'Fehler: ' + err.message;
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>AI generieren';
            }}
        }});
    }}

    if (document.readyState === 'loading') {{
        document.addEventListener('DOMContentLoaded', function() {{ setTimeout(init, 500); }});
    }} else {{
        setTimeout(init, 500);
    }}
}})();
</script>
""")


@hooks.register('insert_editor_js')
def pinterest_editor_js():
    return format_html("""
<script>
(function() {{
    function initPinterest() {{
        // Only on BlogPage edit pages (check for excerpt field)
        const excerptField = document.getElementById('id_excerpt');
        if (!excerptField) return;
        if (document.getElementById('pinterest-panel')) return;

        // Get page ID from URL: /wagtail-admin/pages/123/edit/
        const match = window.location.pathname.match(/\\/pages\\/(\\d+)\\/edit/);
        if (!match) return;
        const pageId = match[1];

        // Container
        const panel = document.createElement('div');
        panel.id = 'pinterest-panel';
        panel.style.cssText = 'margin:16px 0;padding:16px 20px;background:#fdf2f8;border:1px solid #f9a8d4;border-radius:8px;';

        const heading = document.createElement('div');
        heading.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:12px;';
        heading.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#E60023"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>'
            + '<span style="font-weight:700;font-size:15px;color:#831843;">Pinterest</span>';
        panel.appendChild(heading);

        // Status area
        const statusDiv = document.createElement('div');
        statusDiv.id = 'pinterest-status';
        statusDiv.style.cssText = 'margin-bottom:10px;font-size:13px;color:#6b7280;';
        statusDiv.textContent = 'Verbindungsstatus wird geladen...';
        panel.appendChild(statusDiv);

        // Actions area (will be filled after status check)
        const actionsDiv = document.createElement('div');
        actionsDiv.id = 'pinterest-actions';
        panel.appendChild(actionsDiv);

        // Insert before content field
        const contentField = document.getElementById('id_content');
        const target = contentField ? (contentField.closest('[data-field]') || contentField.closest('.w-field') || contentField.parentElement) : excerptField.parentElement;
        target.parentElement.insertBefore(panel, target);

        // Check status
        fetch('/wagtail-admin/pinterest/status/')
            .then(r => r.json())
            .then(data => {{
                if (data.connected) {{
                    statusDiv.innerHTML = '<span style="color:#059669;">&#10003; Mit Pinterest verbunden</span>'
                        + ' &nbsp;<a href="/wagtail-admin/pinterest/disconnect/" style="color:#dc2626;font-size:12px;">Trennen</a>';

                    // Board selector + publish button
                    if (data.boards && data.boards.length > 0) {{
                        const row = document.createElement('div');
                        row.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:8px;';

                        const sel = document.createElement('select');
                        sel.id = 'pinterest-board-select';
                        sel.style.cssText = 'padding:7px 12px;border:1px solid #f9a8d4;border-radius:6px;font-size:13px;background:#fff;flex:1;';
                        data.boards.forEach(function(b) {{
                            const opt = document.createElement('option');
                            opt.value = b.id;
                            opt.textContent = b.name + ' (' + b.pin_count + ' Pins)';
                            sel.appendChild(opt);
                        }});

                        const pubBtn = document.createElement('button');
                        pubBtn.type = 'button';
                        pubBtn.id = 'pinterest-publish-btn';
                        pubBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#E60023" style="vertical-align:middle;margin-right:6px;"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>Auf Pinterest teilen';
                        pubBtn.style.cssText = 'padding:7px 16px;background:#E60023;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;display:flex;align-items:center;';

                        const pubStatus = document.createElement('div');
                        pubStatus.id = 'pinterest-pub-status';
                        pubStatus.style.cssText = 'display:none;margin-top:8px;padding:8px 12px;border-radius:6px;font-size:13px;';

                        pubBtn.addEventListener('click', function() {{
                            const boardId = sel.value;
                            pubBtn.disabled = true;
                            pubBtn.style.opacity = '0.5';
                            pubBtn.textContent = 'Wird geteilt...';
                            pubStatus.style.display = 'none';

                            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value
                                || document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';

                            fetch('/wagtail-admin/pinterest/publish/', {{
                                method: 'POST',
                                headers: {{ 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken }},
                                body: JSON.stringify({{ page_id: pageId, board_id: boardId }}),
                            }})
                            .then(r => r.json())
                            .then(res => {{
                                pubStatus.style.display = 'block';
                                if (res.success) {{
                                    pubStatus.style.background = '#d1fae5';
                                    pubStatus.style.color = '#065f46';
                                    pubStatus.style.border = '1px solid #6ee7b7';
                                    pubStatus.innerHTML = 'Pin erstellt! <a href="' + res.pin_url + '" target="_blank" style="color:#1d4ed8;text-decoration:underline;">Auf Pinterest ansehen</a>';
                                }} else {{
                                    pubStatus.style.background = '#fee2e2';
                                    pubStatus.style.color = '#991b1b';
                                    pubStatus.style.border = '1px solid #fca5a5';
                                    pubStatus.textContent = 'Fehler: ' + (res.error || 'Unbekannter Fehler');
                                }}
                                pubBtn.disabled = false;
                                pubBtn.style.opacity = '1';
                                pubBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#fff" style="vertical-align:middle;margin-right:6px;"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>Auf Pinterest teilen';
                            }})
                            .catch(err => {{
                                pubStatus.style.display = 'block';
                                pubStatus.style.background = '#fee2e2';
                                pubStatus.style.color = '#991b1b';
                                pubStatus.style.border = '1px solid #fca5a5';
                                pubStatus.textContent = 'Fehler: ' + err.message;
                                pubBtn.disabled = false;
                                pubBtn.style.opacity = '1';
                            }});
                        }});

                        row.appendChild(sel);
                        row.appendChild(pubBtn);
                        actionsDiv.appendChild(row);
                        actionsDiv.appendChild(pubStatus);
                    }}
                }} else {{
                    statusDiv.innerHTML = '<span style="color:#dc2626;">&#10007; Nicht mit Pinterest verbunden</span>';
                    const connectBtn = document.createElement('a');
                    connectBtn.href = '/wagtail-admin/pinterest/connect/';
                    connectBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#fff" style="vertical-align:middle;margin-right:6px;"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>Mit Pinterest verbinden';
                    connectBtn.style.cssText = 'display:inline-flex;align-items:center;margin-top:8px;padding:8px 18px;background:#E60023;color:#fff;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;';
                    actionsDiv.appendChild(connectBtn);
                }}
            }})
            .catch(err => {{
                statusDiv.textContent = 'Pinterest-Status konnte nicht geladen werden.';
            }});
    }}

    if (document.readyState === 'loading') {{
        document.addEventListener('DOMContentLoaded', function() {{ setTimeout(initPinterest, 600); }});
    }} else {{
        setTimeout(initPinterest, 600);
    }}
}})();
</script>
""")
