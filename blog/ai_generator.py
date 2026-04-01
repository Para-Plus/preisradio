"""
AI article generator — supports Groq (OpenAI-compatible), Mistral, and Anthropic Claude.
"""
import json
import logging
import re

from openai import OpenAI
from django.conf import settings

logger = logging.getLogger(__name__)


CATEGORY_STRUCTURES = {
    'Kaufberatung': """
Struktur für Kaufberatung (Buying Guide) — MINDESTENS 2000 Wörter:
1. <h2>Einleitung</h2> — Warum ist dieses Thema wichtig? Für wen ist dieser Ratgeber? Welche Fragen beantwortet er? (mind. 150 Wörter)
2. <h2>Worauf beim Kauf achten?</h2> — Die 6–8 wichtigsten Kaufkriterien, jedes als eigener <h3> mit 2–3 Sätzen Erklärung und einer <ul>/<li> Liste konkreter Punkte
3. <h2>Unsere Top-Empfehlungen im Überblick</h2> — 4–5 konkrete Produktempfehlungen mit Preisspanne, Kurzprofil (2–3 Sätze), Vor- und Nachteile als <ul>/<li>
4. <h2>Vergleichstabelle der Empfehlungen</h2> — HTML <table>:
   <table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Produkt</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Preis (ca.)</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Stärken</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Schwächen</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Ideal für</th></tr></thead><tbody><!-- mind. 4 Zeilen --></tbody></table>
5. <h2>Preisvergleich: Wo kauft man am günstigsten?</h2> — Saturn, MediaMarkt, Otto, Kaufland, Amazon vergleichen; Tipps zu Preisschwankungen, wann Preise fallen, wie man Angebote findet (mind. 200 Wörter)
6. <h2>Häufige Fehler beim Kauf</h2> — 5 typische Fallstricke als nummerierte Liste, jeweils mit kurzer Erläuterung warum das ein Fehler ist und wie man ihn vermeidet
7. <h2>Praktische Tipps für die Kaufentscheidung</h2> — Checkliste als <ul>/<li>: Was tun vor dem Kauf, im Laden, beim Online-Kauf (mind. 150 Wörter)
8. <h2>Häufig gestellte Fragen (FAQ)</h2> — 6 Fragen, jede als <h3> mit ausführlicher <p> Antwort (mind. 50 Wörter je Antwort)
9. <h2>Fazit & Kaufempfehlung</h2> — Zusammenfassung der wichtigsten Punkte, klare Empfehlung für verschiedene Budgets und Zielgruppen (mind. 150 Wörter)""",

    'Spartipps': """
Struktur für Spartipps (Saving Tips) — MINDESTENS 2000 Wörter:
1. <h2>Einleitung</h2> — Wie viel kann man sparen? Warum lohnt sich ein Preisvergleich? Überblick was der Artikel bietet (mind. 150 Wörter)
2. <h2>Die 8 besten Spartipps</h2> — Jeder Tipp als eigener <h3> mit konkretem Sparpotenzial in €, ausführlicher Erklärung (3–4 Sätze), Beispiel und <ul>/<li> mit Untermaßnahmen
3. <h2>Preisvergleich richtig nutzen</h2> — Wie man Preisradio.de und andere Tools effektiv einsetzt; welche Filter und Funktionen helfen; Preisverlauf verstehen (mind. 200 Wörter)
4. <h2>Wann sind die besten Kaufzeitpunkte?</h2> — Saisonale Angebote, Black Friday, Prime Day, Cyber Monday, After-Christmas-Sales; <table> mit Monaten und typischen Rabatten:
   <table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Zeitraum</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Event</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Typische Ersparnis</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Tipps</th></tr></thead><tbody><!-- mind. 5 Zeilen --></tbody></table>
5. <h2>Gutscheine, Cashback & Rabattaktionen</h2> — Wo findet man Gutscheincodes? Cashback-Portale erklärt; Newsletter-Rabatte und Treueprogramme (mind. 200 Wörter)
6. <h2>Refurbished & Gebraucht: Lohnt sich das?</h2> — Chancen und Risiken beim Kauf von generalüberholten Geräten; worauf zu achten ist; Preisersparnis-Beispiele
7. <h2>Geheimtipps von Experten</h2> — 5 weniger bekannte Tricks als <ul>/<li> mit jeweils 2–3 Sätzen Erklärung
8. <h2>Häufig gestellte Fragen (FAQ)</h2> — 6 Fragen, jede als <h3> mit ausführlicher <p> Antwort (mind. 50 Wörter je Antwort)
9. <h2>Fazit: So sparst du am meisten</h2> — Die 5 wichtigsten Regeln auf einen Blick, Abschluss-Motivation (mind. 150 Wörter)""",

    'Technik': """
Struktur für Technik (Technology Deep-Dive) — MINDESTENS 2000 Wörter:
1. <h2>Einleitung</h2> — Was ist die Technologie? Warum ist sie gerade jetzt relevant? Was lernt der Leser? (mind. 150 Wörter)
2. <h2>Grundlagen: So funktioniert es</h2> — Technische Erklärung verständlich für Laien, Analogien verwenden, Schritt-für-Schritt als <ol>/<li> (mind. 250 Wörter)
3. <h2>Technische Spezifikationen im Überblick</h2> — HTML <table> mit mindestens 8 Zeilen:
   <table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Eigenschaft</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Wert / Details</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Bedeutung für den Nutzer</th></tr></thead><tbody><!-- mind. 8 Zeilen --></tbody></table>
4. <h2>Vorteile im Detail</h2> — Jeder Vorteil als eigener <h3> mit ausführlicher Erklärung und Praxisbeispiel (mind. 4 Vorteile)
5. <h2>Nachteile und Grenzen</h2> — Ehrliche Kritik: Was kann die Technologie nicht? Wo sind die Grenzen? (mind. 3 Punkte mit je 3–4 Sätzen)
6. <h2>Vergleich: Generationen / Alternativen</h2> — Wie unterscheidet sich die aktuelle Version von der Vorgängergeneration oder Konkurrenzlösungen? Tabelle oder Aufzählung
7. <h2>Für wen lohnt sich das?</h2> — 3–4 konkrete Zielgruppen als <h3> mit je 2–3 Sätzen Begründung
8. <h2>Kaufempfehlung: Die besten Modelle</h2> — 3–4 konkrete Produktbeispiele mit Preis, Händler (Saturn/MediaMarkt/Otto/Kaufland), Kurzprofil
9. <h2>Häufig gestellte Fragen (FAQ)</h2> — 6 Fragen, jede als <h3> mit ausführlicher <p> Antwort (mind. 50 Wörter je Antwort)
10. <h2>Fazit & Zukunftsausblick</h2> — Zusammenfassung + wohin geht die Technologie in den nächsten Jahren? (mind. 150 Wörter)""",

    'Nachrichten': """
Struktur für Nachrichten (News) — MINDESTENS 2000 Wörter:
1. <h2>Das Wichtigste in Kürze</h2> — 5–6 Key Facts als <ul>/<li> Stichpunkte mit je 1–2 Sätzen
2. <h2>Was ist passiert? — Die Meldung im Detail</h2> — Vollständige Erklärung (Wer, Was, Wann, Wo, Wie); Chronologie der Ereignisse als <ol>/<li> (mind. 300 Wörter)
3. <h2>Hintergrund und Kontext</h2> — Wie kam es dazu? Vorgeschichte, Marktentwicklung, beteiligte Unternehmen; ausführliche Einordnung (mind. 300 Wörter)
4. <h2>Reaktionen aus der Branche</h2> — Wie reagieren Experten, Wettbewerber, Analysten? Verschiedene Perspektiven darstellen (mind. 200 Wörter)
5. <h2>Was bedeutet das für Verbraucher?</h2> — Konkrete Auswirkungen auf Preise, Produktverfügbarkeit, Auswahl, Service; mit Zahlen und Beispielen (mind. 250 Wörter)
6. <h2>Vergleich: Vor und nach der Meldung</h2> — HTML <table> mit Gegenüberstellung der Situation davor und danach:
   <table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Aspekt</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Vorher</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Nachher</th></tr></thead><tbody><!-- mind. 5 Zeilen --></tbody></table>
7. <h2>Was sollten Käufer jetzt tun?</h2> — Handlungsempfehlungen als nummerierte Liste; Tipps zum richtigen Zeitpunkt für Käufe (mind. 200 Wörter)
8. <h2>Häufig gestellte Fragen (FAQ)</h2> — 6 Fragen, jede als <h3> mit ausführlicher <p> Antwort (mind. 50 Wörter je Antwort)
9. <h2>Ausblick: Was kommt als Nächstes?</h2> — Szenarien und Prognosen; wann gibt es neue Informationen? (mind. 150 Wörter)""",

    'Testberichte': """
Struktur für Testberichte (Produkttest & Vergleich) — MINDESTENS 2000 Wörter:
1. <h2>Einleitung</h2> — Welche Produkte werden getestet? Warum dieser Vergleich? Wer sollte diesen Artikel lesen? (mind. 150 Wörter)
2. <h2>Die Testkandidaten im Überblick</h2> — Jedes Produkt als eigener <h3> mit Preis, Hauptmerkmalen, Positionierung im Markt (2–3 Sätze pro Produkt, mind. 3 Produkte)
3. <h2>Hauptvergleichstabelle</h2> — HTML <table> mit allen Produkten im direkten Vergleich (mind. 10 Kriterienzeilen):
   <table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Kriterium</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Produkt A</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Produkt B</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Produkt C</th></tr></thead>
   <tbody><!-- Zeilen: Preis, Display, Prozessor, Akku, Kamera, Speicher, Gewicht, Bewertung, Garantie, Besonderheiten --></tbody></table>
4. <h2>Design & Verarbeitung</h2> — Aussehen, Materialqualität, Haptik, Größe und Gewicht für jedes Produkt im Vergleich (mind. 200 Wörter)
5. <h2>Leistung & Performance</h2> — Benchmarks, Alltagsperformance, Gaming/Multitasking, Benchmark-Tabelle wenn möglich (mind. 250 Wörter)
6. <h2>Akku & Laufzeit</h2> — Akkukapazität, gemessene Laufzeiten in verschiedenen Szenarien, Ladegeschwindigkeit (mind. 150 Wörter)
7. <h2>Kamera & Multimedia</h2> (falls relevant) — Kameraqualität, Video, Besonderheiten; oder angepasstes Kapitel für andere Produkttypen (mind. 150 Wörter)
8. <h2>Preis-Leistungs-Verhältnis</h2> — Kosten vs. gebotene Leistung für jedes Gerät; Preisvergleich bei Saturn / MediaMarkt / Otto / Kaufland (mind. 150 Wörter)
9. <h2>Stärken & Schwächen jedes Produkts</h2> — Pro/Contra als <ul>/<li> für jedes Produkt in eigenem <h3>
10. <h2>Häufig gestellte Fragen (FAQ)</h2> — 6 Fragen, jede als <h3> mit ausführlicher <p> Antwort (mind. 50 Wörter je Antwort)
11. <h2>Fazit: Testsieger & Empfehlungen</h2> — Klarer Testsieger mit Begründung; Empfehlungen nach Budget (unter 200€, 200–500€, über 500€); alternative Szenarien (mind. 200 Wörter)""",
}




