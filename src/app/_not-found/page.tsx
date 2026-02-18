export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>404 – Page Not Found</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body { margin:0; font-family:sans-serif; background:#e0f2fe; }
          .nf-center { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; }
          .nf-title { font-size:2.5rem; font-weight:bold; margin-bottom:1rem; }
          .nf-desc { margin-bottom:2rem; color:#64748b; font-size:1.25rem; }
          .nf-btn { padding:0.75rem 2rem; background:#2563eb; color:#fff; border-radius:0.5rem; text-decoration:none; font-weight:500; transition:background 0.2s; }
          .nf-btn:hover { background:#1d4ed8; }
        `}</style>
      </head>
      <body>
        <div className="nf-center">
          <h1 className="nf-title">404 – Page Not Found</h1>
          <p className="nf-desc">Sorry, the page you are looking for does not exist.</p>
          <a href="/" className="nf-btn">Go Home</a>
        </div>
      </body>
    </html>
  );
}
