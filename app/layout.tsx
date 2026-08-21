import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'RG STATS | 音ゲー詳細統計ポータル',
  description: '全20+機種対応 音ゲー詳細プレイ記録・総合統計ダッシュボード',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className="bg-[#09090b] text-zinc-100 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
          <p>© 2026 RG STATS - Sound Game Archives & Personal Analytics</p>
        </footer>
      </body>
    </html>
  );
}
