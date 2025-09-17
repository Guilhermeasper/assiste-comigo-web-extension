import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './app.scss';
import { MainPopup } from './components/MainPopup';

async function bootstrap() {
  const rootElement = document.getElementById('root') as HTMLElement;
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <MainPopup />
    </StrictMode>,
  );
}

bootstrap();
