export class ReportGenerator {
  // Générer un rapport financier
  static generateFinancialReport(data: {
    period: string;
    totalRevenue: number;
    totalExpenses: number;
    paymentsByMethod: Array<{ method: string; amount: number; percentage: number }>;
    outstandingPayments: Array<{ level: string; amount: number; students: number }>;
    schoolName: string;
  }) {
    const report = {
      title: `Rapport Financier - ${data.period}`,
      school: data.schoolName,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue: data.totalRevenue,
        totalExpenses: data.totalExpenses,
        netProfit: data.totalRevenue - data.totalExpenses,
        profitMargin: ((data.totalRevenue - data.totalExpenses) / data.totalRevenue) * 100
      },
      paymentMethods: data.paymentsByMethod,
      outstandingPayments: data.outstandingPayments,
      recommendations: this.generateFinancialRecommendations(data)
    };

    return report;
  }

  // Générer un rapport académique
  static generateAcademicReport(data: {
    period: string;
    classes: Array<{
      name: string;
      studentCount: number;
      averageGrade: number;
      passRate: number;
      subjects: Array<{ name: string; average: number }>;
    }>;
    schoolName: string;
  }) {
    const totalStudents = data.classes.reduce((sum, c) => sum + c.studentCount, 0);
    const overallAverage = data.classes.reduce((sum, c) => sum + (c.averageGrade * c.studentCount), 0) / totalStudents;
    const overallPassRate = data.classes.reduce((sum, c) => sum + (c.passRate * c.studentCount), 0) / totalStudents;

    const report = {
      title: `Rapport Académique - ${data.period}`,
      school: data.schoolName,
      generatedAt: new Date().toISOString(),
      summary: {
        totalStudents,
        totalClasses: data.classes.length,
        overallAverage: overallAverage,
        overallPassRate: overallPassRate
      },
      classSummary: data.classes.map(cls => ({
        ...cls,
        performance: this.getPerformanceLevel(cls.averageGrade),
        trend: this.calculateTrend(cls.averageGrade, overallAverage)
      })),
      subjectAnalysis: this.analyzeSubjectPerformance(data.classes),
      recommendations: this.generateAcademicRecommendations(data.classes)
    };

    return report;
  }

  // Générer un rapport de présence
  static generateAttendanceReport(data: {
    period: string;
    students: Array<{
      name: string;
      class: string;
      totalDays: number;
      presentDays: number;
      absentDays: number;
      tardiness: number;
    }>;
    schoolName: string;
  }) {
    const totalStudents = data.students.length;
    const averageAttendance = data.students.reduce((sum, s) => sum + (s.presentDays / s.totalDays), 0) / totalStudents * 100;

    const report = {
      title: `Rapport de Présence - ${data.period}`,
      school: data.schoolName,
      generatedAt: new Date().toISOString(),
      summary: {
        totalStudents,
        averageAttendance,
        excellentAttendance: data.students.filter(s => (s.presentDays / s.totalDays) >= 0.95).length,
        poorAttendance: data.students.filter(s => (s.presentDays / s.totalDays) < 0.80).length
      },
      studentDetails: data.students.map(student => ({
        ...student,
        attendanceRate: (student.presentDays / student.totalDays) * 100,
        status: this.getAttendanceStatus(student.presentDays / student.totalDays)
      })),
      recommendations: this.generateAttendanceRecommendations(data.students)
    };

    return report;
  }

  // Exporter en CSV
  static exportToCSV(data: any[], filename: string) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Échapper les guillemets et entourer de guillemets si nécessaire
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Exporter en JSON
  static exportToJSON(data: any, filename: string) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Fonctions utilitaires privées
  private static generateFinancialRecommendations(data: any) {
    const recommendations = [];
    
    const profitMargin = ((data.totalRevenue - data.totalExpenses) / data.totalRevenue) * 100;
    
    if (profitMargin < 20) {
      recommendations.push('Marge bénéficiaire faible - réviser les coûts ou augmenter les revenus');
    }
    
    const outstandingTotal = data.outstandingPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const outstandingRate = (outstandingTotal / data.totalRevenue) * 100;
    
    if (outstandingRate > 15) {
      recommendations.push('Taux d\'impayés élevé - renforcer le suivi des paiements');
    }

    return recommendations;
  }

  private static generateAcademicRecommendations(classes: any[]) {
    const recommendations = [];
    
    const lowPerformingClasses = classes.filter(c => c.averageGrade < 10);
    if (lowPerformingClasses.length > 0) {
      recommendations.push(`${lowPerformingClasses.length} classe(s) avec moyenne < 10/20 - soutien pédagogique nécessaire`);
    }
    
    const lowPassRateClasses = classes.filter(c => c.passRate < 70);
    if (lowPassRateClasses.length > 0) {
      recommendations.push(`${lowPassRateClasses.length} classe(s) avec taux de réussite < 70% - réviser les méthodes d'enseignement`);
    }

    return recommendations;
  }

  private static generateAttendanceRecommendations(students: any[]) {
    const recommendations = [];
    
    const poorAttendanceStudents = students.filter(s => (s.presentDays / s.totalDays) < 0.80);
    if (poorAttendanceStudents.length > 0) {
      recommendations.push(`${poorAttendanceStudents.length} élève(s) avec assiduité < 80% - contacter les familles`);
    }

    return recommendations;
  }

  private static getPerformanceLevel(average: number): string {
    if (average >= 16) return 'Excellent';
    if (average >= 14) return 'Très Bien';
    if (average >= 12) return 'Bien';
    if (average >= 10) return 'Passable';
    return 'Insuffisant';
  }

  private static calculateTrend(classAverage: number, overallAverage: number): string {
    const diff = classAverage - overallAverage;
    if (diff > 1) return 'Au-dessus de la moyenne';
    if (diff < -1) return 'En-dessous de la moyenne';
    return 'Dans la moyenne';
  }

  private static analyzeSubjectPerformance(classes: any[]) {
    const subjectStats: Record<string, { total: number; count: number; average: number }> = {};
    
    classes.forEach(cls => {
      cls.subjects.forEach((subject: any) => {
        if (!subjectStats[subject.name]) {
          subjectStats[subject.name] = { total: 0, count: 0, average: 0 };
        }
        subjectStats[subject.name].total += subject.average * cls.studentCount;
        subjectStats[subject.name].count += cls.studentCount;
      });
    });

    return Object.entries(subjectStats).map(([name, stats]) => ({
      subject: name,
      average: stats.total / stats.count,
      performance: this.getPerformanceLevel(stats.total / stats.count)
    })).sort((a, b) => b.average - a.average);
  }

  private static getAttendanceStatus(rate: number): string {
    if (rate >= 0.95) return 'Excellent';
    if (rate >= 0.90) return 'Très Bien';
    if (rate >= 0.80) return 'Bien';
    if (rate >= 0.70) return 'Passable';
    return 'Insuffisant';
  }
}