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
};

export default nextConfig;
