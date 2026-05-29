import React from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { Card, CardContent } from "@/components/ui/card";

export default function Privacy() {
  return (
    <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2 pb-6 border-b">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: May 2024</p>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 prose prose-slate max-w-none text-muted-foreground prose-headings:text-foreground">
          <p>
            At Manish Ki Pathshala, accessible from our mobile application and website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Manish Ki Pathshala and how we use it.
          </p>

          <h3>1. Information We Collect</h3>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
          </p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, phone number when you register.</li>
            <li><strong>Usage Data:</strong> Quiz scores, study history, and app interaction data to personalize your experience.</li>
            <li><strong>Device Information:</strong> Device type, OS version, and crash logs for app improvement.</li>
          </ul>

          <h3>2. How We Use Your Information</h3>
          <p>We use the information we collect in various ways, including to:</p>
          <ul>
            <li>Provide, operate, and maintain our platform</li>
            <li>Improve, personalize, and expand our platform</li>
            <li>Understand and analyze how you use our platform</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Communicate with you, either directly or through one of our partners</li>
          </ul>

          <h3>3. Log Files</h3>
          <p>
            Manish Ki Pathshala follows a standard procedure of using log files. These files log visitors when they visit websites or use apps. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.
          </p>

          <h3>4. Data Security</h3>
          <p>
            We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
          </p>

          <h3>5. Contact Us</h3>
          <p>
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at privacy@manishkipathshala.com.
          </p>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
