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
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Datenschutzerklärung – PreisRadio
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Wir respektieren Ihre Privatsphäre und behandeln personenbezogene Daten gemäß der Datenschutz-Grundverordnung (DSGVO). Die Nutzung unserer Website ist grundsätzlich ohne Angabe personenbezogener Daten möglich.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                1. Verantwortlicher
              </h2>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>PreisRadio</p>
                <p>Musterstraße 123, 12247 Berlin, Germany</p>
                <p>
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
                2. Erhebung und Nutzung personenbezogener Daten
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Personenbezogene Daten werden nur erhoben, wenn Sie uns diese freiwillig mitteilen, z. B. bei der Kontaktaufnahme, Registrierung oder Newsletter-Anmeldung. Die Daten werden ausschließlich zur Erfüllung des jeweiligen Zwecks verwendet.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                3. Cookies
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Unsere Website verwendet Cookies, um die Nutzung zu erleichtern und die Inhalte zu optimieren. Sie können die Speicherung von Cookies in Ihrem Browser jederzeit deaktivieren.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                4. Rechte der betroffenen Person
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit, Widerspruch und Widerruf Ihrer Einwilligung. Wenden Sie sich hierfür jederzeit an uns.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                5. Sicherheit
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten zu schützen. Ein absoluter Schutz kann jedoch nicht garantiert werden.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                6. Newsletter
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Wenn Sie unseren Newsletter abonnieren, speichern wir nur die für den Versand notwendigen Daten. Sie können das Abonnement jederzeit kündigen.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                7. Kontakt
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
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
