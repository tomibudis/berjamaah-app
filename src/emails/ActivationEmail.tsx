import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Img,
  Text,
  Heading,
  Button,
  Hr,
} from '@react-email/components';

type ActivationEmailProps = {
  appName?: string;
  logoUrl?: string;
  activationUrl: string;
  userName?: string;
  supportEmail?: string;
};

export function ActivationEmail({
  appName = 'Berjamaah',
  logoUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/favicon.ico`,
  activationUrl,
  userName,
  supportEmail = 'support@berjamaah.id',
}: ActivationEmailProps) {
  const preview = `Selamat datang di ${appName}. Aktifkan akun Anda untuk mulai menggunakan aplikasi.`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src={logoUrl}
              width='48'
              height='48'
              alt={`${appName} logo`}
              style={styles.logo}
            />
            <Heading as='h2' style={styles.appTitle}>
              {appName}
            </Heading>
          </Section>

          {/* Message */}
          <Section style={styles.card}>
            <Heading as='h3' style={styles.title}>
              Selamat Datang{userName ? `, ${userName}` : ''}!
            </Heading>
            <Text style={styles.text}>
              Terima kasih telah mendaftar di {appName}. Klik tombol di bawah
              ini untuk mengaktifkan akun Anda.
            </Text>
            <Section style={{ textAlign: 'center', marginTop: 16 }}>
              <Button href={activationUrl} style={styles.button}>
                Aktifkan Akun
              </Button>
            </Section>
            <Text style={styles.helper}>
              Atau salin dan tempel tautan ini di peramban Anda:
            </Text>
            <Text style={styles.link}>{activationUrl}</Text>
            <Hr style={styles.hr} />
            <Text style={styles.finePrint}>
              Tautan aktivasi berlaku selama 48 jam. Jika Anda tidak meminta
              email ini, abaikan saja.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Butuh bantuan? Hubungi kami di{' '}
              <a href={`mailto:${supportEmail}`} style={styles.footerLink}>
                {supportEmail}
              </a>
            </Text>
            <Text style={styles.copyright}>
              © {new Date().getFullYear()} {appName}. Semua hak cipta
              dilindungi.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    backgroundColor: '#f6f8fb',
    fontFamily:
      'ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji"',
    color: '#0f172a',
  },
  container: {
    maxWidth: 560,
    margin: '0 auto',
    padding: '24px 16px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  logo: {
    borderRadius: 8,
    margin: '0 auto',
  },
  appTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    boxShadow:
      '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.1)',
  },
  title: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: 700,
  },
  text: {
    margin: 0,
    marginBottom: 16,
    lineHeight: 1.6,
    fontSize: 14,
    color: '#334155',
  },
  button: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    display: 'inline-block',
    padding: '12px 18px',
    borderRadius: 8,
    fontWeight: 700,
    textDecoration: 'none',
  },
  helper: {
    margin: '16px 0 4px 0',
    fontSize: 12,
    color: '#64748b',
  },
  link: {
    wordBreak: 'break-all',
    fontSize: 12,
    color: '#0f172a',
  },
  hr: {
    borderColor: '#e2e8f0',
    margin: '16px 0',
  },
  finePrint: {
    fontSize: 12,
    color: '#64748b',
  },
  footer: {
    textAlign: 'center',
    marginTop: 16,
  },
  footerText: {
    margin: 0,
    fontSize: 12,
    color: '#64748b',
  },
  footerLink: {
    color: '#0ea5e9',
    textDecoration: 'underline',
  },
  copyright: {
    marginTop: 8,
    fontSize: 12,
    color: '#94a3b8',
  },
};

export default ActivationEmail;
