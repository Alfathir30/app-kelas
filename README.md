# TKJ2 Class App

Aplikasi mobile untuk manajemen kelas XI TKJ2 yang dibangun dengan React Native (Expo) dan Firebase.

## Fitur Utama

- **Autentikasi**: Login/register dengan role system (Owner, Editor, User)
- **Dashboard**: Ringkasan jadwal hari ini, tugas mendatang, dan statistik kelas
- **Piket**: Manajemen jadwal piket harian (Senin-Jumat)
- **Pelajaran**: Jadwal pelajaran lengkap dengan detail guru dan ruangan
- **Multilingual**: Bahasa Indonesia dan English
- **Offline Support**: Sinkronisasi data otomatis
- **Role-based Access**: Kontrol akses berdasarkan peran pengguna

## Teknologi

- **Frontend**: React Native + Expo
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Navigation**: React Navigation v6
- **Internationalization**: i18next
- **State Management**: React Context + Custom Hooks
- **Build**: EAS Build untuk production APK/IPA

## Setup Development

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Setup Firebase**
   - Pastikan file `google-services.json` sudah ada di root project
   - Firebase configuration sudah dikonfigurasi di `src/config/firebase.ts`

3. **Run Development**
   \`\`\`bash
   npm start
   # atau
   npx expo start
   \`\`\`

## Setup Database

1. **Seed Database**
   \`\`\`bash
   npm run seed:database
   \`\`\`

2. **Create Admin User**
   \`\`\`bash
   npm run create:admin
   \`\`\`
   - Email: admin@tkj2.com
   - Password: admin123456
   - Role: owner

## Build Production

1. **Setup EAS**
   \`\`\`bash
   npm install -g @expo/cli
   eas login
   eas build:configure
   \`\`\`

2. **Build Android APK**
   \`\`\`bash
   npm run build:android
   \`\`\`

3. **Build iOS IPA**
   \`\`\`bash
   npm run build:ios
   \`\`\`

4. **Build Both Platforms**
   \`\`\`bash
   npm run build:all
   \`\`\`

## Struktur Database

### Collections

- **users**: Profil pengguna dengan role system
- **piket_schedules**: Jadwal piket harian (Senin-Jumat)
- **lesson_schedules**: Jadwal pelajaran dengan detail lengkap
- **tasks**: Tugas-tugas kelas dengan due date
- **summary**: Data ringkasan (keuangan, akademik, kehadiran)

### Security Rules

- **Owner**: Full access (CRUD semua data)
- **Editor**: Dapat mengelola jadwal dan tugas
- **User**: Read-only access, dapat update status tugas yang ditugaskan

## Fitur Offline

- Data disinkronisasi otomatis saat online
- Perubahan disimpan lokal saat offline
- Sync otomatis saat koneksi kembali

## Deployment

Aplikasi ini menghasilkan:
- **Android**: File APK siap install
- **iOS**: File IPA untuk App Store atau TestFlight

## Support

Untuk bantuan teknis atau bug report, silakan hubungi tim development.
"# app-kelas" 
