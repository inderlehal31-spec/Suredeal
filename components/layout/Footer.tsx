// components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="py-20 border-t border-white/5 text-center text-gray-500 text-xs tracking-[0.2em] uppercase">
      <div className="mb-6 text-white font-semibold tracking-[0.3em]">SureDeal</div>
      <div className="flex justify-center gap-10 mb-6 text-gray-600">
        <span>Privacy</span>
        <span>Terms</span>
        <span>Compliance</span>
      </div>
      <p>© 2026 SureDeal. All rights reserved.</p>
    </footer>
  );
}
