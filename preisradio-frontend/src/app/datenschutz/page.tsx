import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              Datenschutzerklärung
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Informationen gemäß DSGVO
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">
            <section>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Wir freuen uns über Ihr Interesse an PreisRadio. Der Schutz Ihrer personenbezogenen Daten ist uns
                  wichtig. Nachfolgend informieren wir Sie ausführlich über den Umgang mit Ihren Daten gemäß der
                  Datenschutz-Grundverordnung (DSGVO).
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                1. Verantwortlicher
              </h2>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>Ghassen Gharbi</p>
                <p>Rue Cheikh Mohamed Ennaifer</p>
                <p>2036 La Soukra, Ariana</p>
                <p>Tunesien</p>
                <p className="pt-2">
                  E-Mail:{' '}
                  <a
                    href="mailto:contact@preisradio.de"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    contact@preisradio.de
                  </a>
                </p>
                <p>Website: https://preisradio.de/</p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                2. Hosting und Server-Log-Files
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Diese Website wird bei zwei Anbietern gehostet: Das Frontend läuft über{' '}
                  <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Die API/Backend-Dienste
                  laufen über <strong>serv00.com</strong> (ADMIN.NET.PL Tomasz Rzepka Arkadiusz Nowara S.C.), Bitwy
                  pod Monte Cassino 5/198, 33-100 Tarnów, Polen.
                </p>
                <p>
                  Da Vercel Inc. mit Sitz in den USA als Drittland im Sinne der DSGVO gilt, erfolgt die
                  Datenübermittlung dorthin auf Grundlage geeigneter Garantien (insbesondere EU-Standardvertragsklauseln
                  bzw. das EU-US Data Privacy Framework, soweit vom Anbieter zertifiziert). serv00.com hat seinen Sitz
                  innerhalb der EU (Polen), sodass insoweit keine Drittlandübermittlung vorliegt.
                </p>
                <p>
                  Bei jedem Aufruf unserer Website erhebt der jeweilige Hosting-Anbieter automatisiert technische
                  Verbindungsdaten (Server-Log-Files), u. a. IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene
                  Seite, verwendeter Browsertyp und Betriebssystem sowie die zuvor besuchte Seite (Referrer-URL). Diese
                  Daten dienen ausschließlich der technischen Bereitstellung und Absicherung des Angebots und werden
                  nicht mit anderen Datenquellen zusammengeführt. Rechtsgrundlage ist unser berechtigtes Interesse an
                  einem stabilen und sicheren Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO).
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                3. Cookies und Einwilligungsverwaltung
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Unsere Website verwendet Cookies und vergleichbare Technologien. Wir unterscheiden dabei zwischen
                  drei Kategorien:
                </p>
                <ul className="list-disc space-y-1 pl-6">
                  <li><strong>Notwendige Cookies:</strong> für den technischen Betrieb der Website erforderlich, können nicht deaktiviert werden.</li>
                  <li><strong>Analyse-Cookies:</strong> helfen uns, die Nutzung der Website zu verstehen (z. B. Google Analytics, Microsoft Clarity).</li>
                  <li><strong>Marketing-Cookies:</strong> ermöglichen die Anzeige interessenbezogener Werbung (z. B. Google AdSense).</li>
                </ul>
                <p>
                  Beim ersten Besuch unserer Website werden Sie über ein Consent-Banner um Ihre Einwilligung zur
                  Nutzung von Analyse- und Marketing-Cookies gebeten. Nicht notwendige Cookies werden nur auf
                  Grundlage Ihrer Einwilligung gesetzt (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Sie können Ihre
                  Einwilligung jederzeit mit Wirkung für die Zukunft über den Consent-Banner oder Ihre
                  Browsereinstellungen widerrufen.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                4. Google Analytics
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Sofern Sie eingewilligt haben, nutzen wir Google Analytics, einen Webanalysedienst der Google
                  Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland ("Google"). Google Analytics
                  verwendet Cookies, die eine Analyse der Benutzung unserer Website durch Sie ermöglichen (z. B.
                  aufgerufene Seiten, Verweildauer, Herkunft der Besucher).
                </p>
                <p>
                  Die dabei erzeugten Informationen werden in der Regel an einen Server von Google in den USA
                  übertragen und dort verarbeitet. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
                  Weitere Informationen zum Umgang mit Nutzerdaten finden Sie in der Datenschutzerklärung von Google:{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    policies.google.com/privacy
                  </a>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                5. Microsoft Clarity
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Sofern Sie eingewilligt haben, setzen wir Microsoft Clarity ein, einen Dienst der Microsoft
                  Corporation, One Microsoft Way, Redmond, WA 98052, USA. Clarity erstellt anonymisierte Heatmaps und
                  Sitzungsaufzeichnungen des Mausverhaltens und Scrollverhaltens, um die Nutzerfreundlichkeit unserer
                  Website zu verbessern. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Weitere
                  Informationen:{' '}
                  <a
                    href="https://privacy.microsoft.com/de-de/privacystatement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    privacy.microsoft.com
                  </a>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                6. Google AdSense
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Wir binden auf unserer Website Werbeanzeigen des Anbieters Google Ireland Limited, Gordon House,
                  Barrow Street, Dublin 4, Irland ("Google AdSense") ein, um die Website teilweise zu finanzieren.
                  Google AdSense verwendet Cookies und ähnliche Technologien, um Anzeigen basierend auf früheren
                  Besuchen unserer oder anderer Websites anzuzeigen.
                </p>
                <p>
                  Sofern Sie der Verwendung von Marketing-Cookies über unseren Consent-Banner zugestimmt haben, kann
                  Google personalisierte Werbung ausspielen. Ohne Ihre Einwilligung werden nur nicht personalisierte
                  Anzeigen angezeigt. Sie können der interessenbezogenen Werbung durch Google zusätzlich über die
                  Google-Anzeigeneinstellungen widersprechen:{' '}
                  <a
                    href="https://adssettings.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    adssettings.google.com
                  </a>. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Weitere Informationen:{' '}
                  <a
                    href="https://policies.google.com/technologies/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    policies.google.com/technologies/ads
                  </a>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                7. Newsletter
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Wenn Sie unseren Newsletter abonnieren, nutzen wir hierfür den Dienst Kit (vormals ConvertKit),
                  betrieben von Kit.com (Seva Inc.), USA. Bei der Anmeldung werden Ihre E-Mail-Adresse sowie ggf. Ihr
                  Name gespeichert und über ein Double-Opt-in-Verfahren bestätigt.
                </p>
                <p>
                  Die Verarbeitung erfolgt ausschließlich zum Versand des Newsletters. Rechtsgrundlage ist Ihre
                  Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie können Ihre Einwilligung jederzeit mit Wirkung für
                  die Zukunft widerrufen, indem Sie den Abmeldelink am Ende jeder Newsletter-E-Mail nutzen oder uns
                  kontaktieren.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                8. Kontaktformular
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Wenn Sie uns über das Kontaktformular Anfragen zukommen lassen, werden die von Ihnen angegebenen
                  Daten (Name, E-Mail-Adresse, Betreff, Nachricht) zur Bearbeitung Ihrer Anfrage und für den Fall von
                  Anschlussfragen bei uns verarbeitet und gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw.
                  lit. f DSGVO. Wir löschen diese Daten, sobald sie für die Bearbeitung Ihrer Anfrage nicht mehr
                  erforderlich sind, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                9. Rechte der betroffenen Person
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche
                  Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Berichtigung, Löschung,
                  Einschränkung der Verarbeitung, Datenübertragbarkeit sowie das Recht, einer Verarbeitung zu
                  widersprechen. Erteilte Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft widerrufen.
                  Bitte wenden Sie sich hierfür an die oben genannte E-Mail-Adresse.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                10. Beschwerderecht bei einer Aufsichtsbehörde
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Unbeschadet eines anderweitigen verwaltungsrechtlichen oder gerichtlichen Rechtsbehelfs steht Ihnen
                  das Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde zu, insbesondere in dem
                  EU-Mitgliedstaat Ihres Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen
                  Verstoßes, wenn Sie der Ansicht sind, dass die Verarbeitung Sie betreffender personenbezogener Daten
                  gegen die DSGVO verstößt.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                11. Datensicherheit
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Diese Website nutzt eine SSL/TLS-Verschlüsselung, um die Übertragung vertraulicher Inhalte zu
                  schützen. Zusätzlich setzen wir technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre
                  Daten gegen zufällige oder vorsätzliche Manipulationen, Verlust, Zerstörung oder unbefugten Zugriff
                  zu schützen. Ein absoluter Schutz kann jedoch nicht garantiert werden.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                12. Änderungen dieser Datenschutzerklärung
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
                  rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der
                  Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                13. Kontakt
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>Bei Fragen zum Datenschutz erreichen Sie uns unter:</p>
                <p>
                  E-Mail:{' '}
                  <a
                    href="mailto:contact@preisradio.de"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    contact@preisradio.de
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
