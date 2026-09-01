import {
  StorageTestForm,
} from "@/components/admin/storage/storage-test-form";

export default function StorageTestPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">
        Supabase Storage Test
      </h1>

      <p className="mt-2 text-sm">
        Prueba temporal de subida de
        imágenes a CociHub.
      </p>

      <div className="mt-8">
        <StorageTestForm />
      </div>
    </main>
  );
}