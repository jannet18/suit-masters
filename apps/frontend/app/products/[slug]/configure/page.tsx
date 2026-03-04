import { BespokeConfigurator } from "./Configurator";

export default async function ConfigurePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main>
      <BespokeConfigurator slug={slug} isOpen={true} onClose={() => {}} />
    </main>
  );
}
