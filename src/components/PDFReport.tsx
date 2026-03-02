import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { TALENTS } from '@/lib/talents';

// Tipos
type TalentScore = {
  id: number;
  title: string;
  percentage: number;
  summary: string;
};

type PDFReportProps = {
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string;
  genero: string;
  curso: string;
  modalidad: string;
  centroEducativo: string;
  top3Talents: TalentScore[];
  allTalents: Array<{
    id: number;
    label: string;
    percentage: number;
  }>;
  selectedCareers: string[];
  customCareers: string;
  ideaCarreraTexto?: string;
};

// Estilos
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #3b82f6',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: '35%',
    fontWeight: 'bold',
    color: '#4b5563',
  },
  infoValue: {
    width: '65%',
    color: '#111827',
  },
  talentCard: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    border: '1 solid #e5e7eb',
  },
  talentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  talentRank: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  talentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  talentPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  talentSummary: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  wheelSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    border: '1 solid #bfdbfe',
  },
  wheelTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    textAlign: 'center',
  },
  wheelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wheelItem: {
    width: '23%',
    marginBottom: 8,
    padding: 6,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    border: '1 solid #e5e7eb',
  },
  wheelLabel: {
    fontSize: 8,
    color: '#374151',
    marginBottom: 3,
  },
  wheelPercentage: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  careersList: {
    marginTop: 8,
  },
  careerItem: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 3,
    paddingLeft: 10,
  },
  careerBullet: {
    fontSize: 9,
    color: '#3b82f6',
    marginRight: 5,
  },
  customBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    border: '1 solid #fbbf24',
  },
  customLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 5,
  },
  customText: {
    fontSize: 9,
    color: '#78350f',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
  pageNumber: {
    fontSize: 8,
    color: '#9ca3af',
  },
});

const PDFReport: React.FC<PDFReportProps> = ({
  nombre,
  apellido,
  email,
  fechaNacimiento,
  genero,
  curso,
  modalidad,
  centroEducativo,
  top3Talents,
  allTalents,
  selectedCareers,
  customCareers,
  ideaCarreraTexto,
}) => {
  const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      {/* Página 1: Datos y Top 3 */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Informe de Talentos</Text>
          <Text style={styles.subtitle}>
            Orientación Profesional basada en Neurociencia Aplicada
          </Text>
          <Text style={styles.subtitle}>Fecha: {fechaGeneracion}</Text>
        </View>

        {/* Datos del estudiante */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del estudiante</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre completo:</Text>
            <Text style={styles.infoValue}>{nombre} {apellido}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Correo electrónico:</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de nacimiento:</Text>
            <Text style={styles.infoValue}>{fechaNacimiento}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Género:</Text>
            <Text style={styles.infoValue}>{genero}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Curso:</Text>
            <Text style={styles.infoValue}>{curso}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Modalidad:</Text>
            <Text style={styles.infoValue}>{modalidad}</Text>
          </View>
          {centroEducativo && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Centro educativo:</Text>
              <Text style={styles.infoValue}>{centroEducativo}</Text>
            </View>
          )}
        </View>

        {/* Idea de carrera inicial */}
        {ideaCarreraTexto && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Idea inicial de carrera</Text>
            <Text style={styles.talentSummary}>{ideaCarreraTexto}</Text>
          </View>
        )}

        {/* Top 3 Talentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tus 3 Talentos Más Destacados</Text>
          {top3Talents.map((talent, idx) => (
            <View key={talent.id} style={styles.talentCard}>
              <View style={styles.talentHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={styles.talentRank}>#{idx + 1}</Text>
                  <Text style={[styles.talentTitle, { marginLeft: 8 }]}>{talent.title}</Text>
                </View>
                <Text style={styles.talentPercentage}>{talent.percentage}%</Text>
              </View>
              <Text style={styles.talentSummary}>{talent.summary}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${talent.percentage}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Página 1 de 2</Text>
      </Page>

      {/* Página 2: Mapa completo y profesiones */}
      <Page size="A4" style={styles.page}>
        {/* Mapa de todos los talentos (roscón) */}
        <View style={styles.wheelSection}>
          <Text style={styles.wheelTitle}>Mapa Visual de Talentos (Distribución Completa)</Text>
          <View style={styles.wheelGrid}>
            {allTalents.map((talent) => (
              <View key={talent.id} style={styles.wheelItem}>
                <Text style={styles.wheelLabel}>{talent.label}</Text>
                <Text style={styles.wheelPercentage}>{talent.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Profesiones seleccionadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profesiones Seleccionadas</Text>
          {selectedCareers.length > 0 ? (
            <View style={styles.careersList}>
              {selectedCareers.map((career, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={styles.careerBullet}>•</Text>
                  <Text style={styles.careerItem}>{career}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.talentSummary}>No se seleccionaron profesiones de la lista sugerida.</Text>
          )}
        </View>

        {/* Profesiones personalizadas */}
        {customCareers && customCareers.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profesiones Personalizadas (Escritas a Mano)</Text>
            <View style={styles.customBox}>
              <Text style={styles.customLabel}>
                🎯 Aspiraciones profesionales propias del estudiante:
              </Text>
              <Text style={styles.customText}>{customCareers}</Text>
            </View>
          </View>
        )}

        {/* Interpretación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interpretación de Resultados</Text>
          <Text style={styles.talentSummary}>
            Este informe refleja las preferencias y aptitudes del estudiante según el cuestionario basado
            en neurociencia aplicada. Los porcentajes indican la intensidad de cada talento.
          </Text>
          <Text style={[styles.talentSummary, { marginTop: 6 }]}>
            Las profesiones seleccionadas muestran la alineación del estudiante con las sugerencias del sistema,
            mientras que las profesiones personalizadas revelan sus aspiraciones únicas, que pueden no coincidir
            con las recomendaciones automáticas pero son igualmente válidas y deben ser consideradas en la
            orientación profesional.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Página 2 de 2 - Informe generado automáticamente</Text>
      </Page>
    </Document>
  );
};

export default PDFReport;
