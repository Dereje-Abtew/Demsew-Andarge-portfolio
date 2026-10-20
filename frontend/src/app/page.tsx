import { Aperture } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="site-placeholder">
      <span className="brand-icon"><Aperture size={19} /></span>
      <p className="eyebrow">DEMSEW ANDARGE · VIDEO EDITOR</p>
      <h1>Stories in motion.</h1>
      <p>The public portfolio is being prepared. The studio workspace is available now.</p>
      <Link href="/admin/login">Administrator sign in <span aria-hidden="true">↗</span></Link>
    </main>
  );
}
