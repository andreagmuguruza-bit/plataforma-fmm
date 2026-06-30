export interface AlertInfo {
  number: number;
  color: 'red' | 'yellow' | 'green';
  title: string;
}

export function getAlertsForProject(projectId: string): AlertInfo[] {
  const alerts: AlertInfo[] = [];

  // Card 1
  if (['ME-L1309', 'UR-L1205'].includes(projectId)) {
    alerts.push({ number: 1, color: 'yellow', title: 'Pending legal effectiveness' });
  } else if (['BR-L1656', 'BR-L1658', 'BR-L1629', 'AR-L1416'].includes(projectId)) {
    alerts.push({ number: 1, color: 'green', title: 'Pending legal effectiveness' });
  }

  // Card 2
  if (['PE-L1288'].includes(projectId)) {
    alerts.push({ number: 2, color: 'red', title: 'Pending eligibility' });
  }

  // Card 3
  if (['PE-L1278'].includes(projectId)) {
    alerts.push({ number: 3, color: 'yellow', title: 'Pending first disbursement' });
  }

  // Card 4
  if (['PN-L1172', 'PN-L1161', 'BL-L1031'].includes(projectId)) {
    alerts.push({ number: 4, color: 'red', title: 'Projects without disbursements' });
  } else if (['AR-L1248', 'AR-L1285', 'SU-L1060', 'BR-L1525', 'BL-L1038'].includes(projectId)) {
    alerts.push({ number: 4, color: 'yellow', title: 'Projects without disbursements' });
  } else if (['BR-L1517', 'PR-L1150', 'PR-L1192', 'BR-L1527'].includes(projectId)) {
    alerts.push({ number: 4, color: 'green', title: 'Projects without disbursements' });
  }

  // Card 5
  if (['PE-L1266', 'EC-L1253', 'PN-L1172', 'UR-L1164', 'SU-L1060'].includes(projectId)) {
    alerts.push({ number: 5, color: 'yellow', title: 'Disbursed life amount' });
  } else if ([
    'UR-L1111', 'BR-L1377', 'BR-L1511', 'BR-L1534', 'EC-L1251',
    'EC-L1230', 'BL-L1031', 'PE-L1231', 'BR-L1501', 'BR-L1516',
    'PE-L1239', 'BR-L1527', 'AR-L1248', 'BR-L1535', 'BR-L1550',
    'BR-L1533', 'BR-L1517', 'PR-L1150', 'BL-L1038', 'CO-L1164',
    'CO-L1245', 'PN-L1161', 'AR-L1285'
  ].includes(projectId)) {
    alerts.push({ number: 5, color: 'green', title: 'Disbursed life amount' });
  }

  // Card 6
  if ([
    'EC-L1230', 'AR-L1285', 'CO-L1164', 'CO-L1245', 'PN-L1161',
    'PE-L1266', 'BL-L1038', 'PN-L1172', 'EC-L1253', 'UR-L1164',
    'CH-L1178', 'BR-L1592', 'BR-L1614', 'PE-L1278'
  ].includes(projectId)) {
    alerts.push({ number: 6, color: 'yellow', title: 'PMR performance (last 3 cycles)' });
  } else if ([
    'AR-L1416', 'BR-L1629', 'BR-L1656', 'BR-L1658', 'ME-L1309',
    'PE-L1288', 'UR-L1205', 'AR-L1248', 'UR-L1111', 'BR-L1377',
    'PE-L1231', 'PE-L1239', 'BR-L1501', 'BR-L1511', 'BR-L1516',
    'BL-L1031', 'EC-L1251', 'BR-L1527', 'PR-L1150', 'BR-L1534',
    'BR-L1535', 'BR-L1517', 'BR-L1533', 'BR-L1550', 'SU-L1060',
    'BR-L1539', 'BR-L1540', 'UR-L1193', 'BR-L1599', 'BR-L1513',
    'BR-L1525', 'AR-L1405', 'PR-L1192', 'BR-L1643'
  ].includes(projectId)) {
    alerts.push({ number: 6, color: 'green', title: 'PMR performance (last 3 cycles)' });
  }

  // Card 7
  if (['BR-L1377', 'UR-L1111'].includes(projectId)) {
    alerts.push({ number: 7, color: 'yellow', title: 'Partial cancellations' });
  } else if (['EC-L1230', 'PE-L1231'].includes(projectId)) {
    alerts.push({ number: 7, color: 'red', title: 'Partial cancellations' });
  } else if ([
    'AR-L1416', 'BR-L1629', 'BR-L1656', 'BR-L1658', 'ME-L1309',
    'PE-L1288', 'UR-L1205', 'AR-L1248', 'PE-L1239', 'BR-L1501',
    'BR-L1511', 'AR-L1285', 'CO-L1164', 'BR-L1516', 'BL-L1031',
    'BR-L1527', 'CO-L1245', 'PR-L1150', 'BR-L1534', 'PN-L1161',
    'PE-L1266', 'BR-L1535', 'BR-L1517', 'BR-L1533', 'BL-L1038',
    'PN-L1172', 'BR-L1550', 'EC-L1253', 'SU-L1060', 'BR-L1539',
    'BR-L1540', 'UR-L1164', 'UR-L1193', 'BR-L1599', 'BR-L1513',
    'BR-L1525', 'CH-L1178', 'BR-L1592', 'AR-L1405', 'PR-L1192',
    'BR-L1643', 'BR-L1614', 'PE-L1278', 'EC-L1251'
  ].includes(projectId)) {
    alerts.push({ number: 7, color: 'green', title: 'Partial cancellations' });
  }

  // Card 8
  if (['BR-L1534', 'BR-L1511', 'BR-L1377', 'EC-L1230', 'UR-L1111'].includes(projectId)) {
    alerts.push({ number: 8, color: 'yellow', title: 'Expired disbursement deadline' });
  } else if (['AR-L1248'].includes(projectId)) {
    alerts.push({ number: 8, color: 'green', title: 'Expired disbursement deadline' });
  }

  return alerts;
}

