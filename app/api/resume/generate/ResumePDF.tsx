import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile, GeneratedContent } from "@/types";

const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#374151";
const TEXT_MUTED = "#6B7280";
const BORDER = "#D1D5DB";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: TEXT_PRIMARY,
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    lineHeight: 1.4,
  },
  // Header
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 16,
  },
  contact: {
    fontSize: 9,
    color: TEXT_MUTED,
    marginBottom: 14,
  },
  // Section
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: TEXT_SECONDARY,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    paddingBottom: 3,
    marginBottom: 8,
  },
  // Summary
  paragraph: {
    fontSize: 10,
    color: TEXT_PRIMARY,
    lineHeight: 1.5,
  },
  // Skills
  skillRow: {
    marginBottom: 3,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillCategory: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: TEXT_PRIMARY,
  },
  skillItems: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: TEXT_PRIMARY,
  },
  // Work experience
  jobBlock: {
    marginBottom: 10,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  jobLeft: {
    flex: 1,
    paddingRight: 10,
  },
  jobRight: {
    flexShrink: 0,
  },
  jobTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: TEXT_PRIMARY,
  },
  jobCompanyInline: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: TEXT_MUTED,
  },
  jobDates: {
    fontSize: 9,
    color: TEXT_MUTED,
    textAlign: "right",
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
    color: TEXT_PRIMARY,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: TEXT_PRIMARY,
    lineHeight: 1.4,
  },
  // Education
  eduBlock: {
    marginBottom: 4,
  },
  eduDegree: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  eduDetail: {
    fontSize: 9,
    color: TEXT_MUTED,
  },
});

type Props = {
  profile: Profile;
  generated: GeneratedContent;
};

function formatDateRange(
  startMonth: string,
  startYear: string,
  endMonth?: string,
  endYear?: string,
  current?: boolean
): string {
  const start = [startMonth, startYear].filter(Boolean).join(" ");
  const end = current ? "Present" : [endMonth, endYear].filter(Boolean).join(" ");
  return end ? `${start} – ${end}` : start;
}

export function ResumePDF({ profile, generated }: Props) {
  const contactParts = [
    profile.email,
    profile.phone,
    profile.location,
    profile.linkedin_url,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <Text style={styles.name}>{profile.full_name ?? ""}</Text>
        <Text style={styles.contact}>{contactParts.join("  |  ")}</Text>

        {/* Summary */}
        {generated.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Summary</Text>
            <Text style={styles.paragraph}>{generated.summary}</Text>
          </View>
        )}

        {/* Technical Skills — categorized */}
        {generated.categorizedSkills && generated.categorizedSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Technical Skills</Text>
            {generated.categorizedSkills.map((cat, i) => (
              <View key={i} style={styles.skillRow}>
                <Text>
                  <Text style={styles.skillCategory}>{cat.category}: </Text>
                  <Text style={styles.skillItems}>{cat.items.join(", ")}</Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Work Experience */}
        {generated.enhancedExperiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Work Experience</Text>
            {generated.enhancedExperiences.map((exp, i) => {
              const raw = (profile.work_experience ?? [])[i];
              const dateRange = raw
                ? formatDateRange(raw.startMonth, raw.startYear, raw.endMonth, raw.endYear, raw.current)
                : "";
              return (
                <View key={i} style={styles.jobBlock} >
                  <View style={styles.jobHeader}>
                    <View style={styles.jobLeft}>
                      <Text>
                        <Text style={styles.jobTitle}>{exp.title}</Text>
                        {exp.company ? (
                          <Text style={styles.jobCompanyInline}>, {exp.company}</Text>
                        ) : null}
                      </Text>
                    </View>
                    {dateRange && (
                      <View style={styles.jobRight}>
                        <Text style={styles.jobDates}>{dateRange}</Text>
                      </View>
                    )}
                  </View>
                  {exp.bullets.map((bullet, j) => (
                    <View key={j} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {/* Education */}
        {profile.education && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Education</Text>
            <View style={styles.eduBlock}>
              <Text style={styles.eduDegree}>
                {[profile.education.degree, profile.education.field].filter(Boolean).join(" in ")}
              </Text>
              <Text style={styles.eduDetail}>
                {[profile.education.institution, profile.education.graduationYear]
                  .filter(Boolean)
                  .join("  |  ")}
              </Text>
            </View>
          </View>
        )}

      </Page>
    </Document>
  );
}
