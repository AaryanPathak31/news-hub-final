import { Layout } from "@/components/layout/Layout";

const Terms = () => {
    return (
        <Layout>
            <div className="container py-12 max-w-4xl">
                <h1 className="text-4xl font-serif font-bold mb-8">Terms and Conditions</h1>
                <p className="text-sm text-muted-foreground mb-8">Last Updated: January 2026</p>

                <div className="prose dark:prose-invert max-w-none space-y-6">
                    <p>
                        Please read these Terms and Conditions carefully before using the NoNameNews website. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">2. Intellectual Property</h2>
                    <p>
                        The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of NoNameNews and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Conduct</h2>
                    <p>
                        You agree not to use the Service:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>In any way that violates any applicable national or international law or regulation.</li>
                        <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent.</li>
                        <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">4. Content Disclaimer</h2>
                    <p>
                        The news and information provided on this website are for general informational purposes only. While we accept no responsibility for any errors or omissions, or for the results obtained from the use of this information. All information in this site is provided "as is", with no guarantee of completeness, accuracy, timeliness or of the results obtained from the use of this information.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">5. External Links</h2>
                    <p>
                        Our Service may contain links to third-party web sites or services that are not owned or controlled by NoNameNews. NoNameNews has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">6. Termination</h2>
                    <p>
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">7. Governing Law</h2>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                    </p>

                    
                </div>
            </div>
        </Layout>
    );
};

export default Terms;
