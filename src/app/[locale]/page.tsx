import { useTranslations } from 'next-intl';
import { Link } from '../../i18n/routing';
import { LoginForm } from '../../components/login-form';

export default function HomePage() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');

  return (
    <div className="min-h-screen flex items-center">
      <div className="container mx-auto px-4 py-16">
        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('title')}
              </h1>
              
              <p className="text-xl md:text-2xl font-semibold text-foreground italic">
                {t('slogan')}
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                {t('description')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/about"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-medium transition-colors text-center"
              >
                {tCommon('getStarted')}
              </Link>
              <Link
                href="/about"
                className="border border-border text-foreground hover:bg-muted px-8 py-3 rounded-lg font-medium transition-colors text-center"
              >
                {tCommon('learnMore')}
              </Link>
            </div>
          </div>

          {/* Right Side - Login/Register Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
