import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NotificationBell from "./components/NotificationBell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "제주 - 제주 지역 정보 공유 SNS",
  description: "제주 지역의 다양한 정보를 공유하고 소통하는 SNS 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-primary-600">제주</h1>
                  <span className="ml-2 text-sm text-gray-500">지역 정보 공유 SNS</span>
                </div>
                <nav className="flex items-center space-x-4">
                  <a href="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    홈
                  </a>
                  <a href="/search" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    검색
                  </a>
                  <a href="/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    프로필
                  </a>
                  <NotificationBell />
                  <a href="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    로그인
                  </a>
                  <a href="/signup" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700">
                    회원가입
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
