import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Cookie, AlertCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button 
                variant="outline" 
                size="sm"
                className="hover:scale-105 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Crypto to INR
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-400" />
                Privacy Policy
              </h1>
              <p className="text-blue-200">Your privacy is important to us</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-400" />
              Privacy Policy for Crypto to INR
            </CardTitle>
            <p className="text-slate-300">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                Information We Collect
              </h2>
              <p className="mb-4">
                Crypto to INR ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you visit our website.
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-white">Automatically Collected Information:</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>IP address and location data</li>
                    <li>Browser type and version</li>
                    <li>Device information (mobile, desktop, tablet)</li>
                    <li>Pages visited and time spent on our site</li>
                    <li>Referring website information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <Cookie className="h-5 w-5 text-orange-400" />
                Cookies and Tracking Technologies
              </h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to enhance your browsing experience and serve relevant advertisements.
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-white">Types of Cookies We Use:</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                    <li><strong>Advertising Cookies:</strong> Used to deliver relevant ads through Google AdSense</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings (currency display, etc.)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Google AdSense and Third-Party Advertising</h2>
              <p className="mb-4">
                We use Google AdSense to display advertisements on our website. Google and its partners may use cookies and other technologies to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 mb-4">
                <li>Serve ads based on your previous visits to our website or other websites</li>
                <li>Measure the effectiveness of ads and understand how users interact with them</li>
                <li>Provide aggregate reports to advertisers</li>
                <li>Improve ad relevance and user experience</li>
              </ul>
              <p className="mb-4">
                You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">Google's Ads Settings</a> or by visiting <a href="http://www.aboutads.info" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">aboutads.info</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
              <p className="mb-4">We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Provide and maintain our cryptocurrency price tracking service</li>
                <li>Improve user experience and website functionality</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Display relevant advertisements through Google AdSense</li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Data Sharing and Third Parties</h2>
              <p className="mb-4">We may share your information with:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Google AdSense:</strong> For advertising purposes as described above</li>
                <li><strong>Analytics Providers:</strong> To understand website usage and improve our services</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="mt-4">
                We do not sell, trade, or rent your personal information to third parties for their marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Your Rights and Choices</h2>
              <p className="mb-4">You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Request access to your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt out of personalized advertising</li>
                <li>Disable cookies through your browser settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Children's Privacy</h2>
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. These countries may have different data protection laws. By using our service, you consent to such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page with an updated "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-400" />
                Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <strong>Email:</strong> 
                  <a href="mailto:seelamsreenath4@gmail.com" className="text-blue-400 hover:text-blue-300 underline">
                    seelamsreenath4@gmail.com
                  </a>
                </p>
                <p><strong>Website:</strong> cryptotoinr.com</p>
              </div>
            </section>

            <div className="border-t border-slate-600 pt-6 mt-8">
              <p className="text-sm text-slate-400 text-center">
                This privacy policy is compliant with Google AdSense requirements and general data protection regulations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
