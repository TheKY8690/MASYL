import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { App } from './App';
import { loadKakaoSdk } from './loadKakao';

const queryClient = new QueryClient();

void loadKakaoSdk().catch(() => {
  // 카카오 키 없거나 로드 실패해도 홈 리스트는 동작
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileAITProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </TDSMobileAITProvider>
  </StrictMode>,
);
