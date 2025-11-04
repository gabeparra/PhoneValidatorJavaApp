import './globals.css';

export const metadata = {
  title: 'Phone Number Validator',
  description: 'Validate and format phone numbers from Facebook leads',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {/* Main content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer with TabLockup logo */}
        <footer className="bg-black border-t-4 border-yellow-400 py-8 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <div className="bg-white rounded-lg p-6">
              <img
                src="/TabLockup_horizontal_KGrgb_72ppi.png"
                alt="TabLockup Logo"
                className="h-12"
              />
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}