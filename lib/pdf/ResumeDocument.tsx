import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#111111",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2pt solid #f5a623",
    paddingBottom: 12,
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    color: "#666",
    flexDirection: "row",
    gap: 12,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#f5a623",
    marginBottom: 6,
  },
  bullet: {
    fontSize: 9.5,
    color: "#333",
    marginBottom: 3,
    paddingLeft: 10,
  },
  body: {
    fontSize: 9.5,
    color: "#333",
    lineHeight: 1.5,
  },
});

interface ResumeData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience: {
    title: string;
    company: string;
    dates: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    school: string;
    dates: string;
  }[];
  skills: string[];
}

export function ResumeDocument({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.name}</Text>
          <View style={styles.contact}>
            <Text>{data.email}</Text>
            {data.phone && <Text>{data.phone}</Text>}
            {data.location && <Text>{data.location}</Text>}
          </View>
        </View>

        {/* Summary */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.body}>{data.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>
                  {exp.title} — {exp.company}
                </Text>
                <Text style={{ fontSize: 8.5, color: "#888", marginBottom: 3 }}>
                  {exp.dates}
                </Text>
                {exp.bullets.map((b, j) => (
                  <Text key={j} style={styles.bullet}>
                    • {b}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>
                  {edu.degree}
                </Text>
                <Text style={{ fontSize: 8.5, color: "#888" }}>
                  {edu.school} · {edu.dates}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.body}>{data.skills.join(" · ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}