// Logo component for Deenify
"use client";

export default function DeenifyLogo() {
  return (
    <img
      src="/logo.png"
      alt="Deenify Logo"
      className="w-auto h-12 object-contain rounded-full bg-transparent"
      style={{ maxWidth: '180px' }}
      draggable={false}
      decoding="async"
      loading="eager"
    />
  );
}
