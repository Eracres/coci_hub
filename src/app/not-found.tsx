import {
  NotFoundContent,
} from "@/components/errors/not-found-content";

import {
  PublicFooter,
} from "@/components/layout/public-footer";

import {
  PublicHeader,
} from "@/components/layout/public-header";


export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-page text-foreground">
      <PublicHeader />

      <div className="flex-1">
        <NotFoundContent />
      </div>

      <PublicFooter />
    </div>
  );
}