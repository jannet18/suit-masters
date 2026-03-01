import { Configurator } from "./Configurator";

export default function ConfigurePage({ params }: { params: { id: string } }) {
  return (
    <main>
      <Configurator productId={params.id} />
    </main>
  );
}
