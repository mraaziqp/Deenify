export default function CCEMagPortalPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">CCE Mag Quality of Life Portal</h1>
      <div className="w-full h-[70vh] rounded-lg overflow-hidden border shadow">
        <iframe
          src="https://ccemagazine.web.za/ccemag/"
          title="CCE Mag Portal"
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
      <div className="mt-4 text-center">
        <a
          href="https://ccemagazine.web.za/ccemag/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline hover:text-blue-900"
        >
          Open CCE Mag Portal in new tab
        </a>
      </div>
    </div>
  );
}
