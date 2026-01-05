import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
    // Handle form submission by opening mailto link
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const subject = formData.get('subject') as string || 'New Message from Website';
        const body = formData.get('message') as string || '';
        const name = formData.get('name') as string || '';
        const email = formData.get('email') as string || '';

        const fullBody = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${body}`;

        // Open default mail client
        window.location.href = `mailto:aaryan.pathak3108@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;
    };

    return (
        <Layout>
            <div className="container py-12 max-w-4xl">
                <h1 className="text-4xl font-serif font-bold mb-8 text-center">Contact Us</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Get in Touch</CardTitle>
                            <CardDescription>
                                We'd love to hear from you. Fill out the form below and it will open your email client to send us a message directly.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                                    <Input id="name" name="name" placeholder="Your name" required />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <Input id="email" name="email" type="email" placeholder="your@email.com" required />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                    <Input id="subject" name="subject" placeholder="What is this regarding?" required />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                                    <Textarea id="message" name="message" placeholder="Your message..." className="min-h-[120px]" required />
                                </div>
                                <Button className="w-full" type="submit">Send Message</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardContent className="pt-6 flex items-start gap-4">
                                <Mail className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold mb-1">Email Us</h3>
                                    <p className="text-sm text-muted-foreground mb-2">For general inquiries and support:</p>
                                    <a href="mailto:aaryan.pathak3108@gmail.com" className="text-primary hover:underline">aaryan.pathak3108@gmail.com</a>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6 flex items-start gap-4">
                                <MapPin className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold mb-1">Visit Us</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Delhi, India
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Phone section removed as requested */}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Contact;
