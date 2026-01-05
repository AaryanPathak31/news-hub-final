import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";

const CookiePolicy = () => {
    return (
        <>
            <SEOHead
                seo={{
                    title: "Cookie Policy | NoNameNews",
                    description: "Learn about how NoNameNews uses cookies to improve your experience.",
                    canonical: "https://nonamenews.site/cookies",
                    openGraph: {
                        title: "Cookie Policy | NoNameNews",
                        description: "Learn about how NoNameNews uses cookies to improve your experience.",
                        url: "https://nonamenews.site/cookies",
                        type: "website",
                        siteName: "NoNameNews",
                        locale: "en_US",
                        image: "https://nonamenews.site/og-image.png",
                    },
                    twitter: {
                        card: "summary_large_image",
                        title: "Cookie Policy | NoNameNews",
                        description: "Learn about how NoNameNews uses cookies to improve your experience.",
                        image: "https://nonamenews.site/og-image.png",
                    },
                }}
            />
            <Layout>
                <div className="container py-12 max-w-4xl">
                    <h1 className="text-4xl font-serif font-bold mb-8">Cookie Policy</h1>

                    <Card className="mb-8">
                        <CardContent className="pt-6 prose dark:prose-invert max-w-none">
                            <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                            <h2 className="text-2xl font-semibold mt-8 mb-4">1. What Are Cookies</h2>
                            <p>
                                Cookies are small text files that are placed on your computer or mobile device when you visit a website.
                                They are widely used to make websites work more efficiently and to provide information to the owners of the site.
                            </p>

                            <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Cookies</h2>
                            <p>We use cookies for the following purposes:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>Essential Cookies:</strong> These are necessary for the website to function properly.</li>
                                <li><strong>Analytics Cookies:</strong> We use these to understand how visitors interact with our website (e.g., page views, time spent).</li>
                                <li><strong>Preference Cookies:</strong> These allow the website to remember choices you make (such as your language or region).</li>
                            </ul>

                            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Third-Party Cookies</h2>
                            <p>
                                In some cases, we may use trusted third-party services that track this information on our behalf.
                                For example, we use Google Analytics to help us understand how you use the site and ways that we can improve your experience.
                            </p>

                            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Managing Cookies</h2>
                            <p>
                                Most web browsers allow you to control cookies through their settings preferences.
                                However, if you limit the ability of websites to set cookies, you may worsen your overall user experience.
                            </p>

                            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
                            <p>
                                If you have any questions about our Cookie Policy, please contact us:
                            </p>
                            <ul className="list-disc pl-6 mb-4">
                                <li>By email: aaryan.pathak3108@gmail.com</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        </>
    );
};

export default CookiePolicy;
