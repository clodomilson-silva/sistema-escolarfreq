import React from 'react';
import { EstatisticasFrequencia } from '../types';

interface EstatisticasAlunoProps {
  estatisticas: EstatisticasFrequencia;
  compacto?: boolean;
}

const EstatisticasAluno: React.FC<EstatisticasAlunoProps> = ({ estatisticas, compacto = false }) => {
  const { presencas, faltas, total_dias, percentual_presenca } = estatisticas;
  const percentual_faltas = 100 - percentual_presenca;
  
  // Determinar status baseado no percentual de presença
  const getStatusFrequencia = () => {
    if (percentual_presenca >= 90) return { label: 'Excelente', cor: 'success', emoji: '🌟' };
    if (percentual_presenca >= 75) return { label: 'Bom', cor: 'primary', emoji: '👍' };
    if (percentual_presenca >= 60) return { label: 'Regular', cor: 'warning', emoji: '⚠️' };
    return { label: 'Crítico', cor: 'danger', emoji: '🚨' };
  };

  const status = getStatusFrequencia();

  if (compacto) {
    return (
      <div className="d-flex align-items-center gap-2">
        <span className={`badge bg-${status.cor}`}>
          {status.emoji} {percentual_presenca.toFixed(1)}%
        </span>
        <small className="text-muted">
          {presencas}P / {faltas}F
        </small>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Estatísticas Gerais</h6>
          <span className={`badge bg-${status.cor}`}>
            {status.emoji} {status.label}
          </span>
        </div>
        
        {/* Barra de Progresso */}
        <div className="mb-2">
          <div className="progress" style={{ height: '24px' }}>
            <div 
              className="progress-bar bg-success" 
              role="progressbar" 
              style={{ width: `${percentual_presenca}%` }}
              aria-valuenow={percentual_presenca} 
              aria-valuemin={0} 
              aria-valuemax={100}
            >
              <small className="fw-bold">{percentual_presenca.toFixed(1)}%</small>
            </div>
            <div 
              className="progress-bar bg-warning" 
              role="progressbar" 
              style={{ width: `${percentual_faltas}%` }}
              aria-valuenow={percentual_faltas} 
              aria-valuemin={0} 
              aria-valuemax={100}
            >
              {percentual_faltas > 10 && (
                <small className="fw-bold">{percentual_faltas.toFixed(1)}%</small>
              )}
            </div>
          </div>
        </div>

        {/* Detalhes */}
        <div className="row g-2 text-center small">
          <div className="col-4">
            <div className="bg-light rounded p-2">
              <div className="fw-bold text-success">{presencas}</div>
              <div className="text-muted">Presenças</div>
            </div>
          </div>
          <div className="col-4">
            <div className="bg-light rounded p-2">
              <div className="fw-bold text-warning">{faltas}</div>
              <div className="text-muted">Faltas</div>
            </div>
          </div>
          <div className="col-4">
            <div className="bg-light rounded p-2">
              <div className="fw-bold text-primary">{total_dias}</div>
              <div className="text-muted">Total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstatisticasAluno;
