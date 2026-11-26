/** @type {import('next').NextConfig} */
export default {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  // the headless browser used for PDF/PNG downloads ships as packed files that must travel with the function
  outputFileTracingIncludes: { "/api/file": ["./node_modules/@sparticuz/chromium/**"], "/api/pack": ["./node_modules/@sparticuz/chromium/**"] },
};
