export function calculateTotalTime(
  preparation: number,
  cooking: number | null,
  additional: number | null,
) {
  return (
    preparation +
    (cooking ?? 0) +
    (additional ?? 0)
  );
}