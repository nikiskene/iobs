// src/components/institute/InstituteFooter.tsx

export default function InstituteFooter() {
  return (
    <footer
      style={{
        marginTop: 180,
        padding: '70px 0 40px',
        borderTop: '1px solid rgba(184,138,59,.15)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 60,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h3
            style={{
              margin: 0,
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 600,
              fontSize: 34,
            }}
          >
            Institute of Beautiful Success
          </h3>

          <p
            style={{
              marginTop: 20,
              lineHeight: 1.9,
              color: '#675d52',
            }}
          >
            We believe success can be redesigned. More beautiful. More
            meaningful. More beneficial for humanity.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,minmax(120px,1fr))',
            gap: 40,
          }}
        >
          <FooterColumn
            title="Institute"
            links={[
              'About',
              'Identity Engine',
              'Library',
              'Observatory',
            ]}
          />

          <FooterColumn
            title="Experiences"
            links={[
              'Expeditions',
              'Salon',
              'Speaking',
              'Membership',
            ]}
          />

          <FooterColumn
            title="Legal"
            links={[
              'Privacy',
              'Terms',
              'Imprint',
              'Contact',
            ]}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 60,
          paddingTop: 24,
          borderTop: '1px solid rgba(184,138,59,.08)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          color: '#8c8276',
          fontSize: 14,
        }}
      >
        <span>© {new Date().getFullYear()} Institute of Beautiful Success</span>

        <span>
          Built on curiosity. Designed for civilization.
        </span>
      </div>
    </footer>
  );
}

type FooterColumnProps = {
  title: string;
  links: string[];
};

function FooterColumn({
  title,
  links,
}: FooterColumnProps) {
  return (
    <div>
      <div
        style={{
          fontWeight: 600,
          marginBottom: 18,
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {links.map((link) => (
          <a
            key={link}
            href="#"
            style={{
              color: '#6d6257',
              textDecoration: 'none',
            }}
          >
            {link}
          </a>
        ))}
      </div>
    </div>
  );
}