export function getAlertTagForProject(projectId: string, alertNumber: number): { tag: string; color: 'red' | 'yellow' | 'green' | 'grey' } {
  switch (alertNumber) {
    case 1:
      if (['ME-L1309', 'UR-L1205'].includes(projectId)) {
        return { tag: '+3 meses de extensión', color: 'yellow' };
      }
      if (['BR-L1656', 'BR-L1658', 'BR-L1629', 'AR-L1416'].includes(projectId)) {
        return { tag: 'Dentro del plazo (OA-420/423)', color: 'green' };
      }
      return { tag: 'N/A', color: 'grey' };
    case 2:
      if (['PE-L1288'].includes(projectId)) {
        return { tag: '+6 meses de extensión', color: 'red' };
      }
      return { tag: 'N/A', color: 'grey' };
    case 3:
      if (['PE-L1278'].includes(projectId)) {
        return { tag: '1-6 meses de retraso', color: 'yellow' };
      }
      return { tag: 'N/A', color: 'grey' };
    case 4:
      if (['PN-L1172', 'PN-L1161', 'BL-L1031'].includes(projectId)) {
        return { tag: '+12 meses transcurridos', color: 'red' };
      }
      if (['AR-L1248', 'AR-L1285', 'SU-L1060', 'BR-L1525', 'BL-L1038'].includes(projectId)) {
        return { tag: '7-12 meses transcurridos', color: 'yellow' };
      }
      if (['BR-L1517', 'PR-L1150', 'PR-L1192', 'BR-L1527'].includes(projectId)) {
        return { tag: '6 meses transcurridos', color: 'green' };
      }
      return { tag: 'N/A', color: 'grey' };
    case 5:
      if (['PE-L1266', 'EC-L1253', 'PN-L1172', 'UR-L1164', 'SU-L1060'].includes(projectId)) {
        return { tag: '10%-25% Desembolsado', color: 'yellow' };
      }
      return { tag: '>25% Desembolsado', color: 'green' };
    case 6:
      const yellow6 = [
        'EC-L1230', 'AR-L1285', 'CO-L1164', 'CO-L1245', 'PN-L1161',
        'PE-L1266', 'BL-L1038', 'PN-L1172', 'EC-L1253', 'UR-L1164',
        'CH-L1178', 'BR-L1592', 'BR-L1614', 'PE-L1278'
      ];
      if (yellow6.includes(projectId)) {
        return { tag: 'Con alerta o problema: 1-2', color: 'yellow' };
      }
      return { tag: 'Sin alerta o problema', color: 'green' };
    case 7:
      if (['EC-L1230', 'PE-L1231'].includes(projectId)) {
        return { tag: 'Cancelación > 15%', color: 'red' };
      }
      if (['BR-L1377', 'UR-L1111'].includes(projectId)) {
        return { tag: 'Cancelación Hasta 15%', color: 'yellow' };
      }
      return { tag: 'Sin cancelación parcial', color: 'green' };
    case 8:
      if (['BR-L1534', 'BR-L1511', 'BR-L1377', 'EC-L1230', 'UR-L1111'].includes(projectId)) {
        return { tag: '5-12 meses atrasado', color: 'yellow' };
      }
      if (['AR-L1248'].includes(projectId)) {
        return { tag: '0-4 meses atrasado', color: 'green' };
      }
      return { tag: 'N/A', color: 'grey' };
    default:
      return { tag: 'N/A', color: 'grey' };
  }
}
