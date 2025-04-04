import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
