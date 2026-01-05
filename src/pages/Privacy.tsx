import { Layout } from "@/components/layout/Layout";

const Privacy = () => {
    return (
        <Layout>
            <div className="container py-12 max-w-4xl">
                <h1 className="text-4xl font-serif font-bold mb-8">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground mb-8">Last Updated: January 2026</p>

                <div className="prose dark:prose-invert max-w-none space-y-6">
                    <p>
                        At NoNameNews, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
                    <p>
                        We may collect personal information that you voluntarily provide to us when you subscribe to our newsletter, create an account, or contact us. This may include your name, email address, and any other details you choose to share.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">2. Automatic Data Collection</h2>
                    <p>
                        When you visit our site, we may automatically collect certain information about your device, including your IP address, browser type, operating system, and browsing behavior. This helps us improve our website and user experience.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">3. Cookies</h2>
                    <p>
                        We use cookies to enhance your experience. Cookies are small data files stored on your device that help us remember your preferences and analyze site traffic. You can control cookie settings through your browser.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">4. How We Use Your Information</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>To provide and maintain our service.</li>
                        <li>To notify you about changes to our service.</li>
                        <li>To provide customer support.</li>
                        <li>To gather analysis or valuable information so that we can improve our service.</li>
                        <li>To monitor the usage of our service.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">5. Third-Party Links</h2>
                    <p>
                        Our website may contain links to other sites that are not operated by us. We advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">6. Changes to This Privacy Policy</h2>
                    <p>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:privacy@nonamenews.com" className="text-primary hover:underline">privacy@nonamenews.com</a>
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Privacy;
