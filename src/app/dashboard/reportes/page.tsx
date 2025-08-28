'use client';

import { useState, useEffect } from 'react';
// import { calculatePNPortions } from '@/lib/metabolismCalculator';

interface DailyReport {
  date: string;
  weight?: number;
  portions: {
    P: number;
    C: number;
    G: number;
    V: number;
  };
  originalPortions?: {
    P: { P1: number; P2: number; P3: number; };
    C: { C1: number; C2: number; C3: number; };
    G: { G1: number; G2: number; G3: number; };
    V: number;
  };
  goals: {
    P: number;
    C: number;
    G: number;
    V: number;
  };
  compliance: {
    P: number;
    C: number;
    G: number;
    V: number;
  };
  quality?: {
    comerMas: number;
    comerOcasionalmente: number;
    comerMenos: number;
    detailed: {
      P1: number; P2: number; P3: number;
      C1: number; C2: number; C3: number;
      G1: number; G2: number; G3: number;
    };
  };
}

interface UserProfile {
  name: string;
  gender: string;
  goal: string;
  activity: string;
  preference: string;
}

export default function HistorialPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dateRange, setDateRange] = useState(7); // días
  const [coachEmail, setCoachEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Estados para edición de días
  const [isEditingDay, setIsEditingDay] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [editingPortions, setEditingPortions] = useState({ P: 0, C: 0, G: 0, V: 0 });
  const [editingWeight, setEditingWeight] = useState('');

  useEffect(() => {
    loadReportsData();
    loadUserProfile();
  }, [dateRange]);

  const loadUserProfile = async () => {
    const activeUserCode = localStorage.getItem('active-user-code');
    if (!activeUserCode) {
      alert('Error: No se encontró código de usuario. Redirigiendo al login...');
      window.location.href = '/login';
      return;
    }

    try {
      // Cargar perfil desde API Redis
      const response = await fetch(`/api/user-profile?userCode=${activeUserCode}`);
      const data = await response.json();
      
      if (data.profile) {
        setUserProfile(data.profile);
      } else {
        console.log('No se encontró perfil para el usuario:', activeUserCode);
        // Fallback a localStorage si no hay datos en Redis
        const savedProfile = localStorage.getItem(`user-profile-${activeUserCode}`);
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        }
      }
    } catch (error) {
      console.error('Error cargando perfil de usuario:', error);
      // Fallback a localStorage en caso de error
      const savedProfile = localStorage.getItem(`user-profile-${activeUserCode}`);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    }
  };

  const loadReportsData = async () => {
    const activeUserCode = localStorage.getItem('active-user-code');
    if (!activeUserCode) {
      setReports([]);
      return;
    }

    try {
      const reportsData: DailyReport[] = [];
      const today = new Date();
      
      for (let i = 0; i < dateRange; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toDateString();
        
        try {
          // Cargar datos desde API Redis
          const portionsResponse = await fetch(`/api/portions?userCode=${activeUserCode}&date=${encodeURIComponent(dateString)}`);
          const portionsResult = await portionsResponse.json();
          
          if (portionsResult.portions) {
            const portions = portionsResult.portions;
            const weight = portionsResult.weight;
            const goals = portionsResult.goals || { P: 5, C: 5, G: 5, V: 5 };
            
            // Calcular totales consumidos
            const totalP = Object.values(portions.P).reduce((sum: number, val: unknown) => sum + (val as number), 0);
            const totalC = Object.values(portions.C).reduce((sum: number, val: unknown) => sum + (val as number), 0);
            const totalG = Object.values(portions.G).reduce((sum: number, val: unknown) => sum + (val as number), 0);
            const totalV = portions.V || 0;
            
            // Calcular compliance (% del objetivo alcanzado)
            const compliance = {
              P: Math.round((totalP / goals.P) * 100),
              C: Math.round((totalC / goals.C) * 100),
              G: Math.round((totalG / goals.G) * 100),
              V: Math.round((totalV / goals.V) * 100)
            };

            // Calcular calidad nutricional
            const detailed = {
              P1: portions.P.P1 || 0, P2: portions.P.P2 || 0, P3: portions.P.P3 || 0,
              C1: portions.C.C1 || 0, C2: portions.C.C2 || 0, C3: portions.C.C3 || 0,
              G1: portions.G.G1 || 0, G2: portions.G.G2 || 0, G3: portions.G.G3 || 0
            };

            const totalQualityPortions = totalP + totalC + totalG;
            const quality = totalQualityPortions > 0 ? {
              comerMas: Math.round(((detailed.P1 + detailed.C1 + detailed.G1) / totalQualityPortions) * 100),
              comerOcasionalmente: Math.round(((detailed.P2 + detailed.C2 + detailed.G2) / totalQualityPortions) * 100),
              comerMenos: Math.round(((detailed.P3 + detailed.C3 + detailed.G3) / totalQualityPortions) * 100),
              detailed
            } : {
              comerMas: 0, comerOcasionalmente: 0, comerMenos: 0, detailed
            };
            
            reportsData.push({
              date: dateString,
              weight,
              portions: { P: totalP, C: totalC, G: totalG, V: totalV },
              originalPortions: portions, // Preservar datos originales detallados
              goals,
              compliance,
              quality
            });
          }
        } catch (error) {
          console.log(`No hay datos para ${dateString}:`, error);
        }
      }
      
      setReports(reportsData);
      
    } catch (error) {
      console.error('Error cargando reportes:', error);
      setReports([]);
    }
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const generateReportText = () => {
    if (!userProfile) return '';
    
    const avgCompliance = reports.length > 0 ? {
      P: Math.round(reports.reduce((sum, r) => sum + r.compliance.P, 0) / reports.length),
      C: Math.round(reports.reduce((sum, r) => sum + r.compliance.C, 0) / reports.length),
      G: Math.round(reports.reduce((sum, r) => sum + r.compliance.G, 0) / reports.length),
      V: Math.round(reports.reduce((sum, r) => sum + r.compliance.V, 0) / reports.length)
    } : { P: 0, C: 0, G: 0, V: 0 };
    
    const weightsWithData = reports.filter(r => r.weight);
    const weightChange = weightsWithData.length >= 2 ? 
      weightsWithData[0].weight! - weightsWithData[weightsWithData.length - 1].weight! : 0;

    // Calcular calidad nutricional promedio
    const qualityReports = reports.filter(r => r.quality && (r.quality.comerMas + r.quality.comerOcasionalmente + r.quality.comerMenos) > 0);
    const avgQuality = qualityReports.length > 0 ? {
      comerMas: Math.round(qualityReports.reduce((sum, r) => sum + r.quality!.comerMas, 0) / qualityReports.length),
      comerOcasionalmente: Math.round(qualityReports.reduce((sum, r) => sum + r.quality!.comerOcasionalmente, 0) / qualityReports.length),
      comerMenos: Math.round(qualityReports.reduce((sum, r) => sum + r.quality!.comerMenos, 0) / qualityReports.length)
    } : { comerMas: 0, comerOcasionalmente: 0, comerMenos: 0 };
    
    return `
REPORTE NUTRICIONAL - ${dateRange} DÍAS
=====================================

CLIENTE: ${userProfile.name}
PERFIL: ${userProfile.gender === 'MALE' ? 'Hombre' : 'Mujer'} - ${userProfile.goal === 'WEIGHT_LOSS' ? 'Pérdida de peso' : userProfile.goal === 'MAINTENANCE' ? 'Mantenimiento' : 'Ganancia muscular'}
ACTIVIDAD: ${userProfile.activity}
PREFERENCIA: ${userProfile.preference}

CUMPLIMIENTO PROMEDIO:
- Proteína: ${avgCompliance.P}%
- Carbohidratos: ${avgCompliance.C}%
- Grasas: ${avgCompliance.G}%
- Verduras: ${avgCompliance.V}%

CALIDAD NUTRICIONAL PROMEDIO:
- Comer Más (P1/C1/G1): ${avgQuality.comerMas}%
- Comer Ocasionalmente (P2/C2/G2): ${avgQuality.comerOcasionalmente}%
- Comer Menos (P3/C3/G3): ${avgQuality.comerMenos}%

${avgQuality.comerMas >= 70 ? 
'EXCELENTE calidad nutricional promedio' : 
avgQuality.comerMas >= 50 ? 
'BUENA calidad, con oportunidad de mejora' : 
'ENFOQUE en mejorar la calidad de los alimentos'}

CAMBIO DE PESO: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg

DETALLE DIARIO:
${reports.map(r => `
${new Date(r.date).toLocaleDateString('es-ES')}
- Peso: ${r.weight ? r.weight + ' kg' : 'No registrado'}
- Porciones: P:${r.portions.P}/${r.goals.P} C:${r.portions.C}/${r.goals.C} G:${r.portions.G}/${r.goals.G} V:${r.portions.V}/${r.goals.V}
- Cumplimiento: P:${r.compliance.P}% C:${r.compliance.C}% G:${r.compliance.G}% V:${r.compliance.V}%${r.quality && (r.quality.comerMas + r.quality.comerOcasionalmente + r.quality.comerMenos) > 0 ? `
- Calidad: Más:${r.quality.comerMas}% Ocasional:${r.quality.comerOcasionalmente}% Menos:${r.quality.comerMenos}%` : ''}
`).join('')}

Generado por SaidCoach - ${new Date().toLocaleDateString('es-ES')}
    `.trim();
  };

  const handleSendReport = async () => {
    if (!coachEmail || !userProfile) {
      alert('Por favor ingresa el email de tu coach');
      return;
    }

    setIsSending(true);
    
    try {
      // Simular envío de email
      // En una implementación real, aquí llamarías a tu API
      console.log('Sending report to:', coachEmail, 'for:', userProfile.name);
      
      // Por ahora, simplemente copiar al clipboard
      await navigator.clipboard.writeText(generateReportText());
      alert(`Reporte copiado al portapapeles.\n\nPuedes enviárselo a tu coach por email o WhatsApp:\n${coachEmail}`);
      
    } catch (error) {
      console.error('Error enviando reporte:', error);
      alert('Error al procesar el reporte. Intenta de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  const handleEditDay = (report: DailyReport) => {
    setEditingReport(report);
    setEditingPortions(report.portions);
    setEditingWeight(report.weight?.toString() || '');
    setIsEditingDay(true);
  };

  const handleSaveEditDay = async () => {
    if (!editingReport || !userProfile) return;

    const activeUserCode = localStorage.getItem('active-user-code');
    if (!activeUserCode) {
      alert('Error: No se encontró código de usuario.');
      return;
    }

    try {
      // Usar los datos originales como base y solo actualizar los totales
      let fullPortions;
      
      if (editingReport.originalPortions) {
        // Si tenemos los datos originales detallados, usarlos como base
        const original = editingReport.originalPortions;
        const originalTotalP = original.P.P1 + original.P.P2 + original.P.P3;
        const originalTotalC = original.C.C1 + original.C.C2 + original.C.C3;
        const originalTotalG = original.G.G1 + original.G.G2 + original.G.G3;
        
        // Calcular factores de escala para mantener las proporciones
        const scaleP = originalTotalP > 0 ? editingPortions.P / originalTotalP : 0;
        const scaleC = originalTotalC > 0 ? editingPortions.C / originalTotalC : 0;
        const scaleG = originalTotalG > 0 ? editingPortions.G / originalTotalG : 0;
        
        fullPortions = {
          P: {
            P1: Math.round(original.P.P1 * scaleP * 10) / 10,
            P2: Math.round(original.P.P2 * scaleP * 10) / 10,
            P3: Math.round(original.P.P3 * scaleP * 10) / 10
          },
          C: {
            C1: Math.round(original.C.C1 * scaleC * 10) / 10,
            C2: Math.round(original.C.C2 * scaleC * 10) / 10,
            C3: Math.round(original.C.C3 * scaleC * 10) / 10
          },
          G: {
            G1: Math.round(original.G.G1 * scaleG * 10) / 10,
            G2: Math.round(original.G.G2 * scaleG * 10) / 10,
            G3: Math.round(original.G.G3 * scaleG * 10) / 10
          },
          V: editingPortions.V
        };
      } else {
        // Fallback: si no hay datos originales, poner todo en calidad 1
        fullPortions = {
          P: { P1: editingPortions.P, P2: 0, P3: 0 },
          C: { C1: editingPortions.C, C2: 0, C3: 0 },
          G: { G1: editingPortions.G, G2: 0, G3: 0 },
          V: editingPortions.V
        };
      }

      // Guardar porciones en localStorage
      localStorage.setItem(
        `portions-${activeUserCode}-${editingReport.date}`, 
        JSON.stringify(fullPortions)
      );

      // Guardar porciones en la base de datos (Redis)
      await fetch('/api/portions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCode: activeUserCode,
          date: editingReport.date,
          portions: fullPortions,
          isFinished: true // Mantener como finalizado
        })
      });

      // Guardar peso si se proporcionó
      if (editingWeight && parseFloat(editingWeight) > 0) {
        const weightData = {
          weight: parseFloat(editingWeight),
          date: editingReport.date,
          notes: ''
        };
        
        localStorage.setItem(
          `weight-${activeUserCode}-${editingReport.date}`, 
          JSON.stringify(weightData)
        );

        // Guardar peso en la base de datos
        await fetch('/api/weight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userCode: activeUserCode,
            date: editingReport.date,
            weight: weightData
          })
        });
      }

      // Recargar datos para actualizar el reporte
      loadReportsData();
      
      // Cerrar modal
      setIsEditingDay(false);
      setEditingReport(null);
      
      alert('Día actualizado y guardado en la base de datos');
      
    } catch (error) {
      console.error('Error guardando cambios:', error);
      alert('Error al guardar los cambios. Verifica tu conexión.');
    }
  };

  const handleCancelEditDay = () => {
    setIsEditingDay(false);
    setEditingReport(null);
    setEditingPortions({ P: 0, C: 0, G: 0, V: 0 });
    setEditingWeight('');
  };

  const handleDeleteDay = async (report: DailyReport) => {
    const activeUserCode = localStorage.getItem('active-user-code');
    if (!activeUserCode) {
      alert('Error: No se encontró código de usuario.');
      return;
    }

    const confirmDelete = confirm(
      `¿Estás seguro de que deseas eliminar el registro del ${new Date(report.date).toLocaleDateString('es-ES')}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/portions?userCode=${activeUserCode}&date=${encodeURIComponent(report.date)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Recargar datos para actualizar la vista
        await loadReportsData();
        alert('Registro eliminado exitosamente');
      } else {
        throw new Error('Error al eliminar el registro');
      }
    } catch (error) {
      console.error('Error eliminando registro:', error);
      alert('Error al eliminar el registro. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Historial Nutricional</h1>
          <p className="text-gray-700 text-lg">Revisa y edita tus días registrados</p>
        </div>

        {userProfile && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email del Coach
                </label>
                <input
                  type="email"
                  value={coachEmail}
                  onChange={(e) => setCoachEmail(e.target.value)}
                  placeholder="coach@ejemplo.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período del Reporte
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={7}>Últimos 7 días</option>
                  <option value={14}>Últimos 14 días</option>
                  <option value={30}>Último mes</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleSendReport}
              disabled={isSending || !coachEmail}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isSending ? 'Preparando...' : 'Enviar Reporte al Coach'}
            </button>
          </div>
        )}

        {reports.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen de {dateRange} días</h2>
            
            {/* Gráfico de Calidad Nutricional Promedio */}
            {(() => {
              const avgQuality = reports.filter(r => r.quality && (r.quality.comerMas + r.quality.comerOcasionalmente + r.quality.comerMenos) > 0);
              
              if (avgQuality.length > 0) {
                const avgComerMas = Math.round(avgQuality.reduce((sum, r) => sum + r.quality!.comerMas, 0) / avgQuality.length);
                const avgComerOcasionalmente = Math.round(avgQuality.reduce((sum, r) => sum + r.quality!.comerOcasionalmente, 0) / avgQuality.length);
                const avgComerMenos = Math.round(avgQuality.reduce((sum, r) => sum + r.quality!.comerMenos, 0) / avgQuality.length);

                return (
                  <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Calidad Nutricional Promedio</h3>
                    
                    {/* Barra de progreso tricolor */}
                    <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden mb-4">
                      <div 
                        className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${avgComerMas}%` }}
                      >
                        {avgComerMas > 15 && `${avgComerMas}%`}
                      </div>
                      <div 
                        className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${avgComerOcasionalmente}%` }}
                      >
                        {avgComerOcasionalmente > 15 && `${avgComerOcasionalmente}%`}
                      </div>
                      <div 
                        className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${avgComerMenos}%` }}
                      >
                        {avgComerMenos > 15 && `${avgComerMenos}%`}
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-gray-900">Comer Más</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">{avgComerMas}%</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-gray-900">Ocasionalmente</span>
                        </div>
                        <div className="text-lg font-bold text-yellow-600">{avgComerOcasionalmente}%</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-gray-900">Comer Menos</span>
                        </div>
                        <div className="text-lg font-bold text-red-600">{avgComerMenos}%</div>
                      </div>
                    </div>

                    {/* Mensaje de evaluación */}
                    <div className="mt-4 text-center">
                      {avgComerMas >= 70 ? (
                        <span className="text-green-700 font-medium text-sm">
                          Excelente calidad nutricional promedio
                        </span>
                      ) : avgComerMas >= 50 ? (
                        <span className="text-yellow-700 font-medium text-sm">
                          Buena calidad, con oportunidad de mejora
                        </span>
                      ) : (
                        <span className="text-red-700 font-medium text-sm">
                          Enfoque en mejorar la calidad de los alimentos
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Fecha</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-900">Peso</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-900">Proteína</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-900">Carbos</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-900">Grasas</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-900">Verduras</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {new Date(report.date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-4 py-2 text-center text-sm text-gray-900 font-medium">
                        {report.weight ? `${report.weight} kg` : '-'}
                      </td>
                      <td className="px-4 py-2 text-center text-sm">
                        <div className="text-gray-900 font-medium">{report.portions.P}/{report.goals.P}</div>
                        <div className={`text-xs ${getComplianceColor(report.compliance.P)}`}>
                          {report.compliance.P}%
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center text-sm">
                        <div className="text-gray-900 font-medium">{report.portions.C}/{report.goals.C}</div>
                        <div className={`text-xs ${getComplianceColor(report.compliance.C)}`}>
                          {report.compliance.C}%
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center text-sm">
                        <div className="text-gray-900 font-medium">{report.portions.G}/{report.goals.G}</div>
                        <div className={`text-xs ${getComplianceColor(report.compliance.G)}`}>
                          {report.compliance.G}%
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center text-sm">
                        <div className="text-gray-900 font-medium">{report.portions.V}/{report.goals.V}</div>
                        <div className={`text-xs ${getComplianceColor(report.compliance.V)}`}>
                          {report.compliance.V}%
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center text-sm">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditDay(report)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteDay(report)}
                            className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-center">
          <a 
            href="/dashboard/contador"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Volver al Contador
          </a>
        </div>

        {/* Modal de edición de día */}
        {isEditingDay && editingReport && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-xl font-semibold mb-4">
                Editar día {new Date(editingReport.date).toLocaleDateString('es-ES')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingWeight}
                    onChange={(e) => setEditingWeight(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 65.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proteína (palmas)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingPortions.P}
                      onChange={(e) => setEditingPortions(prev => ({
                        ...prev,
                        P: parseFloat(e.target.value) || 0
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carbohidratos (puños)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingPortions.C}
                      onChange={(e) => setEditingPortions(prev => ({
                        ...prev,
                        C: parseFloat(e.target.value) || 0
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grasas (pulgares)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={editingPortions.G}
                      onChange={(e) => setEditingPortions(prev => ({
                        ...prev,
                        G: parseFloat(e.target.value) || 0
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verduras (puños)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={editingPortions.V}
                      onChange={(e) => setEditingPortions(prev => ({
                        ...prev,
                        V: parseFloat(e.target.value) || 0
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleSaveEditDay}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={handleCancelEditDay}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}