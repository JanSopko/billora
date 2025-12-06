import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">{t('title')}</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            {t('description')}
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <div className="bg-muted/50 p-8 rounded-lg border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3">{t('features.invoices.title')}</h2>
              <p className="text-muted-foreground">{t('features.invoices.description')}</p>
            </div>
            
            <div className="bg-muted/50 p-8 rounded-lg border border-border">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3">{t('features.contracts.title')}</h2>
              <p className="text-muted-foreground">{t('features.contracts.description')}</p>
            </div>
            
            <div className="bg-muted/50 p-8 rounded-lg border border-border">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3">{t('features.catalog.title')}</h2>
              <p className="text-muted-foreground">{t('features.catalog.description')}</p>
            </div>
            
            <div className="bg-muted/50 p-8 rounded-lg border border-border">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary/30 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3">{t('features.ai.title')}</h2>
              <p className="text-muted-foreground">{t('features.ai.description')}</p>
            </div>
          </div>
          
          {/* Benefits Section */}
          <div className="mt-16 bg-gradient-to-r from-primary/5 to-secondary/5 p-8 rounded-lg border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('benefits.title')}</h2>
            <ul className="space-y-3">
              {t.raw('benefits.items').map((benefit: string, index: number) => (
                <li key={index} className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
