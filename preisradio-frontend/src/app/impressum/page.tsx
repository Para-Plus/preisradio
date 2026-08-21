import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              Impressum
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Angaben gemäß § 5 TMG
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">
            {/* Company Info */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Angaben gemäß § 5 TMG
              </h2>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><span className="font-semibold">Name:</span> Ghassen Gharbi</p>
                <p><span className="font-semibold">Projektname:</span> PreisRadio</p>
                <p className="pt-2"><span className="font-semibold">Anschrift:</span></p>
                <p>Rue Cheikh Mohamed Ennaifer</p>
                <p>2036 La Soukra, Ariana</p>
                <p>Tunesien</p>
                <p className="pt-2">
                  <span className="font-semibold">E-Mail:</span>{' '}
                  <a
                    href="mailto:contact@preisradio.de"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    contact@preisradio.de
                  </a>
                </p>
              </div>
            </section>

            {/* Responsible for Content */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Inhaltlich verantwortlich gemäß § 18 MStV
              </h2>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>Ghassen Gharbi</p>
                <p>Rue Cheikh Mohamed Ennaifer</p>
                <p>2036 La Soukra, Ariana</p>
                <p>Tunesien</p>
              </div>
            </section>

            {/* Service Notice */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Hinweis zum Angebot
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  PreisRadio ist ein unabhängiger Preisvergleichsdienst.
                  Die auf dieser Website dargestellten Produkte und Preise stammen von Drittanbietern.
                </p>
                <p className="font-semibold">
                  ➡️ Bestellungen und Kaufverträge kommen ausschließlich zwischen Nutzer:innen und dem jeweiligen Händler zustande.
                </p>
                <p>
                  PreisRadio verkauft keine Produkte selbst und übernimmt keine Haftung für Preise, Verfügbarkeit oder Lieferbedingungen der Händler.
                </p>
              </div>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Haftungsausschluss
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Trotz sorgfältiger Prüfung übernehmen wir keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Informationen.
                </p>
                <p>
                  Preisangaben können sich kurzfristig ändern. Maßgeblich sind stets die Angaben auf der Website des jeweiligen Anbieters.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Kontakt
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>Bei Fragen zur Plattform PreisRadio:</p>
                <p>
                  📧{' '}
                  <a
                    href="mailto:contact@preisradio.de"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    contact@preisradio.de
                  </a>
                </p>
                <p className="pt-2">
                  Bei Fragen zu Bestellungen wenden Sie sich bitte direkt an den jeweiligen Händler.
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
