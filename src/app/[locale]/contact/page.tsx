import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('nav');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">{t('contact')}</h1>
        <div className="bg-muted/50 p-8 rounded-lg border border-border">
          <p className="text-lg text-muted-foreground mb-6">
            This is a demonstration contact page showing the multilingual capabilities of the Billora application.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-background border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-muted-foreground">contact@billora.example</p>
            </div>
            <div className="p-4 bg-background border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Phone</h3>
              <p className="text-muted-foreground">+1 (555) 123-4567</p>
            </div>
            <div className="p-4 bg-background border border-border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Address</h3>
              <p className="text-muted-foreground">
                123 Demo Street<br />
                Example City, EX 12345<br />
                Demo Country
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
