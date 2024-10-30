/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**', // Allows all hostnames
			},
		],
	},
	reactStrictMode: process.env.NODE_ENV === "production"
};

export default nextConfig;
