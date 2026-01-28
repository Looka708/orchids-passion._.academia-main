import Link from "next/link";
import Logo from "./logo";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row md:px-6">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Link href="/" className="flex items-center gap-2" prefetch={false}>
            <Logo />
            <span className="text-lg font-semibold">Passion Academia</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Fuel your ambition. Your journey to excellence starts here.
          </p>
        </div>
      </div>
      <div className="border-t bg-muted">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground md:px-6">
          © {new Date().getFullYear()} Passion Academia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
