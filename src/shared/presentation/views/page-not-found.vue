<template>
  <div class="not-found-container">
    <div class="content-wrapper">
      <div class="error-icon">
        <div class="icon-circle">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
      </div>

      <div class="error-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">Página No Encontrada</h2>
        <p class="error-description">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        <div class="action-buttons">
          <button @click="goHome" class="btn-primary">
            <i class="pi pi-home"></i>
            <span>Volver al Inicio</span>
          </button>
          <button @click="goBack" class="btn-secondary">
            <i class="pi pi-arrow-left"></i>
            <span>Regresar</span>
          </button>
        </div>
      </div>

      <div class="suggestions">
        <h3 class="suggestions-title">¿Qué puedes hacer?</h3>
        <ul class="suggestions-list">
          <li>
            <i class="pi pi-check-circle"></i>
            <span>Verifica la URL que ingresaste</span>
          </li>
          <li>
            <i class="pi pi-check-circle"></i>
            <span>Regresa a la página anterior</span>
          </li>
          <li>
            <i class="pi pi-check-circle"></i>
            <span>Visita nuestra página principal</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: rotate 20s linear infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  animation-duration: 15s;
  animation-direction: reverse;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 10%;
  animation-duration: 25s;
}

.content-wrapper {
  max-width: 600px;
  width: 100%;
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
  position: relative;
  z-index: 1;
}

.error-icon {
  margin-bottom: 2rem;
  animation: float 3s ease-in-out infinite;
}

.icon-circle {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.icon-circle i {
  font-size: 5rem;
  color: white;
}

.error-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  margin-bottom: 2rem;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 1rem 0;
}

.error-description {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0 0 2rem;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 1rem 2rem;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #f0f9ff;
  transform: translateY(-3px);
}

.suggestions {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.suggestions-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem;
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.suggestions-list li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  color: #1e293b;
  font-weight: 500;
  transition: all 0.3s ease;
}

.suggestions-list li:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.suggestions-list li:last-child {
  margin-bottom: 0;
}

.suggestions-list i {
  color: #667eea;
  font-size: 1.25rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .not-found-container {
    padding: 1rem;
  }

  .icon-circle {
    width: 120px;
    height: 120px;
  }

  .icon-circle i {
    font-size: 4rem;
  }

  .error-code {
    font-size: 6rem;
  }

  .error-title {
    font-size: 2rem;
  }

  .error-description {
    font-size: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .suggestions {
    padding: 1.5rem;
  }

  .suggestions-title {
    font-size: 1.25rem;
  }
}
</style>