def _sanitize_base_content(text, max_chars=8000):
    """Strip HTML tags and truncate base_content to a safe size for the prompt."""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Truncate to max_chars
    if len(text) > max_chars:
        text = text[:max_chars].rsplit(' ', 1)[0] + ' [...]'
    return text


def _build_prompt(topic, category, base_content, structure):
    """Build the generation or reformulation prompt."""
    if base_content and len(base_content.strip()) > 200:
        return f"""Du bist ein erfahrener Tech-Journalist für Preisradio.de, einen deutschen Preisvergleich für Elektronik (Saturn, MediaMarkt, Otto, Kaufland).

Thema: "{topic}"
Kategorie: {category}

Du erhältst einen Rohtext als Grundlage. Deine Aufgabe:
1. Den Inhalt des Rohtexts vollständig aufgreifen und KEINE Informationen weglassen
2. Den Text professionell umschreiben, strukturieren und auf MINDESTENS 2000 Wörter ausbauen
3. Fehlende Abschnitte gemäß der Artikelstruktur ergänzen
4. Eigene Recherchen und Expertise einfließen lassen, um den Artikel zu bereichern

ROHTEXT ZUM UMSCHREIBEN UND ERWEITERN:
---
{base_content}
---

Verwende folgende Artikelstruktur — alle Abschnitte vollständig ausschreiben:
{structure}

Antworte ausschließlich mit validem JSON. WICHTIG: Beginne mit dem content-Feld (dem längsten Feld):
{{
    "content": "<p>VOLLSTÄNDIGER HTML-Inhalt mit <h2>, <p>, <ul>, <li>, <b> Tags — MINDESTENS 2000 Wörter...</p>",
    "title": "Ansprechender Titel basierend auf dem Rohtext (max 100 Zeichen)",
    "excerpt": "Kurze Zusammenfassung (max 300 Zeichen)",
    "seo_title": "SEO-Titel für Google (max 60 Zeichen)",
    "meta_description": "Meta-Beschreibung (max 155 Zeichen)",
    "amazon_keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
    "read_time": 10
}}

PFLICHTREGELN:
- content ZUERST und VOLLSTÄNDIG schreiben (mind. 2000 Wörter HTML)
- Alle Fakten aus dem Rohtext übernehmen und ausbauen
- <h2> für Hauptabschnitte, <h3> für Unter, <b> für Schlüsselbegriffe, <ul>/<li> für Listen
- Mind. 1 HTML-Tabelle (<table> mit inline styles)
- Keine <h1>, kein Markdown — nur HTML
- amazon_keywords: 5 deutsche Suchbegriffe, kommagetrennt"""
    else:
        return f"""Du bist ein erfahrener Tech-Journalist für Preisradio.de, einen deutschen Preisvergleich für Elektronik (Saturn, MediaMarkt, Otto, Kaufland).

Schreibe einen SEHR AUSFÜHRLICHEN Blog-Artikel auf Deutsch zum Thema: "{topic}"
Kategorie: {category}

Verwende folgende Artikelstruktur — jeder Abschnitt muss vollständig und ausführlich ausgeschrieben werden:
{structure}

Antworte ausschließlich mit validem JSON. WICHTIG: Beginne mit dem content-Feld (dem längsten Feld):
{{
    "content": "<p>VOLLSTÄNDIGER HTML-Inhalt mit <h2>, <p>, <ul>, <li>, <b> Tags — MINDESTENS 2000 Wörter...</p>",
    "title": "Ansprechender Titel (max 100 Zeichen)",
    "excerpt": "Kurze Zusammenfassung (max 300 Zeichen)",
    "seo_title": "SEO-Titel für Google (max 60 Zeichen)",
    "meta_description": "Meta-Beschreibung (max 155 Zeichen)",
    "amazon_keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
    "read_time": 10
}}

PFLICHTREGELN — unbedingt einhalten:
- content ZUERST und VOLLSTÄNDIG schreiben (mind. 2000 Wörter HTML)
- Professionell, neutral und informativ auf Deutsch
- <h2> für Hauptabschnitte, <h3> für Unter, <b> für Schlüsselbegriffe, <ul>/<li> für Listen
- Mind. 1 HTML-Tabelle (<table> mit inline styles)
- Keine <h1>, kein Markdown — nur HTML
- amazon_keywords: 5 deutsche Suchbegriffe, kommagetrennt"""


