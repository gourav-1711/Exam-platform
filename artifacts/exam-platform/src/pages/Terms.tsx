import React from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2 pb-6 border-b">
        <h1 className="text-3xl font-bold tracking-tight">Terms & Conditions</h1>
        <p className="text-muted-foreground">Last updated: May 2024</p>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 prose prose-slate max-w-none text-muted-foreground prose-headings:text-foreground">
          <p>
            Welcome to Manish Ki Pathshala!
          </p>
          <p>
            These terms and conditions outline the rules and regulations for the use of Manish Ki Pathshala's platform.
          </p>

          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing this platform we assume you accept these terms and conditions. Do not continue to use Manish Ki Pathshala if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h3>2. License</h3>
          <p>
            Unless otherwise stated, Manish Ki Pathshala and/or its licensors own the intellectual property rights for all material on the platform. All intellectual property rights are reserved. You may access this from Manish Ki Pathshala for your own personal use subjected to restrictions set in these terms and conditions.
          </p>
          <p>You must not:</p>
          <ul>
            <li>Republish material from Manish Ki Pathshala</li>
            <li>Sell, rent or sub-license material from Manish Ki Pathshala</li>
            <li>Reproduce, duplicate or copy material from Manish Ki Pathshala</li>
            <li>Redistribute content from Manish Ki Pathshala</li>
          </ul>

          <h3>3. User Accounts</h3>
          <p>
            If you create an account on the platform, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account and any other actions taken in connection with it.
          </p>

          <h3>4. Content Liability</h3>
          <p>
            We shall not be hold responsible for any content that appears on your Website/App. You agree to protect and defend us against all claims that is rising on your Website/App.
          </p>

          <h3>5. Disclaimer</h3>
          <p>
            The materials on Manish Ki Pathshala's platform are provided on an 'as is' basis. Manish Ki Pathshala makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
