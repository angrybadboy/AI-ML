import { FadeInOnRouteChange } from "@/components/motion/FadeInOnRouteChange";

/**
 * (auth) 라우트는 자체 .skin 컨테이너를 페이지에서 직접 렌더한다
 * (login은 fog, signup은 grain 등 화면별로 다름).
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FadeInOnRouteChange>{children}</FadeInOnRouteChange>;
}
