// Flags that a race's registration status moved since it was saved.
export default function RegistrationChanged({ from, to }: { from: string; to: string }) {
  return (
    <p className="mr-changed">
      <b>Changed since you saved:</b> registration was {from}, now <b>{to}</b>.
    </p>
  );
}
