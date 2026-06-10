import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Invoice, Project } from "@/types";

// Tidak register font custom — pakai Helvetica bawaan untuk compatibility
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1C1917",
    padding: "48pt 52pt",
    backgroundColor: "#FFFFFF",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 36,
  },
  brandBlock: {
    flexDirection: "column",
    gap: 2,
  },
  brandName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1C1917",
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: 8,
    color: "#A8A29E",
    letterSpacing: 0.5,
  },
  invoiceMeta: {
    alignItems: "flex-end",
    flexDirection: "column",
    gap: 3,
  },
  invoiceNumber: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1C1917",
  },
  metaText: {
    fontSize: 9,
    color: "#78716C",
  },
  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
    marginBottom: 24,
  },
  // From/To
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  addressBlock: {
    flexDirection: "column",
    gap: 3,
    maxWidth: 200,
  },
  addressLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#A8A29E",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  addressName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1C1917",
  },
  addressText: {
    fontSize: 9,
    color: "#78716C",
    lineHeight: 1.5,
  },
  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F5F5F4",
    borderRadius: 4,
    padding: "6pt 8pt",
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    padding: "8pt 8pt",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
  },
  colDesc: { flex: 1 },
  colQty: { width: 36, textAlign: "right" },
  colRate: { width: 70, textAlign: "right" },
  colAmount: { width: 70, textAlign: "right" },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#78716C",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  cellText: {
    fontSize: 9.5,
    color: "#1C1917",
  },
  cellMuted: {
    fontSize: 9.5,
    color: "#78716C",
  },
  // Totals
  totalsBlock: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 0,
    marginBottom: 5,
    width: 200,
  },
  totalLabel: {
    fontSize: 9.5,
    color: "#78716C",
    flex: 1,
  },
  totalValue: {
    fontSize: 9.5,
    color: "#1C1917",
    textAlign: "right",
    width: 80,
  },
  totalDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
    width: 200,
    marginBottom: 8,
    marginTop: 4,
  },
  grandTotalRow: {
    flexDirection: "row",
    width: 200,
    marginBottom: 0,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1C1917",
    flex: 1,
  },
  grandTotalValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1C1917",
    textAlign: "right",
    width: 80,
  },
  // Notes
  notesBlock: {
    marginTop: 28,
    padding: "12pt",
    backgroundColor: "#FAFAF9",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  notesLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#A8A29E",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9.5,
    color: "#78716C",
    lineHeight: 1.6,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 32,
    left: 52,
    right: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E7E5E4",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#D6D3D1",
  },
});

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(str: string | null) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface InvoicePDFProps {
  invoice: Invoice;
  project: Project;
  freelancerName: string;
  businessName: string | null;
}

export function InvoicePDF({
  invoice,
  project,
  freelancerName,
  businessName,
}: InvoicePDFProps) {
  const taxAmount = invoice.total - invoice.subtotal;

  return (
    <Document
      title={`Invoice ${invoice.invoice_number}`}
      author={businessName || freelancerName}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>ClientSpace</Text>
            <Text style={styles.brandTagline}>One link. Full clarity.</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceNumber}>
              Invoice #{invoice.invoice_number}
            </Text>
            <Text style={styles.metaText}>
              Dibuat: {formatDate(invoice.created_at)}
            </Text>
            {invoice.due_date && (
              <Text style={styles.metaText}>
                Jatuh tempo: {formatDate(invoice.due_date)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* From / To */}
        <View style={styles.addressRow}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Dari</Text>
            <Text style={styles.addressName}>
              {businessName || freelancerName}
            </Text>
            {businessName && (
              <Text style={styles.addressText}>{freelancerName}</Text>
            )}
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Kepada</Text>
            <Text style={styles.addressName}>{project.client_name}</Text>
            {project.client_email && (
              <Text style={styles.addressText}>{project.client_email}</Text>
            )}
            <Text style={styles.addressText}>{project.title}</Text>
          </View>
        </View>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <View style={styles.colDesc}>
            <Text style={styles.tableHeaderText}>Deskripsi</Text>
          </View>
          <View style={styles.colQty}>
            <Text style={styles.tableHeaderText}>Qty</Text>
          </View>
          <View style={styles.colRate}>
            <Text style={styles.tableHeaderText}>Harga</Text>
          </View>
          <View style={styles.colAmount}>
            <Text style={styles.tableHeaderText}>Total</Text>
          </View>
        </View>

        {/* Table rows */}
        {invoice.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={styles.colDesc}>
              <Text style={styles.cellText}>{item.description}</Text>
            </View>
            <View style={styles.colQty}>
              <Text style={[styles.cellMuted, { textAlign: "right" }]}>
                {item.qty}
              </Text>
            </View>
            <View style={styles.colRate}>
              <Text style={[styles.cellMuted, { textAlign: "right" }]}>
                {formatRupiah(item.rate)}
              </Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={[styles.cellText, { textAlign: "right" }]}>
                {formatRupiah(item.amount)}
              </Text>
            </View>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatRupiah(invoice.subtotal)}
            </Text>
          </View>
          {invoice.tax_rate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                PPN ({invoice.tax_rate}%)
              </Text>
              <Text style={styles.totalValue}>{formatRupiah(taxAmount)}</Text>
            </View>
          )}
          <View style={styles.totalDivider} />
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatRupiah(invoice.total)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>Catatan</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Dibuat dengan ClientSpace
          </Text>
          <Text style={styles.footerText}>
            Invoice #{invoice.invoice_number}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
