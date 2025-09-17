'use client';

import { useAuth } from '@/contexts/auth';
import { Button, Card, CardBody, CardHeader, Divider, Input, Link } from '@heroui/react';
import { ArrowRightIcon, EyeIcon, EyeSlashIcon, LockIcon, SignInIcon, UserIcon } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
   const [showPassword, setShowPassword] = useState(false);
   const [formData, setFormData] = useState({
      username: '',
      password: '',
   });
   const [isSubmitting, setIsSubmitting] = useState(false);

   const { login, error, clearError } = useAuth();
   const router = useRouter();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      clearError();

      try {
         await login(formData.username, formData.password);
         router.push('/dashboard');
      } catch (error) {
         // Error is handled by the auth context
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center p-4">
         <Card className="w-full max-w-md">
            <CardHeader className="flex flex-col gap-3 text-center pb-6">
               <div className="flex items-center justify-center mb-2">
                  <div className="p-3 rounded-full bg-default-100">
                     <SignInIcon size={20} />
                  </div>
               </div>
               <h1 className="text-2xl font-semibold">
                  Bem-vindo de volta
               </h1>
               <p className="text-default-500 text-sm">
                  Entre para continuar acompanhando suas tarefas
               </p>
            </CardHeader>

            <CardBody className="gap-6">
               <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Input
                     type="text"
                     label="Usuário"
                     placeholder="Digite seu usuário"
                     value={formData.username}
                     onValueChange={(val) => setFormData(prev => ({ ...prev, username: val }))}
                     autoComplete="username"
                     startContent={<UserIcon size={20} />}
                     variant="bordered"
                     required
                  />

                  <Input
                     type={showPassword ? "text" : "password"}
                     label="Senha"
                     placeholder="Digite sua senha"
                     value={formData.password}
                     onValueChange={(val) => setFormData(prev => ({ ...prev, password: val }))}
                     autoComplete="current-password"
                     startContent={<LockIcon size={20} />}
                     endContent={
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="focus:outline-none"
                        >
                           {showPassword ? (
                              <EyeSlashIcon size={20} />
                           ) : (
                              <EyeIcon size={20} />
                           )}
                        </button>
                     }
                     variant="bordered"
                     required
                  />

                  {error && (
                     <div className="p-3 rounded-lg bg-danger-50 border border-danger-200">
                        <p className="text-danger-600 text-sm">{error}</p>
                     </div>
                  )}

                  <Button
                     type="submit"
                     className="w-full h-12 mt-2"
                     isLoading={isSubmitting}
                     endContent={!isSubmitting && <ArrowRightIcon size={20} />}
                     size="lg"
                     color="primary"
                  >
                     {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </Button>
               </form>

               <Divider />

               <div className="text-center">
                  <span className="text-sm">Não tem uma conta? </span>
                  <Link href="/register" className="font-semibold text-sm">
                     Criar conta
                  </Link>
               </div>

               <div className="text-center">
                  <Link href="/" className="text-xs">
                     ← Voltar para o início
                  </Link>
               </div>
            </CardBody>
         </Card>
      </div>
   );
}
