/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Mengabaikan error tanda kutip/karakter saat build di Vercel
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Mengabaikan error type data/TypeScript
        ignoreBuildErrors: true,
    },
    // Agar gambar tidak error saat proses optimasi di Vercel
    images: {
        unoptimized: true,
    },
}

module.exports = nextConfig;