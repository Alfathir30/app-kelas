export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">TKJ2 Class App</h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">Aplikasi Mobile untuk Manajemen Kelas XI TKJ2</p>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Fitur Utama</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">📱 Dashboard</h3>
                <p className="text-gray-600">Ringkasan jadwal hari ini, tugas mendatang, dan statistik kelas</p>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">👥 Piket</h3>
                <p className="text-gray-600">Manajemen jadwal piket harian (Senin-Jumat)</p>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">📚 Pelajaran</h3>
                <p className="text-gray-600">Jadwal pelajaran lengkap dengan detail guru dan ruangan</p>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">🔐 Autentikasi</h3>
                <p className="text-gray-600">Login/register dengan role system (Owner, Editor, User)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Teknologi</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">React Native</span>
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">Expo</span>
              <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-medium">Firebase</span>
              <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium">TypeScript</span>
              <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-medium">EAS Build</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Setup & Development</h2>
            <div className="text-left space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">1. Install Dependencies</h3>
                <code className="bg-gray-800 text-green-400 px-3 py-1 rounded text-sm">npm install</code>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">2. Setup Database</h3>
                <code className="bg-gray-800 text-green-400 px-3 py-1 rounded text-sm">npm run seed:database</code>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">3. Create Admin User</h3>
                <code className="bg-gray-800 text-green-400 px-3 py-1 rounded text-sm">npm run create:admin</code>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">4. Run Development</h3>
                <code className="bg-gray-800 text-green-400 px-3 py-1 rounded text-sm">npm start</code>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="bg-blue-600 text-white rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-2">Production Build</h3>
              <p className="mb-4">Siap untuk build APK (Android) dan IPA (iOS) production-ready</p>
              <div className="flex flex-wrap justify-center gap-4">
                <code className="bg-blue-700 px-3 py-1 rounded text-sm">npm run build:android</code>
                <code className="bg-blue-700 px-3 py-1 rounded text-sm">npm run build:ios</code>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">Aplikasi ini dibuat untuk Kelas XI TKJ2 • SMK Negeri 1</p>
            <p className="text-sm text-gray-500 mt-2">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
