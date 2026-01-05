import { Layout } from "@/components/layout/Layout";

const About = () => {
    return (
        <Layout>
            <div className="container py-12 max-w-4xl">
                <h1 className="text-4xl font-serif font-bold mb-8">About NoNameNews</h1>

                <div className="prose dark:prose-invert max-w-none space-y-6">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Welcome to NoNameNews, your trusted source for breaking news, in-depth analysis, and comprehensive coverage of world events. We are dedicated to delivering accurate, timely, and unbiased reporting to our readers.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
                    <p>
                        In an era of information overload, our mission is to cut through the noise and provide clarity. We believe in the power of journalism to inform, educate, and empower. Our team works around the clock to bring you stories that matter, from global politics and business trends to technology breakthroughs and cultural shifts.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Integrity:</strong> We adhere to the highest standards of journalistic ethics.</li>
                        <li><strong>Accuracy:</strong> We verify our sources and facts before publishing.</li>
                        <li><strong>Independence:</strong> Our editorial voice is free from external influence.</li>
                        <li><strong>Innovation:</strong> We embrace technology to tell better stories.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">Powered by AI</h2>
                    <p>
                        NoNameNews leverages cutting-edge Artificial Intelligence to help curate and summarize stories, ensuring you get the most relevant information quickly. However, our human editors oversee the process to maintain the human touch and ethical standards you expect.
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default About;