SYSTEM_PROMPT = (
    "Du bist ein erfahrener Tech-Journalist. Schreibe sehr ausführliche Artikel mit "
    "MINDESTENS 2000 Wörtern. Antworte ausschließlich mit validem JSON. "
    "Kein Markdown, kein erklärender Text — nur das JSON-Objekt."
)


def _call_llm(provider, prompt):
    """Call the LLM provider and return the raw text response."""
    if provider.startswith('claude'):
        import anthropic
        model_id = (
            'claude-sonnet-4-6' if provider == 'claude-sonnet'
            else 'claude-haiku-4-5-20251001'
        )
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model=model_id,
            max_tokens=16000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text.strip()
    elif provider == 'mistral':
        client = OpenAI(
            api_key=settings.MISTRAL_API_KEY,
            base_url="https://api.mistral.ai/v1",
        )
        response = client.chat.completions.create(
            model='mistral-small-latest',
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=16384,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content or ''
        finish = response.choices[0].finish_reason
        if finish == 'length':
            logger.warning("Mistral response truncated (finish_reason=length), %d chars", len(raw))
        return raw.strip()
    else:
        client = OpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )
        response = client.chat.completions.create(
            model=getattr(settings, 'GROQ_MODEL', 'llama-3.3-70b-versatile'),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=8000,
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content.strip()


def generate_article(topic, category='Kaufberatung', base_content='', provider='groq'):
    """Generate a blog article using Groq, Mistral, or Claude API.

    provider: 'groq' | 'mistral' | 'claude-sonnet' | 'claude-haiku'
    Returns dict with keys: title, excerpt, content, amazon_keywords, read_time
    """
    structure = CATEGORY_STRUCTURES.get(category, CATEGORY_STRUCTURES['Kaufberatung'])

    if base_content:
        base_content = _sanitize_base_content(base_content, max_chars=8000)

    prompt = _build_prompt(topic, category, base_content, structure)

    # Try up to 2 times (retry once on JSON parse failure)
    last_error = None
    for attempt in range(2):
        raw = _call_llm(provider, prompt)
        logger.info("LLM response (%s, attempt %d): %d chars", provider, attempt + 1, len(raw))

        try:
            result = _parse_llm_response(raw)
            return result
        except ValueError as e:
            last_error = e
            logger.warning("Attempt %d failed: %s", attempt + 1, e)
            if attempt == 0:
                logger.info("Retrying LLM call...")
                continue

    raise last_error


def _repair_truncated_json(raw):
    """Attempt to repair truncated JSON by closing open strings and braces.

    When an LLM response is cut off mid-generation, we get valid JSON up to
    a point, then a truncated string or value. This function tries to find
    the last complete key-value pair and close the object.
    """
    # Strategy: find the last complete "key": "value" or "key": number pattern
    # and close the JSON after it.

    # Find the last complete string value ending with '",' or '"\n' or '" '
    # Pattern: last occurrence of a quoted value followed by comma or end
    last_complete = -1
    in_str = False
    escape = False
    for i, ch in enumerate(raw):
        if escape:
            escape = False
            continue
        if ch == '\\' and in_str:
            escape = True
            continue
        if ch == '"':
            if in_str:
                # End of string — check if this is followed by , or } or :
                in_str = False
                # Look ahead for comma, colon, or whitespace
                rest = raw[i + 1:i + 10].lstrip()
                if rest and rest[0] in (',', '}', ':'):
                    if rest[0] in (',', '}'):
                        last_complete = i
            else:
                in_str = True
        elif not in_str and ch in (',',):
            last_complete = i

    if last_complete > 0:
        # Truncate at the last complete value
        repaired = raw[:last_complete + 1].rstrip().rstrip(',')
        # Close the JSON object
        repaired += '}'
        logger.info("Repaired truncated JSON: cut at char %d, total %d chars", last_complete, len(repaired))
        return repaired

    raise ValueError(
        f"JSON-Reparatur fehlgeschlagen — keine vollständigen Felder gefunden. "
        f"Antwort-Anfang: {raw[:300]}"
    )


def _parse_llm_response(raw):
    """Parse and validate the raw LLM response into a dict."""
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = re.sub(r'^```(?:json)?\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw)

    # Fix invalid control characters inside JSON string values.
    def _fix_control_chars(s):
        out = []
        in_string = False
        escape = False
        for ch in s:
            if escape:
                out.append(ch)
                escape = False
                continue
            if ch == '\\' and in_string:
                out.append(ch)
                escape = True
                continue
            if ch == '"':
                in_string = not in_string
            if in_string and ch != '"':
                code = ord(ch)
                if code < 0x20:
                    if ch == '\n':
                        out.append('\\n')
                    elif ch == '\r':
                        out.append('\\r')
                    elif ch == '\t':
                        out.append('\\t')
                    else:
                        out.append(f'\\u{code:04x}')
                    continue
            out.append(ch)
        return ''.join(out)

    raw = _fix_control_chars(raw)

    # Fix invalid JSON escape sequences LLMs sometimes produce: \s, \d, \e, etc.
    raw = re.sub(r'\\(?!["\\\\/bfnrtu]|u[0-9a-fA-F]{4})', r'\\\\', raw)

    # Guard: if provider returned an HTML error page instead of JSON
    if raw.lstrip().startswith('<'):
        raise ValueError(
            "API hat kein JSON zurückgegeben (HTML-Fehlerseite). "
            f"Antwort-Anfang: {raw[:200]}"
        )

    # Extract JSON object robustly — LLMs sometimes add text before/after the JSON
    json_start = raw.find('{')
    json_end = raw.rfind('}')

    if json_start == -1:
        raise ValueError(
            f"Kein JSON-Objekt in der Antwort gefunden. "
            f"Antwort-Anfang: {raw[:300]}"
        )

    if json_end != -1 and json_end > json_start:
        raw = raw[json_start:json_end + 1]
    else:
        # Truncated response (has '{' but no closing '}') — try to repair
        logger.warning("Truncated JSON detected (%d chars, no closing brace). Attempting repair.", len(raw))
        raw = _repair_truncated_json(raw[json_start:])

    try:
        result = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"JSON-Parsing fehlgeschlagen ({e}). "
            f"Antwort ({len(raw)} chars): {raw[:500]}"
        )

    # content is the only truly essential field (it's generated first)
    if 'content' not in result:
        raise ValueError(f"Missing key in AI response: content")

    # Derive missing metadata from content if truncated
    if 'title' not in result:
        # Extract from first <h2> or use topic
        h2_match = re.search(r'<h2[^>]*>(.*?)</h2>', result['content'])
        result['title'] = re.sub(r'<[^>]+>', '', h2_match.group(1))[:100] if h2_match else 'Entwurf'
        logger.warning("Title missing — derived from content: %s", result['title'])
    if 'excerpt' not in result:
        # Extract from first <p>
        p_match = re.search(r'<p[^>]*>(.*?)</p>', result['content'])
        result['excerpt'] = re.sub(r'<[^>]+>', '', p_match.group(1))[:300] if p_match else result['title']
    result.setdefault('seo_title', result['title'][:60])
    result.setdefault('meta_description', result['excerpt'][:155])
    result.setdefault('amazon_keywords', '')
    result.setdefault('read_time', 10)

    return result
