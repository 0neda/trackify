'use client';

import { useAuth } from '@/contexts/auth';
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider } from '@heroui/react';
import {
  ArrowRightIcon,
  BellSimpleIcon,
  CalendarCheckIcon,
  ChartLineUpIcon,
  CloudArrowUpIcon,
  KanbanIcon,
  LightningIcon,
  RocketIcon,
  ShieldCheckIcon,
  SparkleIcon
} from '@phosphor-icons/react';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  const featureHighlights = [
    {
      title: 'Organização instantânea',
      description: 'Arraste e solte tarefas com um quadro Kanban moderno e responsivo.',
      icon: KanbanIcon
    },
    {
      title: 'Alertas inteligentes',
      description: 'Receba lembretes e notificações sobre prazos críticos automaticamente.',
      icon: BellSimpleIcon
    },
    {
      title: 'Insights em tempo real',
      description: 'Visualize progresso e gargalos com relatórios intuitivos.',
      icon: ChartLineUpIcon
    }
  ];

  const workflowSteps = [
    {
      label: '1. Capture',
      title: 'Anote ideias em segundos',
      description: 'Crie tarefas a partir de qualquer dispositivo e adicione detalhes essenciais sem fricção.',
      icon: LightningIcon
    },
    {
      label: '2. Organize',
      title: 'Priorize com clareza',
      description: 'Defina prazos e responsáveis para manter tudo sob controle.',
      icon: CalendarCheckIcon
    },
    {
      label: '3. Conclua',
      title: 'Acompanhe resultados',
      description: 'Compartilhe status com seu time e celebre cada conquista concluída.',
      icon: ShieldCheckIcon
    }
  ];

  const benefitCards = [
    {
      title: 'Sincronização ilimitada',
      description: 'Trackify conecta equipes distribuídas sem limitações de dispositivos.',
      icon: CloudArrowUpIcon
    },
    {
      title: 'Segurança avançada',
      description: 'Seus dados permanecem protegidos com autenticação robusta e criptografia em repouso.',
      icon: ShieldCheckIcon
    },
    {
      title: 'Produtividade comprovada',
      description: 'Times reduzem em até 45% o tempo gasto em alinhamentos com Trackify.',
      icon: ChartLineUpIcon
    }
  ];

  return (
    <div className="min-h-screen">

      {/* Navigation */}
      <header className="border-b border-default-200/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div>
              <SparkleIcon size={32} className="text-primary" />
            </div>
            <div>
              <p className="text-xl uppercase tracking-wide text-primary">Trackify</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-default-500 lg:flex">
            <a href="#recursos" className="transition-colors hover:text-primary">Recursos</a>
            <a href="#fluxo" className="transition-colors hover:text-primary">Como funciona</a>
            <a href="#beneficios" className="transition-colors hover:text-primary">Benefícios</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button as={Link} href="/dashboard" color="primary" endContent={<ArrowRightIcon size={16} />}>Painel</Button>
            ) : (
              <>
                <Button as={Link} href="/login" variant="light">Entrar</Button>
                <Button as={Link} href="/register" color="primary" endContent={<ArrowRightIcon size={16} />}>Começar</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-default-100 to-primary/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10" aria-hidden="true" />
          <div className="relative mx-auto flex min-h-[70vh] w-full max-w-7xl flex-col items-center justify-center gap-12 px-6 py-20 text-center">
            <Chip variant="flat" color="primary" startContent={<LightningIcon size={16} />}>
              Produtividade sem fricção
            </Chip>

            <div className="max-w-4xl space-y-6">
              <h2 className="text-4xl font-semibold leading-tight text-default-900 sm:text-5xl lg:text-6xl">
                Planeje o dia, priorize o que importa e avance com clareza
              </h2>
              <p className="text-lg text-default-600 sm:text-xl">
                Trackify centraliza suas tarefas, reduz reuniões desnecessárias e oferece visibilidade em tempo real para você e seu time.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              {!isAuthenticated ? (
                <>
                  <Button as={Link} href="/register" color="primary" size="lg" endContent={<RocketIcon size={20} />}>
                    Criar conta gratuita
                  </Button>
                  <Button as={Link} href="/login" variant="bordered" size="lg">
                    Acessar minha conta
                  </Button>
                </>
              ) : (
                <Button as={Link} href="/dashboard" color="primary" size="lg" endContent={<ArrowRightIcon size={20} />}>
                  Continuar no painel
                </Button>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {featureHighlights.map(({ title, description, icon: Icon }) => (
                <Card key={title} className="border border-default-200/60 text-left">
                  <CardHeader className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-base font-semibold">{title}</h3>
                  </CardHeader>
                  <CardBody className="pt-0 text-sm text-default-600">
                    {description}
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="fluxo" className="border-y border-default-200/60 bg-gradient-to-br from-primary/5 via-default-100 to-secondary/10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20">
            <div className="mx-auto max-w-3xl text-center">
              <Chip variant="flat" color="secondary">Fluxo em 3 passos</Chip>
              <h3 className="mt-4 text-3xl font-semibold">Da captura à conclusão em poucos cliques</h3>
              <p className="mt-4 text-default-600">
                Estruturamos Trackify para guiar você do pensamento à entrega com foco e transparência em cada etapa.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {workflowSteps.map(({ label, title, description, icon: Icon }) => (
                <Card key={label} className="flex flex-col border border-default-200/60 shadow-sm">
                  <CardHeader className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{label}</p>
                      <h4 className="text-lg font-semibold text-default-900">{title}</h4>
                    </div>
                  </CardHeader>
                  <CardBody className="text-sm text-default-600">
                    {description}
                  </CardBody>
                  <CardFooter className="pt-0 text-xs uppercase tracking-wide text-default-500">
                    Fluxo contínuo
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="beneficios" className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-6">
              <Chip variant="flat" color="primary">Por que Trackify?</Chip>
              <h3 className="text-3xl font-semibold text-default-900">Tudo o que você precisa para manter o time sincronizado</h3>
              <p className="text-default-600">
                Acompanhe metas, delegue com confiança e visualize progresso em um painel unificado. Trackify combina simplicidade com recursos avançados para quem não quer perder tempo.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-default-500">
                <span>• Quadro Kanban colaborativo</span>
                <span>• Campos personalizados</span>
                <span>• Automação de lembretes</span>
                <span>• Relatórios exportáveis</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {benefitCards.map(({ title, description, icon: Icon }) => (
                <Card key={title} className="border border-default-200/60 shadow-sm">
                  <CardHeader className="flex items-center gap-3">
                    <div className="rounded-lg bg-default-100 p-2">
                      <Icon size={18} />
                    </div>
                    <h4 className="font-semibold">{title}</h4>
                  </CardHeader>
                  <CardBody className="pt-0 text-sm text-default-600">
                    {description}
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="border-t border-default-200/60 bg-gradient-to-br from-primary/5 via-default-100 to-secondary/5">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16 text-center">
            <Chip variant="flat" color="secondary">Pronto para acelerar?</Chip>
            <h3 className="text-3xl font-semibold text-default-900">
              Crie sua conta hoje e veja como Trackify otimiza o seu dia em minutos
            </h3>
            <p className="mx-auto max-w-2xl text-default-600">
              Sem cartões de crédito, cancelamento a qualquer momento e suporte dedicado para ajudar seu time a começar com o pé direito.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button as={Link} href={isAuthenticated ? '/dashboard' : '/register'} color="primary" size="lg" endContent={<SparkleIcon size={20} />}>
                {isAuthenticated ? 'Ir para o painel' : 'Criar conta gratuita'}
              </Button>
              {!isAuthenticated && (
                <Button as={Link} href="/login" variant="bordered" size="lg">
                  Já tenho uma conta
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-default-200/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <SparkleIcon size={18} />
            </div>
            <div>
              <p className="text-sm text-default-500">© {new Date().getFullYear()} Trackify</p>
              <p className="text-sm text-default-600">Organize, priorize e entregue com eficiência.</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 text-sm text-default-600 sm:flex-row sm:items-center sm:gap-6">
            <Link href="/login" className="transition-colors hover:text-primary">Acessar conta</Link>
            <Link href="/register" className="transition-colors hover:text-primary">Criar conta</Link>
            <Divider className="hidden h-6 sm:block" orientation="vertical" />
            <a href="#" className="transition-colors hover:text-primary">Privacidade</a>
            <a href="#" className="transition-colors hover:text-primary">Termos</a>
            <a href="#" className="transition-colors hover:text-primary">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
